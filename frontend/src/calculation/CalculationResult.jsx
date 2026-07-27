const statusLabels = {
  preliminary_fit: "예비 검토 가능",
  no_debt: "채무 입력 필요",
  income_shortfall: "소득 부족 가능성",
  detailed_review: "상세 검토 필요",
};

function won(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

export default function CalculationResult({ response }) {
  if (!response?.result) return null;

  const result = response.result;
  return (
    <section aria-label="산출계산 결과">
      <p>계산 상태: {statusLabels[response.status] || "검토 결과"}</p>
      <dl>
        <div><dt>예상 월 변제금</dt><dd>{won(result.monthly_payment)}</dd></div>
        <div><dt>총 변제예정액</dt><dd>{won(result.total_payment)}</dd></div>
        <div><dt>예상 감면액</dt><dd>{won(result.expected_relief)}</dd></div>
        <div><dt>예상 감면율</dt><dd>{Number(result.expected_relief_rate || 0).toFixed(1)}%</dd></div>
      </dl>
      {response.warnings?.length > 0 && (
        <ul aria-label="계산 주의사항">
          {response.warnings.map((warning) => <li key={warning}>{warning}</li>)}
        </ul>
      )}
      <p>이 결과는 예비 계산이며 법률상 판단이나 법원 결정을 대신하지 않습니다.</p>
    </section>
  );
}
