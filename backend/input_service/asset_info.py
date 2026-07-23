from typing import Optional
from pydantic import BaseModel


class AssetInfo(BaseModel):
    """
    개인회생 신청자의 재산 정보 (청산 가치 산정용)
    """

    # 부동산
    real_estate_description: str = ""
    real_estate_market_value: Optional[int] = None
    real_estate_mortgage_balance: Optional[int] = None

    # 임대차 보증금
    lease_deposit_type: str = ""
    lease_deposit_amount: Optional[int] = None

    # 자동차 / 오토바이
    vehicle_description: str = ""
    vehicle_value: Optional[int] = None

    # 금융재산
    financial_assets_description: str = ""
    stock_value: Optional[int] = None
    deposit_value: Optional[int] = None
    savings_value: Optional[int] = None
    crypto_value: Optional[int] = None
    insurance_surrender_value: Optional[int] = None

    # 기타
    other_assets_description: str = ""
    retirement_pay_value: Optional[int] = None
    business_rights_value: Optional[int] = None
    other_assets_value: Optional[int] = None
    other_assets_recognition_rate: Optional[int] = None
