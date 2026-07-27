from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from input_service.basic_info import BasicInfo
from input_service.income_info import IncomeExpenseInfo
from input_service.asset_info import AssetInfo
from input_service.debt_info import DebtInfo


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
# 개인회생 신청자 정보
class Applicant(BaseModel):
    basic_info: BasicInfo
    income_info: IncomeExpenseInfo
    asset_info: AssetInfo
    debt_info: DebtInfo        
    
class SearchRequest(BaseModel):
    question: str 
    

class ApplicationFormRequest(BaseModel):
    name: Optional[str] = ""
    region: Optional[str] = ""
    dependents: Optional[Any] = 0  # 문자열 "" 이나 None이 넘어와도 에러 안 나도록 처리
    hasHistory: Optional[bool] = False

    job: Optional[str] = ""
    workPeriod: Optional[str] = ""
    monthlyIncome: Optional[str] = ""
    expenses: Optional[Dict[str, bool]] = {}

    realEstate: Optional[str] = ""
    realEstatePrice: Optional[str] = ""
    mortgage: Optional[str] = ""
    car: Optional[str] = ""
    financeAssets: Optional[Dict[str, bool]] = {}

    creditDebt: Optional[str] = ""
    securedDebt: Optional[str] = ""
    priorityDebt: Optional[str] = ""
    debtReasons: Optional[Dict[str, bool]] = {}    
    