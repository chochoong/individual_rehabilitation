import { toCalculationRequest } from "./calculationMapper";

const API_URL = "http://127.0.0.1:8701/calculate";

export async function calculateFromForm(formData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toCalculationRequest(formData)),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || "산출계산을 처리하지 못했습니다.");
  }
  return payload;
}
