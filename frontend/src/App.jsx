// App.jsx
import { useState, useEffect } from 'react'
import AppCase from './rehabilitation_case/AppCase' // 1. AppCase 불러오기
import './App.css'

const API_BASE = "http://127.0.0.1:8701"

function App() {
  const [list, setList] = useState([])
  const [keyword, setKeyword] = useState("")
  
  // 2. 현재 화면이 qna인지 case인지 구분하는 상태 값
  const [view, setView] = useState("qna") 

  useEffect(() => {
    loadList()
  }, [])

  const loadList = async () => {
    const res = await fetch(`${API_BASE}/lawqna`)
    const data = await res.json()
    setList(data)
  }

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim()
    const res = await fetch(`${API_BASE}/lawqna/search?keyword=${encodeURIComponent(trimmedKeyword)}`)
    const data = await res.json()
    setList(data)
  }

  // 3. "다음" 버튼 클릭 시 화면 상태만 'case'로 전환! (API 호출 X)
  const handleNext = () => {
    setView("case")
  }

  // 4. view가 'case'라면 사례 검색 컴포넌트만 출력
  if (view === "case") {
    return <AppCase onBack={() => setView("qna")} />
  }

  // view가 'qna'일 때는 기존 화면 출력
  return (
    <div className="container">
      <h1>법률 QnA</h1>

      <div className="search-box">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="질문 키워드 검색"
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
        <button className="btn-next" onClick={handleNext}>
          다음 →
        </button>
      </div>
    </div>
  )
}

export default App