from uuid import uuid4

from .calculation_schema import CalculationRequest, CalculationResponse, CalculationResult
from .input_adapter import CalculationInput


PLAN_MONTHS = 36
PRESENT_VALUE_FACTOR = 33.7719
HOUSEHOLD_LIVING_COSTS = {
    1: 1_538_543,
    2: 2_519_575,
    3: 3_215_422,
    4: 3_896_843,
    5: 4_534_031,
    6: 5_133_571,
}


def calculate_repayment(values: CalculationInput) -> CalculationResponse:
    """정규화된 input_service 기반 입력으로 예비 산출을 수행한다."""
    income = values.monthly_income
    living_cost = HOUSEHOLD_LIVING_COSTS[values.household_size]
    extra_expense = values.extra_expenses
    unsecured_principal = values.unsecured_debt
    liquidation_value = values.liquidation_value

    monthly_payment = max(0, income - living_cost - extra_expense)
    total_payment = round(monthly_payment * PLAN_MONTHS)
    present_value = round(monthly_payment * PRESENT_VALUE_FACTOR)
    liquidation_shortfall = max(0, liquidation_value - present_value)
    principal_repayment = min(unsecured_principal, total_payment)
    expected_relief = max(0, unsecured_principal - principal_repayment)
    repayment_rate = (principal_repayment / unsecured_principal * 100) if unsecured_principal else 0
    expected_relief_rate = (expected_relief / unsecured_principal * 100) if unsecured_principal else 0

    status = "preliminary_fit"
    if unsecured_principal <= 0:
        status = "no_debt"
    elif monthly_payment <= 0:
        status = "income_shortfall"
    elif values.secured_debt > 0 or values.priority_debt > 0 or liquidation_shortfall > 0:
        status = "detailed_review"

    result = CalculationResult(
        monthly_payment=monthly_payment,
        total_payment=total_payment,
        present_value=present_value,
        liquidation_value=liquidation_value,
        unsecured_debt=unsecured_principal,
        secured_debt=values.secured_debt,
        priority_debt=values.priority_debt,
        principal_repayment=principal_repayment,
        expected_relief=expected_relief,
        repayment_rate=repayment_rate,
        expected_relief_rate=expected_relief_rate,
        status=status,
    )
    warnings = [
        "이 결과는 사전추정이며 법원의 인가·기각 결정을 보장하지 않습니다.",
        "청산가치·복합채권·증빙 상태에 따라 책임 검토가 필요할 수 있습니다.",
    ]
    return CalculationResponse(
        calculation_id=str(uuid4()),
        status=status,
        assumptions={
            "plan_months": PLAN_MONTHS,
            "present_value_factor": PRESENT_VALUE_FACTOR,
            "living_cost": living_cost,
            "extra_expense": extra_expense,
        },
        result=result,
        warnings=warnings,
    )


def calculate_request(request: CalculationRequest) -> CalculationResponse:
    """기존 input_service 모델 요청을 받아 계산하는 모듈 경계 함수."""

    from .input_adapter import build_calculation_input

    values = build_calculation_input(
        basic_info=request.basic_info,
        income_info=request.income_info,
        asset_info=request.asset_info,
        debt_info=request.debt_info,
    )
    return calculate_repayment(values)
