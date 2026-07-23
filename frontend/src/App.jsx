import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = "http://127.0.0.1:8000"

function App() {
  const [list, setList] = useState([])
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadList()
  }, [])

  const loadList = async () => {
    const res = await fetch(`${API_BASE}/lawqna`)
    const data = await res.json()
    setList(data)
  }

const handleSearch = async () => {
  console.log("1. 검색 시작! 키워드:", keyword);
  try {
  const trimmedKeyword = keyword.trim()  // 공백 제거
  const res = await fetch(`${API_BASE}/lawqna/search?keyword=${encodeURIComponent(trimmedKeyword)}`)
    console.log("2. 응답 상태코드:", res.status);
    
    const data = await res.json();
    console.log("3. 받아온 데이터:", data);
    
    setList(data);
  } catch (err) {
    console.error("4. 통신/파싱 에러 발생:", err);
  }
}

const handleNext = async () => {
  const nextPage = page + 1
  // API 주소를 /chatbot으로 변경
  const res = await fetch(`${API_BASE}/chatbot?page=${nextPage}&keyword=${encodeURIComponent(keyword)}`)
  const data = await res.json()
  
  setList(data)
  setPage(nextPage)
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