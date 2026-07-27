from pydantic import BaseModel

from input_service.asset_info import AssetInfo
from input_service.basic_info import BasicInfo
from input_service.debt_info import DebtInfo
from input_service.income_info import IncomeExpenseInfo

from .calculation_result import (
    CalculationResponse,
    CalculationResult,
    CalculationStatus,
)
from .input_adapter import CalculationInput


class CalculationRequest(BaseModel):
    """기존 input_service 네 모델을 계산기에 전달하는 요청 계약."""

    basic_info: BasicInfo
    income_info: IncomeExpenseInfo
    asset_info: AssetInfo
    debt_info: DebtInfo


__all__ = [
    "AssetInfo",
    "BasicInfo",
    "CalculationInput",
    "CalculationRequest",
    "CalculationResponse",
    "CalculationResult",
    "CalculationStatus",
    "DebtInfo",
    "IncomeExpenseInfo",
]
