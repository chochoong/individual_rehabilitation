import React, { useState } from "react";
import "./ApplicationForm.css";

// 천 단위 콤마 포맷 함수 (숫자만 추출 후 3자리마다 콤마 추가)
const formatNumber = (value) => {
  if (!value) return "";
  const onlyNums = String(value).replace(/[^0-9]/g, "");
  return onlyNums.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function ApplicationForm({ onSubmit, onSaveDraft, onPrev }) {
  const [formData, setFormData] = useState({
    // 1. 기본 정보
    name: "",
    region: "",
    dependents: "",
    hasHistory: false,

    // 2. 소득 및 지출 정보
    job: "",
    workPeriod: "",
    monthlyIncome: "",
    expenses: {
      food: false,
      transport: false,
      telecom: false,
    },

    // 3. 재산 정보
    realEstate: "",
    realEstatePrice: "",
    mortgage: "",
    car: "",
    financeAssets: {
      deposit: false,
      savings: false,
      stocks: false,
    },

    // 4. 채무 정보
    creditDebt: "",
    securedDebt: "",
    priorityDebt: "",
    debtReasons: {
      living: false,
      business: false,
      gambling: false,
      stocks: false,
      crypto: false,
      etc: false,
    },
  });

  // 일반 입력 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 금액 입력 전용 핸들러 (천 단위 콤마 자동 적용)
  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = formatNumber(value);
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  // 체크박스 그룹 핸들러
  const handleGroupCheckbox = (category, key) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  // 스크롤 이동
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 폼 유효성 검사 및 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    // 필수 항목 유효성 검사
    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.");
      scrollToSection("sec-basic");
      return;
    }

    if (!formData.monthlyIncome.trim()) {
      alert("월 소득을 입력해주세요.");
      scrollToSection("sec-income");
      return;
    }

    if (!formData.creditDebt.trim()) {
      alert("신용채무 금액을 입력해주세요. (없으시면 0 입력)");
      scrollToSection("sec-debt");
      return;
    }

    if (onSubmit) onSubmit(formData);
  };

  const handleDraft = () => {
    if (onSaveDraft) onSaveDraft(formData);
    else alert("임시 저장되었습니다.");
  };

  return (
    <div className="form-page-container">
      {/* 필수 항목 빨간 별표용 인라인 스타일 */}
      <style>{`
        .required-star {
          color: #e53e3e;
          margin-left: 4px;
          font-weight: bold;
        }
      `}</style>

      {/* 헤더 */}
      <header className="form-header">
        <h2>📋 개인회생 신청서 작성</h2>
        <p>신청을 위해 필요한 정보를 정확히 입력해주세요. (<span className="required-star">*</span> 표시 필수 항목)</p>
      </header>

      {/* Quick Navigation Tab */}
      <nav className="quick-nav">
        <button type="button" onClick={() => scrollToSection("sec-basic")}>📌 기본 정보</button>
        <button type="button" onClick={() => scrollToSection("sec-income")}>💰 소득 · 지출</button>
        <button type="button" onClick={() => scrollToSection("sec-asset")}>🏠 재산 정보</button>
        <button type="button" onClick={() => scrollToSection("sec-debt")}>💳 채무 정보</button>
      </nav>

      <form onSubmit={handleSubmit} className="single-page-form">
        
        {/* 1. 기본 정보 */}
        <section id="sec-basic" className="form-card">
          <div className="card-header">
            <h3>📌 기본 정보</h3>
            <span className="card-sub">신청자의 기본 인적사항을 입력해주세요.</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>이름<span className="required-star">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
              />
            </div>
            <div className="form-group">
              <label>거주지역</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="예: 서울시 강남구"
              />
            </div>
            <div className="form-group">
              <label>부양가족 수</label>
              <input
                type="number"
                name="dependents"
                value={formData.dependents}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="form-group full-width">
              <label>이전 회생 / 파산 / 면책 이력</label>
              <label className="checkbox-chip">
                <input
                  type="checkbox"
                  name="hasHistory"
                  checked={formData.hasHistory}
                  onChange={handleChange}
                />
                <span>이전 신청 이력 있음</span>
              </label>
            </div>
          </div>
        </section>

        {/* 2. 소득 · 지출 정보 */}
        <section id="sec-income" className="form-card">
          <div className="card-header">
            <h3>💰 소득 · 지출 정보</h3>
            <span className="card-sub">현재 소득과 월평균 지출 항목을 입력해주세요.</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>직업</label>
              <input
                type="text"
                name="job"
                value={formData.job}
                onChange={handleChange}
                placeholder="예: 회사원, 자영업자"
              />
            </div>
            <div className="form-group">
              <label>근무기간</label>
              <input
                type="text"
                name="workPeriod"
                value={formData.workPeriod}
                onChange={handleChange}
                placeholder="예: 2년 6개월"
              />
            </div>
            <div className="form-group">
              <label>월 소득 (만원)<span className="required-star">*</span></label>
              <input
                type="text"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleAmountChange}
                placeholder="0"
              />
            </div>
            <div className="form-group full-width">
              <label>주요 생활비 지출 항목</label>
              <div className="chip-group">
                {[
                  { key: "food", label: "식비" },
                  { key: "transport", label: "교통비" },
                  { key: "telecom", label: "통신비" },
                ].map((item) => (
                  <label key={item.key} className="checkbox-chip">
                    <input
                      type="checkbox"
                      checked={formData.expenses[item.key]}
                      onChange={() => handleGroupCheckbox("expenses", item.key)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. 재산 정보 */}
        <section id="sec-asset" className="form-card">
          <div className="card-header">
            <h3>🏠 재산 정보</h3>
            <span className="card-sub">현재 보유하고 있는 자산 내역을 입력해주세요.</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>부동산</label>
              <input
                type="text"
                name="realEstate"
                value={formData.realEstate}
                onChange={handleChange}
                placeholder="예: 아파트, 빌라, 임차보증금"
              />
            </div>
            <div className="form-group">
              <label>부동산 시세 (만원)</label>
              <input
                type="text"
                name="realEstatePrice"
                value={formData.realEstatePrice}
                onChange={handleAmountChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>담보대출 (만원)</label>
              <input
                type="text"
                name="mortgage"
                value={formData.mortgage}
                onChange={handleAmountChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>자동차</label>
              <input
                type="text"
                name="car"
                value={formData.car}
                onChange={handleChange}
                placeholder="예: 중형 차종 / 연식"
              />
            </div>
            <div className="form-group full-width">
              <label>금융자산 보유 현황</label>
              <div className="chip-group">
                {[
                  { key: "deposit", label: "예금" },
                  { key: "savings", label: "적금" },
                  { key: "stocks", label: "주식" },
                ].map((item) => (
                  <label key={item.key} className="checkbox-chip">
                    <input
                      type="checkbox"
                      checked={formData.financeAssets[item.key]}
                      onChange={() => handleGroupCheckbox("financeAssets", item.key)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. 채무 정보 */}
        <section id="sec-debt" className="form-card">
          <div className="card-header">
            <h3>💳 채무 정보</h3>
            <span className="card-sub">현재 부담하고 계신 채무 상태를 입력해주세요.</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>신용채무 (만원)<span className="required-star">*</span></label>
              <input
                type="text"
                name="creditDebt"
                value={formData.creditDebt}
                onChange={handleAmountChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>담보채무 (만원)</label>
              <input
                type="text"
                name="securedDebt"
                value={formData.securedDebt}
                onChange={handleAmountChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>우선 변제 채무 (만원)</label>
              <input
                type="text"
                name="priorityDebt"
                value={formData.priorityDebt}
                onChange={handleAmountChange}
                placeholder="0"
              />
            </div>
            <div className="form-group full-width">
              <label>주요 채무 원인 (다중 선택 가능)</label>
              <div className="chip-group">
                {[
                  { key: "living", label: "생활비" },
                  { key: "business", label: "사업 자금" },
                  { key: "gambling", label: "도박" },
                  { key: "stocks", label: "주식" },
                  { key: "crypto", label: "코인" },
                  { key: "etc", label: "기타" },
                ].map((item) => (
                  <label key={item.key} className="checkbox-chip">
                    <input
                      type="checkbox"
                      checked={formData.debtReasons[item.key]}
                      onChange={() => handleGroupCheckbox("debtReasons", item.key)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 하단 버튼 영역 */}
        <div className="form-actions">
          <button type="button" className="btn-prev" onClick={onPrev}>
            ← 이전
          </button>
          <div className="right-actions">
            <button type="button" className="btn-draft" onClick={handleDraft}>
              💾 임시 저장
            </button>
            <button type="submit" className="btn-submit">
              제출하기 →
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}