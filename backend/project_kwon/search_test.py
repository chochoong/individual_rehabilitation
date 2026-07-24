import chromadb
from sentence_transformers import SentenceTransformer
import os

# 저장해둔 벡터DB 불러오기
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(CURRENT_DIR, "..", "chroma_db")

client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_collection(name="individual_rehab_qna")

# 같은 임베딩 모델 로드
model = SentenceTransformer("jhgan/ko-sroberta-multitask")

def search(query, top_k=3):
    query_vec = model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_vec,
        n_results=top_k
    )
    print(f"\n질문: {query}")
    print("-" * 50)
    for meta, dist in zip(results["metadatas"][0], results["distances"][0]):
        print(f"[유사도 거리 {dist:.3f}] {meta['질문']}")
        print(f"  → {meta['답변']}")
    print()

# 실제 사용자가 물어볼 법한 표현으로 테스트
search("개인회생 신청하면 채권자 독촉 전화 멈추나요?")
search("변제계획안은 어떻게 작성하나요?")
search("면책 결정 나면 빚이 다 없어지나요?")