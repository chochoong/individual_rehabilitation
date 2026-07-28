# case_search.py
import re
import shutil
import os

from langchain_core.documents import Document
from langchain_community.document_loaders import Docx2txtLoader
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

def parse_korean_money(text):
    """'1억 2천만', '5천5백만' 같은 한글 금액 문자열을 만원 단위 숫자로 변환"""
    if not text:
        return 0

    total = 0
    eok = re.search(r"([0-9]+)\s*억", text)
    cheon = re.search(r"([0-9]+)\s*천", text)
    baek = re.search(r"([0-9]+)\s*백", text)
    man = re.search(r"([0-9,]+)\s*만", text)

    if eok:
        total += int(eok.group(1)) * 10000
    if cheon:
        total += int(cheon.group(1)) * 1000
    if baek:
        total += int(baek.group(1)) * 100
    if man and not cheon and not baek:
        total += int(man.group(1).replace(",", ""))

    return total

def parse_case(file_path: str):
    loader = Docx2txtLoader(file_path)
    docs = loader.load()
    text = docs[0].page_content
    cases = re.split(r"(?=사례\s*\d+)", text)

    documents = []
    for case in cases:
        case = case.strip()
        if not case:
            continue

        income = re.search(r"월 소득[:\s]*([0-9]+)", case)
        payment = re.search(r"월 변제금[:\s]*([0-9]+)", case)
        debt_match = re.search(r"채무 변동[:\s]*([0-9억천백만\s]+)", case)
        job = re.search(r"인적사항.*?/\s*([^/\n]+)\s*/", case)

        documents.append(
            Document(
                page_content=case,
                metadata={
                    "income": int(income.group(1)) if income else 0,
                    "payment": int(payment.group(1)) if payment else 0,
                    "debt": parse_korean_money(debt_match.group(1)) if debt_match else 0,  # ← 숫자로 변환
                    "job": job.group(1).strip() if job else "",
                },
            )
        )
    return documents


embeddings = OpenAIEmbeddings(model="text-embedding-3-small")


def create_vectorstore(documents):
    db_path = "./case_db"
    if os.path.exists(db_path):
        shutil.rmtree(db_path)

    vectorstore = Chroma(
        collection_name="rehabilitation_case",
        embedding_function=embeddings,
        persist_directory=db_path,
    )
    vectorstore.add_documents(documents)
    return vectorstore


# def create_vectorstore(documents):
#     db_path = "./case_db"
#    # DB 폴더가 이미 존재하는 경우 기존 Chroma DB 로드
#     if os.path.exists(db_path) and os.listdir(db_path):
#         print("기존 VectorDB를 로드합니다.")
#         return Chroma(
#             collection_name="rehabilitation_case",
#             persist_directory=db_path,
#             embedding_function=embeddings # 사용 중인 임베딩 객체
#         )
    
#     # DB가 없는 경우에만 새로 생성 및 저장
#     vectorstore = Chroma(
#         collection_name="rehabilitation_case",
#         embedding_function=embeddings,
#         persist_directory=db_path,
#     )
#     vectorstore.add_documents(documents)
#     return vectorstore


class HybridRetriever:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore

    def extract(self, question):
        income = re.search(r"월\s*소득[:\s]*([0-9,]+)", question)
        payment = re.search(r"월\s*변제금[:\s]*([0-9,]+)", question)
        debt = re.search(r"채무\s*(?:총액|변동)?[:\s]*([0-9,]+)", question)
        return {
            "income": int(income.group(1).replace(",", "")) if income else 0,
            "payment": int(payment.group(1).replace(",", "")) if payment else 0,
            "debt": int(debt.group(1).replace(",", "")) if debt else 0,
        }    

    def similarity(self, a, b):
        """상대 오차 기반 유사도 (0~1). 값이 클수록 유사"""
        if a == 0 and b == 0:
            return 1
        denom = max(a, b, 1)  # 0으로 나누기 방지
        diff_ratio = abs(a - b) / denom
        return max(0, 1 - diff_ratio)

    def invoke(self, question):
        user = self.extract(question)
        results = self.vectorstore.similarity_search_with_score(question, k=20)

        reranked = []
        for doc, distance in results:
            embedding_score = 1 - distance

            income_score = self.similarity(user["income"], doc.metadata.get("income", 0))
            debt_score = self.similarity(user["debt"], doc.metadata.get("debt", 0))
            payment_score = self.similarity(user["payment"], doc.metadata.get("payment", 0))

            final_score = (
                income_score * 0.5      # 소득 비중을 더 높임
                + debt_score * 0.3
                + payment_score * 0.2
                + embedding_score * 0.1
            )
            reranked.append({"score": final_score, "doc": doc})

        reranked.sort(key=lambda x: x["score"], reverse=True)
        return [x["doc"] for x in reranked[:3]]


# prompt = ChatPromptTemplate.from_template(
# """
# 당신은 개인회생 사례 분석 전문가입니다.

# 검색된 사례

# {context}

# 사용자 질문

# {question}

# 당신은 개인회생 사례 검색 전문가입니다.

# 검색된 사례 중

# 1. 월 소득
# 2. 채무
# 3. 월 변제금
# 4. 직업
# 5. 회생 사유

# 를 종합적으로 비교하여
# 가장 유사한 사례 3개를 선택하세요.

# 절대로 사례를 요약하거나 다시 작성하지 마세요.

# 선택한 사례의 원문을 그대로 출력하세요.

# 한 글자도 생략하지 말고
# context에 있는 내용을 그대로 복사해서 출력하세요.
# """
# )

prompt = ChatPromptTemplate.from_template(
"""
당신은 개인회생 사례 분석 전문가입니다.

[검색된 사례]
{context}

[사용자 질문]
{question}

사용자의 상황과 [검색된 사례]들을 비교하여 가장 유사한 사례 3개를 선정해 주세요.

유사도 비교 시 아래 요소의 우선순위(가중치 비중)를 차등 적용하여 종합 평가하세요:
- 1순위 (최우선 반영): 월 소득
- 2순위 (높은 반영): 채무 총액
- 3순위 (중간 반영): 월 변제금
- 4순위 (보조 반영): 직업
- 5순위 (참고 반영): 회생 사유

[분석 가이드라인]
1. 1순위(월 소득)와 2순위(채무)가 사용자 상황과 가장 가깝게 일치하는 사례에 높은 유사도 점수를 부여하세요.
2. 3~5순위 조건은 상위 조건이 비슷할 때 후순위 비교 요소로 활용하세요.
3. 가장 높은 유사도 점수를 받은 상위 3개 사례를 선정하세요.

[출력 형식]
선택한 3개 사례의 원문 그대로 출력하세요. (추가 설명이나 요약 없이 원문 유지)
"""
)

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)


# def run(question, retriever):
#     # 1. 유사 사례 검색
#     docs = retriever.invoke(question)
#     context = "\n\n".join(doc.page_content for doc in docs)

#     # 2. Prompt + LLM + OutputParser 체인 생성 및 실행
#     chain = prompt | llm | StrOutputParser()
#     print("===============유사 사례 검색==============",context)
#     # 3. GPT가 분석해준 '최종 답변'을 반환
#     return chain.invoke({"context": context, "question": question})

def run(question, retriever):
    # LLM 호출 없이, retriever의 가중치 기반 로직으로 상위 3개를 그대로 반환
    docs = retriever.invoke(question)
    cases = [doc.page_content for doc in docs]

    print("===============유사 사례 검색(LLM 미사용)==============")
    for i, c in enumerate(cases, 1):
        print(f"--- {i}번째 사례 ---\n{c[:200]}...\n")

    return cases  # 원본 텍스트 그대로, 배열로 반환

# def run(question, retriever):
#     docs = retriever.invoke(question)
#     context = "\n\n".join(doc.page_content for doc in docs)

#     chain = prompt | llm | StrOutputParser()

#     return chain.invoke({"context": context, "question": question})


# ---- 서버 시작 시 한 번만 실행되는 초기화 ----
_documents = parse_case("./data/my_history.docx")
_vectorstore = create_vectorstore(_documents)
retriever = HybridRetriever(_vectorstore)