import { useState, useEffect } from "react";
import "./AppCase.css";
import { extractChartData, formatCorrectionText } from "./caseDataUtils";
import CaseChart from "./CaseChart"; 

function parseCaseDetail(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const fields = [];
  let storyStartIndex = 0;

  const labelPattern = /^(사례\s*\d+|인적사항.*|채무\s*변동.*|채무\s*조정.*|상세\s*내역.*|관할\s*법원.*|법원.*|월\s*변제금.*|변제\s*기간.*|변제기간.*|변제율.*)$/;

  for (let i = 0; i < lines.length; i++) {
    if (labelPattern.test(lines[i])) {
      fields.push(lines[i]);
      storyStartIndex = i + 1;
    } else {
      break;
    }
  }

  const rest = lines.slice(storyStartIndex).join("\n");

  const splitPattern = /-?\s*(?:\d+차\s*)?보정\s*(?:권고|명령)\s*주요\s*내용/;
  const match = rest.match(splitPattern);

  let story = rest;
  let correction = "";

  if (match) {
    const splitIndex = match.index;
    story = rest.slice(0, splitIndex).trim();
    correction = rest.slice(splitIndex).trim();
  }

  return { fields, story, correction };
}

function AppCase({ onBack, onNext, calculationSummary }) {   // ← calculationSummary 추가
  const [question, setQuestion] = useState("");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 계산 결과와 포맷 함수를 정의
  const result = calculationSummary?.result;
  const won = (value) => `${Number(value || 0).toLocaleString("ko-KR")}원`;

  // 1. 검색 함수 (직접 인자로 텍스트를 받거나 state의 question을 사용하도록 개선)
  const handleSearch = async (searchQuery) => {
    const targetQuery = typeof searchQuery === "string" ? searchQuery : question;
    if (!targetQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch("http://localhost:8701/casesearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: targetQuery }),
      });
      const data = await response.json();
      console.log("서버 응답:", data);
      setCases(Array.isArray(data.cases) ? data.cases : []);
    } catch (err) {
      console.error("사례 검색 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. 화면에 처음 진입 시 DB에서 최신 신청서를 불러와 자동 입력 & 자동 검색 수행
  useEffect(() => {
    const loadLatestSummary = async () => {
      try {
        const response = await fetch("http://localhost:8701/application/latest-summary");
        const data = await response.json();
        
        if (data.query_text) {
          setQuestion(data.query_text);
          // 데이터 로드 후 자동으로 사례 검색까지 실행
          // handleSearch(data.query_text);
        }
      } catch (err) {
        console.error("최신 신청서 조회 실패:", err);
      }
    };

    loadLatestSummary();
  }, []);

  // ---------- 상세 페이지 ----------
  if (selectedCase) {
    const { fields, story, correction } = parseCaseDetail(selectedCase);
    const chartData = extractChartData(selectedCase);

    return (
      <div className="container-case">
        <button className="btn-back" onClick={() => setSelectedCase(null)}>
          ← 목록으로
        </button>

        <div className="case-detail">
          {fields.map((line, i) => (
            <p key={i} className="case-detail-field">{line}</p>
          ))}

          <CaseChart chartData={chartData} />

          <div className="case-detail-story">{story}</div>

          {correction && (
            <div className="case-detail-correction">
              <h4>보정권고 주요 내용</h4>
              <div className="correction-body">
                {formatCorrectionText(
                  correction.replace(/-?\s*(?:\d+차\s*)?보정\s*(?:권고|명령)\s*주요\s*내용/, "").trim()
                )}
              </div>
            </div>
          )}
        </div>

        <div className="action-button-wrapper">
          <button className="btn-next" onClick={onNext}>
            다음 단계로 →
          </button>
        </div>
      </div>
    );
  }

  // ---------- 목록 페이지 ----------
    return (
    <div className="container-case">
      <button onClick={onBack} style={{ marginBottom: "16px", background: "none", border: "none", cursor: "pointer", color: "#666" }}>
        ← 이전 단계로
      </button>

      <h2>사례 검색</h2>

      {/* 계산 결과 요약 카드 */}
      {result && (
        <div className="my-summary-card">
          <h4>📊 내 예상 산출 결과</h4>
          <div className="summary-row">
            <span>예상 월 변제금</span>
            <strong>{won(result.monthly_payment)}</strong>
          </div>
          <div className="summary-row">
            <span>총 변제예정액</span>
            <strong>{won(result.total_payment)}</strong>
          </div>
          <div className="summary-row">
            <span>예상 감면액</span>
            <strong>{won(result.expected_relief)}</strong>
          </div>
          <div className="summary-row">
            <span>예상 감면율</span>
            <strong>{Number(result.expected_relief_rate || 0).toFixed(1)}%</strong>
          </div>
        </div>
      )}

      <div className="input-box">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="사례를 검색해보세요"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {/* 검색 결과 또는 안내 메시지 */}
      <div className="case-grid">
        {cases.length > 0 ? (
          cases.map((item, index) => {
            const preview = item.slice(0, 150);
            return (
              <div key={index} className="case-card">
                <p className="card-preview">{preview}...</p>
                <button className="btn-more" onClick={() => setSelectedCase(item)}>
                  더 보기
                </button>
              </div>
            );
          })
        ) : (
          hasSearched && !loading && <p>검색 결과가 없습니다.</p>
        )}
      </div>

      {/* 검색을 실행한 경우 표시되는 하단 다음 단계 버튼 */}
      {hasSearched && (
        <div className="action-button-wrapper">
          <button className="btn-next" onClick={onNext}>
            다음 단계로 →
          </button>
        </div>
      )}
    </div>
  );
}

export default AppCase;