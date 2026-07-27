function amount(value) {
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function toCalculationRequest(formData) {
  return {
    basic_info: {
      name: formData.name || "",
      region: formData.region || "",
      family_count: amount(formData.dependents),
      has_previous_rehabilitation_history: Boolean(formData.hasHistory),
    },
    income_info: {
      occupation_type: formData.job || "",
      employment_period: formData.workPeriod || "",
      monthly_net_income: amount(formData.monthlyIncome),
      living_expenses: "",
      rent_expense: 0,
      medical_expense: 0,
      education_expense: 0,
      insurance_expense: 0,
      other_living_expense: 0,
    },
    asset_info: {
      real_estate_description: formData.realEstate || "",
      real_estate_market_value: amount(formData.realEstatePrice),
      real_estate_mortgage_balance: amount(formData.mortgage),
      vehicle_description: formData.car || "",
      vehicle_value: 0,
    },
    debt_info: {
      total_debt: amount(formData.creditDebt) + amount(formData.securedDebt) + amount(formData.priorityDebt),
      credit_loan_amount: amount(formData.creditDebt),
      secured_debt: formData.securedDebt || "",
      mortgage_loan_amount: amount(formData.securedDebt),
      priority_repayment_debt: formData.priorityDebt || "",
      tax_debt_amount: amount(formData.priorityDebt),
    },
  };
}
