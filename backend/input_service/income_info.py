from typing import Optional
from pydantic import BaseModel


class IncomeExpenseInfo(BaseModel):
    """
    개인회생 신청자의 소득 및 지출 정보
    """

    # 직업 유형
    occupation_type: str = ""

    # 재직 기간
    employment_period: str = ""

    # 월평균 순소득
    monthly_net_income: Optional[int] = None

    # 생계비
    living_expenses: str = ""
    rent_expense: Optional[int] = None
    medical_expense: Optional[int] = None
    education_expense: Optional[int] = None
    insurance_expense: Optional[int] = None
    other_living_expense: Optional[int] = None
