from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schema import LawQnaResponse, LawQnaUpdate , ChatRequest , ChatResponse ,SearchRequest ,ApplicationFormRequest
from project_kwon.generate_answer import generate_answer
from rehabilitation_case.case import run, retriever  

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

def parse_int(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        return 0
    
def format_money(value):
    """숫자(원 단위, 콤마 포함 문자열도 허용)를 '만원' 단위 문자열로 변환."""
    if value is None or value == "":
        return ""
      
    
    # 문자열인 경우 콤마 제거
    if isinstance(value, str):
        value = value.replace(",", "").strip()
    
    try:
        value = int(value)
    except (ValueError, TypeError):
        return str(value)
    
    man = value // 10000
    return f"{man:,}만원"    
    
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


@router.post("/application")
def create_application(req: ApplicationFormRequest, db: Session = Depends(get_db)):
    try:
        # Oracle 11g 기준 (seq_app_id.NEXTVAL)
        # 만약 Oracle 12c+ IDENTITY 방식을 사용 중이시면 app_id와 :app_id / seq_app_id.NEXTVAL 부분을 빼주셔도 됩니다.
        sql = text("""
            INSERT INTO application_form (
                app_id, name, region, dependents, has_history,
                job, work_period, monthly_income,
                expense_food, expense_transport, expense_telecom,
                real_estate, real_estate_price, mortgage, car,
                asset_deposit, asset_savings, asset_stocks,
                credit_debt, secured_debt, priority_debt,
                reason_living, reason_business, reason_gambling, reason_stocks, reason_crypto, reason_etc
            ) VALUES (
                seq_app_id.NEXTVAL, :name, :region, :dependents, :has_history,
                :job, :work_period, :monthly_income,
                :expense_food, :expense_transport, :expense_telecom,
                :real_estate, :real_estate_price, :mortgage, :car,
                :asset_deposit, :asset_savings, :asset_stocks,
                :credit_debt, :secured_debt, :priority_debt,
                :reason_living, :reason_business, :reason_gambling, :reason_stocks, :reason_crypto, :reason_etc
            )
        """)

        # 체크박스 boolean 데이터 Y/N 변환 및 파라미터 매핑
        params = {
            "name": req.name or "",
            "region": req.region or "",
            "dependents": parse_int(req.dependents), # 안전하게 int로 변환
            "has_history": "Y" if req.hasHistory else "N",
            "job": req.job,
            "work_period": req.workPeriod,
            "monthly_income": req.monthlyIncome,
            "expense_food": "Y" if req.expenses.get("food") else "N",
            "expense_transport": "Y" if req.expenses.get("transport") else "N",
            "expense_telecom": "Y" if req.expenses.get("telecom") else "N",
            "real_estate": req.realEstate,
            "real_estate_price": req.realEstatePrice,
            "mortgage": req.mortgage,
            "car": req.car,
            "asset_deposit": "Y" if req.financeAssets.get("deposit") else "N",
            "asset_savings": "Y" if req.financeAssets.get("savings") else "N",
            "asset_stocks": "Y" if req.financeAssets.get("stocks") else "N",
            "credit_debt": req.creditDebt,
            "secured_debt": req.securedDebt,
            "priority_debt": req.priorityDebt,
            "reason_living": "Y" if req.debtReasons.get("living") else "N",
            "reason_business": "Y" if req.debtReasons.get("business") else "N",
            "reason_gambling": "Y" if req.debtReasons.get("gambling") else "N",
            "reason_stocks": "Y" if req.debtReasons.get("stocks") else "N",
            "reason_crypto": "Y" if req.debtReasons.get("crypto") else "N",
            "reason_etc": "Y" if req.debtReasons.get("etc") else "N",
        }

        db.execute(sql, params)
        db.commit() # 트랜잭션 커밋

        return {"status": "success", "message": "신청서가 성공적으로 저장되었습니다."}

    except Exception as e:
        db.rollback()
        print("신청서 저장 중 에러 발생:", str(e))
        return {"status": "error", "message": str(e)}
    
    
@router.get("/application/latest-summary")
def get_latest_application_summary(db: Session = Depends(get_db)):
    # 가장 최근 저장된 신청서 1건 조회
    row = db.execute(
        text("""
            SELECT name, region, dependents, has_history,
                   job, work_period, monthly_income,
                   real_estate, real_estate_price, mortgage, car,
                   credit_debt, secured_debt, priority_debt
            FROM (
                SELECT name, region, dependents, has_history,
                       job, work_period, monthly_income,
                       real_estate, real_estate_price, mortgage, car,
                       credit_debt, secured_debt, priority_debt
                FROM application_form
                ORDER BY app_id DESC
            )
            WHERE ROWNUM = 1
        """)
    ).fetchone()

    if not row:
        return {"query_text": ""}

    # Dict 변환
    data = {
        "name": row[0],
        "region": row[1],
        "dependents": row[2],
        "has_history": row[3],
        "job": row[4],
        "work_period": row[5],
        "monthly_income": row[6],
        "real_estate": row[7],
        "real_estate_price": row[8],
        "mortgage": row[9],
        "car": row[10],
        "credit_debt": row[11],
        "secured_debt": row[12],
        "priority_debt": row[13],
    }
    
     # 사례 검색(VectorDB / Retriever)에 전달하기 좋은 자연스러운 텍스트 프롬프트 구성
    parts = []
    if data["region"]: parts.append(f"거주지: {data['region']}")
    if data["job"]: parts.append(f"직업: {data['job']}")
    if data["work_period"]: parts.append(f"근무기간: {data['work_period']}")
    if data["monthly_income"]: parts.append(f"월소득: {format_money(data['monthly_income'])}")
    if data["dependents"]: parts.append(f"부양가족: {data['dependents']}명")
    if data["credit_debt"]: parts.append(f"신용채무: {format_money(data['credit_debt'])}")
    if data["secured_debt"]: parts.append(f"담보채무: {format_money(data['secured_debt'])}")
    if data["priority_debt"]: parts.append(f"우선변제채무: {format_money(data['priority_debt'])}")
    if data["real_estate"]: parts.append(f"부동산: {data['real_estate']} (시세 {format_money(data.get('real_estate_price') or 0)}, 담보대출 {format_money(data.get('mortgage') or 0)})")
    if data["car"]: parts.append(f"차량: {data['car']}")
    if data["has_history"]: parts.append(f"이전 신청이력: {data['has_history']}")

    query_text = " / ".join(parts)

    return {"query_text": query_text, "raw_data": data}   


@router.post("/repayment", response_model=RepaymentCalculationResponse)
def repayment_calculation(request: RepaymentCalculationRequest) -> RepaymentCalculationResponse:
    return calculate_repayment(request.case)