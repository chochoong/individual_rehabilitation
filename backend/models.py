from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Sequence
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class ApplicantModel(Base):
    __tablename__ = "applicant"

    id = Column(Integer, Sequence("applicant_seq", start=1, increment=1), primary_key=True)
    name = Column(String(200), nullable=False)
    region = Column(String(200), nullable=False)
    dependents = Column(Integer, nullable=False, default=0)
    has_rehab_history = Column(Boolean, nullable=False, default=False)

    job = Column(String(200), nullable=False)
    work_period = Column(String(200), nullable=False)
    monthly_income = Column(Integer, nullable=False, default=0)
    # 짧은 JSON 문자열만 저장하므로 CLOB(Text) 대신 VARCHAR2로 선언.
    # CLOB 컬럼이 다른 컬럼들 사이에 끼어 있으면 오라클이 INSERT 시
    # ORA-24816(Expanded non LONG bind data supplied after actual LONG or LOB column)을 던진다.
    living_expenses_json = Column(String(4000), nullable=False)

    # 재산 정보는 입력 화면에서 선택 사항으로 바뀌어 빈 값으로 제출될 수 있다.
    # Oracle은 VARCHAR2 빈 문자열("")을 NULL로 취급하므로 NOT NULL이면 ORA-01400이 난다.
    real_estate = Column(String(200), nullable=True)
    real_estate_price = Column(Integer, nullable=False, default=0)
    mortgage_loan = Column(Integer, nullable=False, default=0)
    car = Column(String(200), nullable=True)
    financial_assets_json = Column(String(4000), nullable=False)

    credit_debt = Column(Integer, nullable=False, default=0)
    secured_debt = Column(Integer, nullable=False, default=0)
    priority_debt = Column(Integer, nullable=False, default=0)
    debt_causes_json = Column(String(4000), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
