from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# 질문 등록 시 요청 (question만 받고 answer는 나중에 채워지는 경우)
class LawQnaCreate(BaseModel):
    question: str
    answer: Optional[str] = None


# 답변 수정/등록 시 요청
class LawQnaUpdate(BaseModel):
    answer: str


# 삭제 요청 (필요하면 seq만 받아도 되지만, 예시 스타일 맞춰서)
class LawQnaDelete(BaseModel):
    seq: int


# 응답용 (DB 조회 결과 반환)
class LawQnaResponse(BaseModel):
    seq: int
    question: str
    answer: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True   # SQLAlchemy 모델 -> Pydantic 변환 허용 (v2 기준)
        # pydantic v1이면 orm_mode = True 로 사용

class HistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str
    history: list[HistoryItem] = []

class ChatResponse(BaseModel):
    answer: str