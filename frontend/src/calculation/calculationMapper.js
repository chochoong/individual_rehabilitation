function amount(value) {
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function sumAmounts(items) {
  return (Array.isArray(items) ? items : []).reduce(
    (sum, item) => sum + amount(item?.amount),
    0
  );
}

function joinNames(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => (typeof item === "string" ? item : item?.name || ""))
    .filter((name) => name.trim() !== "")
    .join(", ");
}

export function toCalculationRequest(formData) {
  const livingExpensesTotal = sumAmounts(formData.living_expenses);
  const financialAssetsTotal = sumAmounts(formData.financial_assets);
  const creditDebtTotal = sumAmounts(formData.credit_debt_items);
  const securedDebtTotal = sumAmounts(formData.secured_debt_items);
  const priorityDebtTotal = sumAmounts(formData.priority_debt_items);

  return {
    basic_info: {
      name: formData.name || "",
      region: formData.region || "",
      family_count: amount(formData.dependents),
      has_previous_rehabilitation_history: Boolean(formData.has_rehab_history),
    },
    income_info: {
      occupation_type: formData.job || "",
      employment_period: formData.work_period || "",
      monthly_net_income: amount(formData.monthly_income),
      living_expenses: joinNames(formData.living_expenses),
      rent_expense: 0,
      medical_expense: 0,
      education_expense: 0,
      insurance_expense: 0,
      other_living_expense: livingExpensesTotal,
    },
    asset_info: {
      real_estate_description: formData.real_estate || "",
      real_estate_market_value: amount(formData.real_estate_price),
      real_estate_mortgage_balance: amount(formData.mortgage_loan),
      vehicle_description: formData.car || "",
      vehicle_value: 0,
      financial_assets_description: joinNames(formData.financial_assets),
      deposit_value: financialAssetsTotal,
    },
    debt_info: {
      total_debt: creditDebtTotal + securedDebtTotal + priorityDebtTotal,
      credit_debt: joinNames(formData.credit_debt_items),
      credit_loan_amount: creditDebtTotal,
      secured_debt: joinNames(formData.secured_debt_items),
      mortgage_loan_amount: securedDebtTotal,
      priority_repayment_debt: joinNames(formData.priority_debt_items),
      tax_debt_amount: priorityDebtTotal,
      debt_reason: (formData.debt_causes || []).join(", "),
    },
  };
}
