import { useState, useEffect } from "react";

import BasicInfo from "./BasicInfo";
import IncomeInfo from "./IncomeInfo";
import AssetInfo from "./AssetInfo";
import DebtInfo from "./DebtInfo";

import "./InputPage.css";

const API_URL = "http://localhost:8701/input";
const STORAGE_KEY = "input_page_temp_data";

function InputPage({ onPrev, onComplete }) {

  const [step, setStep] = useState(1);

  const initialFormData = {
    name: "",
    birthdate: "",
    gender: "",
    region: "",
    dependents: 0,
    has_rehab_history: false,

    job: "",
    work_period: "",
    monthly_income: "",
    living_expenses: [{ name: "", amount: 0 }],

    real_estate: "",
    real_estate_price: 0,
    mortgage_loan: 0,
    car: "",
    financial_assets: [{ name: "", amount: 0 }],

    credit_debt: 0,
    secured_debt: 0,
    priority_debt: 0,
    debt_causes: [],
    debt_cause_description: "",
    credit_debt_items: [{ name: "", amount: 0 }],
    secured_debt_items: [{ name: "", amount: 0 }],
    priority_debt_items: [{ name: "", amount: 0 }],
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {

    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {

      try {

        const { savedStep, savedForm } = JSON.parse(savedData);
        if (savedForm) {
          const normalized = { ...savedForm };

          // Normalize living_expenses which previously could be array of strings or living_expenses_amounts object
          if (Array.isArray(normalized.living_expenses)) {
            normalized.living_expenses = normalized.living_expenses.map((it) => {
              if (typeof it === "string") return { name: it, amount: 0 };
              if (typeof it === "object") return { name: it.name || "", amount: Number(it.amount || 0) };
              return { name: "", amount: 0 };
            });
          } else if (normalized.living_expenses && typeof normalized.living_expenses === "object") {
            // in case it's an object mapping (old living_expenses_amounts), convert
            const arr = [];
            for (const k of Object.keys(normalized.living_expenses)) {
              arr.push({ name: k, amount: Number(normalized.living_expenses[k] || 0) });
            }
            normalized.living_expenses = arr.length ? arr : [{ name: "", amount: 0 }];
          } else if (normalized.living_expenses_amounts && typeof normalized.living_expenses_amounts === "object") {
            const arr = [];
            for (const k of Object.keys(normalized.living_expenses_amounts)) {
              arr.push({ name: k, amount: Number(normalized.living_expenses_amounts[k] || 0) });
            }
            normalized.living_expenses = arr.length ? arr : [{ name: "", amount: 0 }];
          } else {
            normalized.living_expenses = [{ name: "", amount: 0 }];
          }

          if (Array.isArray(normalized.financial_assets)) {
            normalized.financial_assets = normalized.financial_assets.map((it) => {
              if (typeof it === "string") return { name: it, amount: 0 };
              if (typeof it === "object") return { name: it.name || "", amount: Number(it.amount || 0) };
              return { name: "", amount: 0 };
            });
          } else {
            normalized.financial_assets = [{ name: "", amount: 0 }];
          }

          const debtFields = ["credit_debt_items", "secured_debt_items", "priority_debt_items"];
          debtFields.forEach((field) => {
            if (Array.isArray(normalized[field])) {
              normalized[field] = normalized[field].map((it) => {
                if (typeof it === "string") return { name: it, amount: 0 };
                if (typeof it === "object") return { name: it.name || "", amount: Number(it.amount || 0) };
                return { name: "", amount: 0 };
              });
            } else {
              normalized[field] = [{ name: "", amount: 0 }];
            }
          });

          if (typeof normalized.debt_cause_description !== "string") {
            normalized.debt_cause_description = "";
          }

          setFormData(normalized);
        }
        if (savedStep) setStep(savedStep);

      } catch (err) {

        console.error(err);

      }

    }

  }, []);

  const handleChange = (field, value) => {

    setFormData((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };
      // Update completedSteps: remove any completed step that no longer satisfies completion
      setCompletedSteps((prevCompleted) => prevCompleted.filter(id => isStepCompleteFor(next, id)));
      return next;
    });

  };

  const handleCheckboxChange = (field, item) => {

    setFormData((prev) => {
      const list = prev[field] || [];
      const updated = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      const next = {
        ...prev,
        [field]: updated,
      };
      setCompletedSteps((prevCompleted) => prevCompleted.filter(id => isStepCompleteFor(next, id)));
      return next;
    });

  };

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

  const handleSubmit = async () => {

    try {

      const payload = { ...formData };
      // Convert living_expenses to names array for backend compatibility
      payload.living_expenses = (formData.living_expenses || [])
        .map((i) => (i.name || "").toString())
        .filter((name) => name.trim() !== "");
      payload.financial_assets = (formData.financial_assets || [])
        .map((i) => ({ name: (i.name || "").toString(), amount: Number(i.amount || 0) }))
        .filter((item) => item.name.trim() !== "" || item.amount > 0);
      payload.credit_debt = (formData.credit_debt_items || [])
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      payload.secured_debt = (formData.secured_debt_items || [])
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      payload.priority_debt = (formData.priority_debt_items || [])
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      payload.debt_cause_description = formData.debt_cause_description || "";

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result;
      try {
        result = await res.json();
      } catch (e) {
        result = null;
      }

      const hasError = !res.ok || (result && result.status === "error");
      if (hasError) {
        const message = result?.message || res.statusText || "서버 오류";
        throw new Error(message);
      }

      alert("제출 완료!");
      localStorage.removeItem(STORAGE_KEY);
      return true;

    } catch (err) {
      console.error(err);
      alert(`제출 실패: ${err.message}`);
      return false;
    }

  };

  const steps = [
    { id: 1, title: "기본 정보" },
    { id: 2, title: "소득 · 지출" },
    { id: 3, title: "재산 정보" },
    { id: 4, title: "채무 정보" },
  ];

  const [completedSteps, setCompletedSteps] = useState([]);

  const markStepCompleted = (id) => {
    setCompletedSteps((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const handleAdvance = (currentId) => {
    const missing = getMissingFields(currentId, formData);
    if (missing.length > 0) {
      alert(`다음 단계로 넘어가려면 아래 항목을 입력해주세요.\n\n- ${missing.join("\n- ")}`);
      return;
    }
    markStepCompleted(currentId);
    setStep((s) => Math.min(4, currentId + 1));
  };

  const handleFinalSubmit = async () => {
    const missing = getMissingFields(4, formData);
    if (missing.length > 0) {
      alert(`제출하려면 아래 항목을 입력해주세요.\n\n- ${missing.join("\n- ")}`);
      return;
    }
    markStepCompleted(4);
    const success = await handleSubmit();
    if (success && typeof onComplete === "function") {
      onComplete(formData);
    }
  };

  const isStepComplete = (id) => {
    return isStepCompleteFor(formData, id);
  };

  const isStepCompleteFor = (data, id) => {
    try {
      return getMissingFields(id, data).length === 0;
    } catch (e) {
      return false;
    }
  };

  // 단계별 필수 입력 항목이 비어 있으면 사람이 읽을 수 있는 안내 문구 목록을 반환
  const getMissingFields = (id, data) => {
    const missing = [];

    if (id === 1) {
      if ((data.name || "").toString().trim() === "") missing.push("이름");
      if ((data.birthdate || "").toString().trim() === "") missing.push("생년월일");
      if ((data.gender || "").toString().trim() === "") missing.push("성별");
      if ((data.region || "").toString().trim() === "") missing.push("거주지역");
    }

    if (id === 2) {
      const items = Array.isArray(data.living_expenses) ? data.living_expenses : [];
      const sumAmounts = items.reduce((s, it) => s + Number(it.amount || 0), 0);
      if ((data.job || "").toString().trim() === "") missing.push("직업");
      if ((data.work_period || "").toString().trim() === "") missing.push("근무기간");
      if (!(Number(data.monthly_income) > 0)) missing.push("월 소득");
      if (!(sumAmounts > 0)) missing.push("생활비 (항목명과 금액을 1개 이상 입력)");
    }

    // id === 3 (재산 정보): 보유 재산이 없을 수 있으므로 필수 항목 없음 — 항상 통과

    if (id === 4) {
      const creditTotal = (Array.isArray(data.credit_debt_items) ? data.credit_debt_items : [])
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const securedTotal = (Array.isArray(data.secured_debt_items) ? data.secured_debt_items : [])
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const priorityTotal = (Array.isArray(data.priority_debt_items) ? data.priority_debt_items : [])
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const hasDebtCause = Array.isArray(data.debt_causes) && data.debt_causes.length > 0;
      if (!(creditTotal > 0 || securedTotal > 0 || priorityTotal > 0 || hasDebtCause)) {
        missing.push("채무 금액(신용/담보/우선변제 중 최소 하나) 또는 채무 원인 선택");
      }
    }

    return missing;
  };
  return (
    <div className="input-page-container">

      {/* 진행바 (chapter titles only, left-to-right) */}
      <div className="progress-bar">
        {steps.map((item, index) => {
          // Completed only when explicitly marked (user advanced with filled fields)
          const completed = completedSteps.includes(item.id);
          const active = step === item.id;
          return (
            <div
              className={`progress-item ${completed ? "completed" : "incomplete"} ${active ? "active" : ""}`}
              key={item.id}
            >
              <div className="progress-text">{item.title}</div>

              {index < steps.length - 1 && (
                <div className={`progress-sep ${completed ? "completed" : ""}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* 현재 단계 화면 */}

      <div className="tab-content">

        {step === 1 && (
          <BasicInfo
            data={formData}
            onChange={handleChange}
            onNext={() => handleAdvance(1)}
          />
        )}

        {step === 2 && (
          <IncomeInfo
            data={formData}
            onChange={handleChange}
            onCheckboxChange={handleCheckboxChange}
            onPrev={() => setStep(1)}
            onNext={() => handleAdvance(2)}
          />
        )}

        {step === 3 && (
          <AssetInfo
            data={formData}
            onChange={handleChange}
            onCheckboxChange={handleCheckboxChange}
            onPrev={() => setStep(2)}
            onNext={() => handleAdvance(3)}
          />
        )}

        {step === 4 && (
          <DebtInfo
            data={formData}
            onChange={handleChange}
            onCheckboxChange={handleCheckboxChange}
            onPrev={() => setStep(3)}
            onSubmit={handleFinalSubmit}
          />
        )}

      </div>

      {/* 하단 버튼 */}

      <div className="navigation-bar">

        <div className="temp-save-wrapper">

          <button
            className="btn-temp-save"
            onClick={handleTempSave}
          >
            💾 임시 저장
          </button>

        </div>

        {/* step-buttons-wrapper removed to keep a single Next button */}

      </div>

    </div>
  );
}

export default InputPage;