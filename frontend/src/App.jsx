import { useState, useEffect } from 'react'
import AppCase from './rehabilitation_case/AppCase' 
import ChatBot from './ChatBot/ChatBot' 
import ApplicationForm from './Application/ApplicationForm' 
import './App.css'

const API_BASE = "http://localhost:8701"; 

function App() {
  const [list, setList] = useState([])
  const [keyword, setKeyword] = useState("")
  const [view, setView] = useState("qna") 
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 제출 방지 flag

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

  // 1단계: QnA 목록 -> 2단계: 신청서 작성
  const handleNextToForm = () => setView("form")

  // 2단계: 신청서 작성 화면
 if (view === "form") {
    return (
      <ApplicationForm
        onPrev={() => setView("qna")}
        onSubmit={async (formData) => {
          if (isSubmitting) return; // 이미 제출 중이면 중복 실행 방지
          setIsSubmitting(true);

          try {
            const res = await fetch(`${API_BASE}/application`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.status === "success") {
              alert("신청서 제출이 완료되었습니다.");
              setView("case"); // ⚠️ 화면을 'case'로 전환하여 폼 제출 상태를 완전히 벗어납니다.
            } else {
              alert("저장 실패: " + (result.message || "오류 발생"));
            }
          } catch (err) {
            console.error("제출 요청 에러:", err);
            alert("서버 통신 실패");
          } finally {
            setIsSubmitting(false);
          }
        }}
        onSaveDraft={(formData) => {
          alert("임시 저장되었습니다.");
        }}
      />
    );
  }

  // 3단계: 사례 검색 화면
  if (view === "case") {
    return (
      <AppCase 
        onBack={() => setView("form")} // 뒤로 가기 시 2단계(신청서)로 이동
        onNext={() => setView("chat")} // 다음 단계 시 4단계(챗봇)로 이동
      />
    )
  }

  // 4단계: 챗봇 화면
  if (view === "chat") {
    return <ChatBot onBack={() => setView("case")} />
  }

  // 기본 1단계: QnA 목록 화면
  return (
    <div className="container">
      <h1>법률 QnA</h1>

      <div className="search-box">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="질문 키워드 검색"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
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