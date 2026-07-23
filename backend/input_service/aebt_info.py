from typing import Optional
from pydantic import BaseModel


class DebtInfo(BaseModel):
    """
    개인회생 신청자의 채무 정보
    """

    # 총 채무 규모
    total_debt: Optional[int] = None

    # 신용채무
    credit_debt: str = ""
    credit_loan_amount: Optional[int] = None
    credit_card_amount: Optional[int] = None
    overdraft_amount: Optional[int] = None

    # 담보채무
    secured_debt: str = ""
    mortgage_loan_amount: Optional[int] = None
    vehicle_installment_amount: Optional[int] = None
    other_secured_debt_amount: Optional[int] = None

    # 우선 변제 채무
    priority_repayment_debt: str = ""
    tax_debt_amount: Optional[int] = None
    delayed_interest_amount: Optional[int] = None
    unpaid_social_insurance_amount: Optional[int] = None
    other_priority_debt_amount: Optional[int] = None

    # 채무 원인 비율
    debt_reason: str = ""
    living_expense_ratio: Optional[int] = None
    business_fund_ratio: Optional[int] = None
    gambling_ratio: Optional[int] = None
    stock_coin_ratio: Optional[int] = None
    other_reason_ratio: Optional[int] = None
