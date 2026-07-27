from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Sequence
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
    living_expenses_json = Column(Text, nullable=False)

    real_estate = Column(String(200), nullable=False)
    real_estate_price = Column(Integer, nullable=False, default=0)
    mortgage_loan = Column(Integer, nullable=False, default=0)
    car = Column(String(200), nullable=False)
    financial_assets_json = Column(Text, nullable=False)

    credit_debt = Column(Integer, nullable=False, default=0)
    secured_debt = Column(Integer, nullable=False, default=0)
    priority_debt = Column(Integer, nullable=False, default=0)
    debt_causes_json = Column(Text, nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
