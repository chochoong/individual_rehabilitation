// CaseChart.jsx
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { calcYearlyDebtProgress } from "./caseDataUtils";

function CaseChart({ chartData }) {
  const { income, debtBefore, debtAfter, payment, period, rate } = chartData;

  const debtProgress = calcYearlyDebtProgress(debtBefore, debtAfter, period);

  const moneyData = [
    { name: "월 소득", value: income },
    { name: "월 변제금", value: payment },
  ];

  return (
    <div className="case-chart-section">
      {/* 숫자 요약 카드 */}
      <div className="chart-summary-cards">
        <div className="summary-card">
          <span className="summary-label">월 소득</span>
          <span className="summary-value">{income.toLocaleString()}만원</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">월 변제금</span>
          <span className="summary-value">{payment.toLocaleString()}만원</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">변제 기간</span>
          <span className="summary-value">{period}개월</span>
        </div>
        <div className="summary-card highlight">
          <span className="summary-label">변제율</span>
          <span className="summary-value">{rate}%</span>
        </div>
      </div>

      {/* 채무 변동 추이 (연차별) */}
      <div className="chart-box">
        <h4>채무 변동 추이 ({period}개월, 연차별 예상)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={debtProgress} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis unit="만원" width={85} />
            <Tooltip formatter={(v) => `${v.toLocaleString()}만원`} />
            <Line
              type="monotone"
              dataKey="debt"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="chart-note">
          * 변제 전 {debtBefore.toLocaleString()}만원 → 변제 후 {debtAfter.toLocaleString()}만원까지
          {period}개월 동안 균등 변제된다고 가정한 예상치입니다.
        </p>
      </div>

         {/* 소득 vs 변제금 - 막대그래프로 수정 */}
      <div className="chart-box">
        <h4>월 소득 대비 변제금</h4>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={moneyData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" unit="만원" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip formatter={(v) => `${v.toLocaleString()}만원`} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              <Cell fill="#f59e0b" />
              <Cell fill="#10b981" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 변제율 바 */}
      <div className="chart-box">
        <h4>변제율</h4>
        <div className="rate-bar-container">
          <div className="rate-bar-bg">
            <div
              className="rate-bar-fill"
              style={{ width: `${Math.min(rate, 100)}%` }}
            />
          </div>
          <span className="rate-bar-text">{rate}%</span>
        </div>
      </div>
    </div>
  );
}

export default CaseChart;