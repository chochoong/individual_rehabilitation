import { useState, useEffect } from 'react'
import AppCase from './rehabilitation_case/AppCase' 
import InputPage from './input_service/InputPage.jsx'
import ChatBot from './ChatBot/ChatBot'
import ApplicationForm from './Application/ApplicationForm'
import CalculationResult from './calculation/CalculationResult'
import { calculateFromForm } from './calculation/calculationClient'
import './App.css'

const API_BASE = "http://localhost:8701";

function App() {
  const [list, setList] = useState([])
  const [keyword, setKeyword] = useState("")
  const [view, setView] = useState("qna") // qna -> form -> Calculation -> case -> chat
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculationResponse, setCalculationResponse] = useState(null)

  useEffect(() => {
    loadList()
  }, [])

  const loadList = async () => {
    try {
      const res = await fetch(`${API_BASE}/lawqna`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json()
      setList(data)
    } catch (err) {
      console.error("QnA 목록 불러오기 실패:", err);
      setList([]);
    }
  }

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim()
    if (!trimmedKeyword) {
      loadList();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/lawqna/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json()
      setList(data)
    } catch (err) {
      console.error("검색 요청 실패:", err);
      setList([]);
    }
  }

  const handleNextToForm = () => setView("form")

  // ---------- 2단계: 신청서 작성 (ApplicationForm 단일 폼) ----------
  if (view === "form") {
    return (
      <InputPage
        onPrev={() => setView("qna")}
        onComplete={async (formData) => {
          if (isSubmitting) return
          setIsSubmitting(true)

          try {
            // InputPage가 이미 /input에 저장을 마쳤으므로, 여기서는 계산 결과만 조회한다.
            const calcResult = await calculateFromForm(formData)
            setCalculationResponse(calcResult)
            setView("Calculation")
          } catch (err) {
            console.error("계산 요청 에러:", err)
            alert(err.message || "계산 결과를 불러오지 못했습니다.")
          } finally {
            setIsSubmitting(false)
          }
        }}
      />
    )
  }

  // ---------- 3단계: 변제금 계산 결과 화면 ----------
  if (view === "Calculation") {
    return (
      <CalculationResult
        response={calculationResponse}
        onPrev={() => setView("form")}
        onNext={() => setView("case")}
      />
    )
  }

  // ---------- 4단계: 유사 사례 검색 화면 ----------
  if (view === "case") {
    return (
      <AppCase
        onBack={() => setView("Calculation")}
        onNext={() => setView("chat")}
        calculationSummary={calculationResponse}   // ← 계산 결과 전달
      />
    )
  }

  // ---------- 5단계: 챗봇 상담 화면 ----------
  if (view === "chat") {
    return <ChatBot onBack={() => setView("case")} />
  }

  // ---------- 기본 1단계: QnA 목록 화면 ----------
  return (
    <div className="container">
      <h1>법률 QnA</h1>
      <div className="search-box">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="질문 키워드 검색"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button className="btn-search" onClick={handleSearch}>검색</button>
      </div>
      <ul className="qna-list">
        {list.length === 0 ? (
          <li className="empty">검색 결과가 없습니다</li>
        ) : (
          list.map((item) => (
            <li key={item.seq} className="qna-item">
              <span className="qna-seq">{item.seq}</span>
              <span className="qna-question">{item.question}</span>
            </li>
          ))
        )}
      </ul>
      <div className="pagination">
        <button className="btn-next" onClick={handleNextToForm}>
          신청서 작성하기 →
        </button>
      </div>
    </div>
  )
}

export default App