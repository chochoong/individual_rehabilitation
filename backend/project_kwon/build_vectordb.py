import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
import os

# 1) 데이터 불러오기
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(CURRENT_DIR, "..", "data", "QnA.csv"), encoding="utf-8-sig")

# 2) 한국어 임베딩 모델 로드 (무료, 오픈소스) - 처음 실행 시 자동 다운로드됨
model = SentenceTransformer("jhgan/ko-sroberta-multitask")

# 3) 질문+답변을 벡터로 변환
texts = (df["질문"] + " " + df["답변"]).tolist()
embeddings = model.encode(texts, show_progress_bar=True)

# 4) 벡터DB(Chroma)에 저장
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(CURRENT_DIR, "..", "chroma_db")

client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection(name="individual_rehab_qna")

collection.add(
    ids=df["QA_ID"].tolist(),
    embeddings=embeddings.tolist(),
    documents=texts,
    metadatas=df[["법률분류", "질문", "답변", "출처유형"]].to_dict("records")
)

print(f"{len(df)}개 데이터 저장 완료")