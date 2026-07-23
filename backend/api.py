from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schema import LawQnaResponse, LawQnaUpdate 

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
