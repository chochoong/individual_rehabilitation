import { useState, useEffect } from 'react'
import './App.css'
import ChatBot from './ChatBot/ChatBot.jsx'

const API_BASE = "http://127.0.0.1:8701"

function App() {
  const [list, setList] = useState([])
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [showChatBot, setShowChatBot] = useState(false)  // 추가: 챗봇 화면 표시 여부

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

  const handleNext = () => {
    setShowChatBot(true)  // "다음" 버튼 누르면 챗봇 화면으로 전환
  }

  // 챗봇 화면을 보여줘야 하면, ChatBot 컴포넌트만 렌더링
  if (showChatBot) {
    return <ChatBot />
  }

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