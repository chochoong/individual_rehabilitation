import { useState, useEffect } from "react";

import BasicInfo from "./BasicInfo";
import IncomeInfo from "./IncomeInfo";
import AssetInfo from "./AssetInfo";
import DebtInfo from "./DebtInfo";

import "./InputPage.css";

const API_URL = "http://localhost:8701/input";
const STORAGE_KEY = "input_page_temp_data";

function InputPage() {
  const [step, setStep] = useState(1);

  const initialFormData = {
    name: "",
    region: "",
    dependents: 0,
    has_rehab_history: false,

    job: "",
    work_period: "",
    monthly_income: 0,
    living_expenses: [],

    real_estate: "",
    real_estate_price: 0,
    mortgage_loan: 0,
    car: "",
    financial_assets: [],

    credit_debt: 0,
    secured_debt: 0,
    priority_debt: 0,
    debt_causes: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      try {
        const { savedStep, savedForm } = JSON.parse(savedData);

        if (savedForm) setFormData(savedForm);
        if (savedStep) setStep(savedStep);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleTempSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        savedStep: step,
        savedForm: formData,
      })
    );

    alert("임시 저장되었습니다.");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field, item) => {
    setFormData((prev) => {
      const list = prev[field] || [];

      const updated = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];

      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("서버 오류");

      await res.json();

      alert("제출 완료!");

      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
      alert("제출 실패");
    }
  };

  const steps = [
    { id: 1, title: "기본 정보" },
    { id: 2, title: "소득 · 지출" },
    { id: 3, title: "재산 정보" },
    { id: 4, title: "채무 정보" },
  ];

  return (
    <div className="input-page-container">

      {/* 진행 표시 */}
      <div className="tab-menu">
        {steps.map((s) => (
          <button
            key={s.id}
            className={`tab-item ${step === s.id ? "active" : ""}`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* 내용 */}
      <div className="tab-content">

        {step === 1 && (
          <BasicInfo
            data={formData}
            onChange={handleChange}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <IncomeInfo
            data={formData}
            onChange={handleChange}
            onCheckboxChange={handleCheckboxChange}
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <AssetInfo
            data={formData}
            onChange={handleChange}
            onCheckboxChange={handleCheckboxChange}
            onPrev={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <DebtInfo
            data={formData}
            onChange={handleChange}
            onCheckboxChange={handleCheckboxChange}
            onPrev={() => setStep(3)}
            onSubmit={handleSubmit}
          />
        )}

      </div>

      <div className="action-buttons">
        <button onClick={handleTempSave}>
          임시 저장
        </button>
      </div>

    </div>
  );
}

export default InputPage;