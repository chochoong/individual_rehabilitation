from dataclasses import dataclass

from input_service.asset_info import AssetInfo
from input_service.basic_info import BasicInfo
from input_service.debt_info import DebtInfo
from input_service.income_info import IncomeExpenseInfo


@dataclass(frozen=True)
class CalculationInput:
    """현재 input_service가 제공하는 값만으로 구성한 계산기 입력."""

    household_size: int
    monthly_income: int
    extra_expenses: int
    unsecured_debt: int
    secured_debt: int
    priority_debt: int
    liquidation_value: int


def _amount(value: int | None) -> int:
    return max(0, int(value or 0))


def _sum_amounts(*values: int | None) -> int:
    return sum(_amount(value) for value in values)


def build_calculation_input(
    basic_info: BasicInfo,
    income_info: IncomeExpenseInfo,
    asset_info: AssetInfo,
    debt_info: DebtInfo,
) -> CalculationInput:
    household_size = max(1, min(6, _amount(basic_info.family_count) + 1))
    extra_expenses = _sum_amounts(
        income_info.rent_expense,
        income_info.medical_expense,
        income_info.education_expense,
        income_info.insurance_expense,
        income_info.other_living_expense,
    )

    unsecured_debt = _sum_amounts(
        debt_info.credit_loan_amount,
        debt_info.credit_card_amount,
        debt_info.overdraft_amount,
    )
    secured_debt = _sum_amounts(
        debt_info.mortgage_loan_amount,
        debt_info.vehicle_installment_amount,
        debt_info.other_secured_debt_amount,
    )
    priority_debt = _sum_amounts(
        debt_info.tax_debt_amount,
        debt_info.delayed_interest_amount,
        debt_info.unpaid_social_insurance_amount,
        debt_info.other_priority_debt_amount,
    )

    gross_assets = _sum_amounts(
        asset_info.real_estate_market_value,
        asset_info.lease_deposit_amount,
        asset_info.vehicle_value,
        asset_info.stock_value,
        asset_info.deposit_value,
        asset_info.savings_value,
        asset_info.crypto_value,
        asset_info.insurance_surrender_value,
        asset_info.retirement_pay_value,
        asset_info.business_rights_value,
        asset_info.other_assets_value,
    )
    liquidation_value = max(
        0,
        gross_assets
        - _amount(asset_info.real_estate_mortgage_balance)
        - secured_debt,
    )

    return CalculationInput(
        household_size=household_size,
        monthly_income=_amount(income_info.monthly_net_income),
        extra_expenses=extra_expenses,
        unsecured_debt=unsecured_debt,
        secured_debt=secured_debt,
        priority_debt=priority_debt,
        liquidation_value=liquidation_value,
    )

