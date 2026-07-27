import React from "react";

const statusLabels = {
  preliminary_fit: "예비 검토 가능",
  no_debt: "채무 입력 필요",
  income_shortfall: "소득 부족 가능성",
  detailed_review: "상세 검토 필요",
};

function won(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

export default function CalculationResult({ response, onPrev, onNext }) {
  // 결과 데이터가 없을 때
  if (!response?.result) {
    return (
      <section aria-label="산출계산 결과" className="calculation-container">
        <p>계산 결과를 불러올 수 없거나 산출 데이터가 없습니다.</p>
        <div className="action-button-wrapper">
          <button type="button" className="btn-back" onClick={onPrev}>
            ← 이전으로 (신청서 작성)
          </button>
        </div>
      </section>
    );
  }

  const result = response.result;

  return (
    <section aria-label="산출계산 결과" className="calculation-container">
      <h2>변제금 산출 결과</h2>

      <div className="status-badge">
        <p>계산 상태: <strong>{statusLabels[response.status] || "검토 결과"}</strong></p>
      </div>

      <dl className="result-grid">
        <div>
          <dt>예상 월 변제금</dt>
          <dd>{won(result.monthly_payment)}</dd>
        </div>
        <div>
          <dt>총 변제예정액</dt>
          <dd>{won(result.total_payment)}</dd>
        </div>
        <div>
          <dt>예상 감면액</dt>
          <dd>{won(result.expected_relief)}</dd>
        </div>
        <div>
          <dt>예상 감면율</dt>
          <dd>{Number(result.expected_relief_rate || 0).toFixed(1)}%</dd>
        </div>
      </dl>

      {response.warnings?.length > 0 && (
        <div className="warning-box">
          <h4>💡 주의사항</h4>
          <ul aria-label="계산 주의사항">
            {response.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="disclaimer">
        * 이 결과는 예비 계산이며 법률상 판단이나 법원 결정을 대신하지 않습니다.
      </p>

      {/* 하단 페이지 이동 버튼 */}
      <div className="action-button-wrapper" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button type="button" className="btn-back" onClick={onPrev}>
          ← 이전 단계로
        </button>
        <button type="button" className="btn-next" onClick={onNext}>
          유사 사례 검색하기 →
        </button>
      </div>
    </section>
  );
}