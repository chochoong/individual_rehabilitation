from input_service.asset_info import AssetInfo
from input_service.basic_info import BasicInfo
from input_service.debt_info import DebtInfo
from input_service.income_info import IncomeExpenseInfo

from .calculation_result import CalculationResponse
from .calculation_service import calculate_repayment
from .input_adapter import build_calculation_input


def calculate_from_input_service(
    basic_info: BasicInfo,
    income_info: IncomeExpenseInfo,
    asset_info: AssetInfo,
    debt_info: DebtInfo,
) -> CalculationResponse:
    """기존 input_service 모델만 받아 산출계산을 수행한다."""

    calculation_input = build_calculation_input(
        basic_info=basic_info,
        income_info=income_info,
        asset_info=asset_info,
        debt_info=debt_info,
    )
    return calculate_repayment(calculation_input)

