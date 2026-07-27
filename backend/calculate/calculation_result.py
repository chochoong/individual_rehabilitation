from typing import Dict, List, Literal, Union

from pydantic import BaseModel, Field


CalculationStatus = Literal[
    "preliminary_fit",
    "no_debt",
    "income_shortfall",
    "detailed_review",
]


class CalculationResult(BaseModel):
    monthly_payment: int = Field(ge=0)
    total_payment: int = Field(ge=0)
    present_value: int = Field(ge=0)
    liquidation_value: int = Field(ge=0)
    unsecured_debt: int = Field(ge=0)
    secured_debt: int = Field(ge=0)
    priority_debt: int = Field(ge=0)
    principal_repayment: int = Field(ge=0)
    expected_relief: int = Field(ge=0)
    repayment_rate: float = Field(ge=0)
    expected_relief_rate: float = Field(ge=0)
    status: CalculationStatus


class CalculationResponse(BaseModel):
    calculation_id: str
    status: CalculationStatus
    assumptions: Dict[str, Union[int, float, str]]
    result: CalculationResult
    warnings: List[str]

