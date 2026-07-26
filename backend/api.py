from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schema import LawQnaResponse, LawQnaUpdate , ChatRequest , ChatResponse ,SearchRequest
from project_kwon.generate_answer import generate_answer
<<<<<<< Updated upstream
from schema import LawQnaResponse, LawQnaUpdate 
from schema import Applicant
=======
from rehabilitation_case.case import run, retriever  
>>>>>>> Stashed changes

router = APIRouter()


def row_to_dict(row):
    # answer가 CLOB(LOB 객체)일 경우 read()를 통해 문자열로 읽어옴
    answer_val = row[2]
    if hasattr(answer_val, "read"):
        answer_val = answer_val.read()

    return {
        "seq": row[0],
        "question": row[1],
        "answer": answer_val,
        "created_at": row[3],
    }

#Qna 전체조회 20개만
@router.get("/lawqna", response_model=list[LawQnaResponse])
def get_lawqna_list(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
            SELECT seq, question, answer, created_at
            FROM (
                SELECT seq, question, answer, created_at
                FROM lawqna
                ORDER BY seq DESC
            )
            WHERE ROWNUM <= 20
        """)
    ).all()
    return [row_to_dict(row) for row in rows]


#Qna 키워드 조회 
@router.get("/lawqna/search", response_model=list[LawQnaResponse])
def search_lawqna(keyword: str, db: Session = Depends(get_db)):
    print("받은 keyword:", repr(keyword))  # 임시 디버그
    rows = db.execute(
        text("""
            SELECT seq, question, answer, created_at
            FROM lawqna
            WHERE TRIM(question) LIKE '%' || :keyword || '%'
            ORDER BY seq DESC
        """),
        {"keyword": keyword},
    ).all()
    return [row_to_dict(row) for row in rows]

@router.post("/qna/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    # 프론트에서 온 [{role, content}, ...] 형태를 [{user, assistant}, ...]로 변환
    converted_history = []
    pending_user = None
    for item in request.history:
        if item.role == "user":
            pending_user = item.content
        elif item.role == "assistant" and pending_user is not None:
            converted_history.append({"user": pending_user, "assistant": item.content})
            pending_user = None

    answer = generate_answer(request.question, converted_history)
    return {"answer": answer}

@router.post("/input")
def create_input(applicant: Applicant):
    return {
        "message": "입력 완료",
        "data": applicant
    }

@router.post("/casesearch")
def search_case(req: SearchRequest):
    docs = retriever.invoke(req.question)
    cases = [doc.page_content for doc in docs[:3]]  # 상위 3개만
    return {"cases": cases}

# @router.post("/casesearch")
# def search_case(req: SearchRequest):
#     docs = retriever.invoke(req.question)
#     cases = [doc.page_content for doc in docs[:3]]
#     return {"cases": cases}


