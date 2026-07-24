import os
from dotenv import load_dotenv
import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI

load_dotenv()
client_llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(CURRENT_DIR, "..", "chroma_db")

db_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = db_client.get_collection(name="individual_rehab_qna")
embed_model = SentenceTransformer("jhgan/ko-sroberta-multitask")


def search(query, top_k=3):
    query_vec = embed_model.encode([query]).tolist()
    results = collection.query(query_embeddings=query_vec, n_results=top_k)
    return results["metadatas"][0]


def rewrite_query_with_context(query, history):
    if not history:
        return query

    history_text = "\n".join(
        [f"사용자: {h['user']}\n챗봇: {h['assistant']}" for h in history[-3:]]
    )

    prompt = f"""아래는 이전 대화 내용입니다.
{history_text}

이어지는 새 질문: "{query}"

이 새 질문이 이전 대화 맥락에 의존하는 짧은 질문이라면, 맥락을 반영해서 완전한 하나의 질문으로 다시 써주세요.
이미 완전한 질문이라면 그대로 반환하세요. 재구성된 질문만 출력하세요."""

    response = client_llm.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()


def generate_answer(query, history=None):
    if history is None:
        history = []

    rewritten_query = rewrite_query_with_context(query, history)
    retrieved = search(rewritten_query, top_k=3)

    context = "\n\n".join(
        [f"[참고자료 {i+1}] 질문: {r['질문']}\n답변: {r['답변']}"
         for i, r in enumerate(retrieved)]
    )

    system_prompt = """당신은 개인회생 절차를 안내하는 전문 상담 챗봇입니다.

답변 원칙:
1. 아래 [참고자료]에 질문과 관련된 내용이 있다면, 그 내용을 근거로 명확하고 자신 있게 답변하세요. 이 경우 별도의 안내 문구 없이 답변만으로 끝내세요.
2. [참고자료]에 명확한 근거가 없는 일반 지식 질문이라면, 알고 있는 법률 지식으로 답변하세요. 이 경우에만 답변 끝에 "이 내용은 일반적인 정보이며, 정확한 확인이 필요할 수 있습니다"를 간단히 덧붙이세요.
3. 개인의 구체적인 상황에 따라 결과가 달라질 수 있는 질문(예: "저는 신청 가능한가요?", "제 경우 변제율이 얼마인가요?")에만, 마지막에 "정확한 판단을 위해 상담사 확인을 권장합니다"를 덧붙이세요.
4. 위 2번, 3번에 해당하지 않는 한, 안내 문구를 반복적으로 붙이지 마세요.
5. 이전 대화 맥락(아래 대화 기록 참고)을 반영해서 자연스럽게 답변하세요. 예를 들어 사용자가 이름 등을 알려줬다면 기억하고 활용하세요.

전문적이고 신뢰감 있는 어조로, 명확하게 답변하세요."""

    # 이전 대화 기록을 messages 배열에 포함시켜 LLM에게 전달
    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-5:]:
        messages.append({"role": "user", "content": h["user"]})
        messages.append({"role": "assistant", "content": h["assistant"]})

    user_message = f"""[참고자료]
{context}

[사용자 질문]
{query}"""
    messages.append({"role": "user", "content": user_message})

    try:
        response = client_llm.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=1500,
            messages=messages
        )
        answer = response.choices[0].message.content
    except Exception as e:
        print(f"오류 발생: {e}")
        answer = "일시적으로 답변을 생성할 수 없습니다. 잠시 후 다시 시도해주세요."

    return answer


if __name__ == "__main__":
    print("개인회생 QnA 챗봇 테스트 (종료하려면 'exit' 입력)")
    print("-" * 50)
    local_history = []
    while True:
        query = input("\n질문: ")
        if query.lower() in ["exit", "quit", "종료"]:
            print("테스트를 종료합니다.")
            break
        answer = generate_answer(query, local_history)
        print(f"답변: {answer}")
        local_history.append({"user": query, "assistant": answer})