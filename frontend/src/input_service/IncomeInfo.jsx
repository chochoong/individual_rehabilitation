function IncomeInfo({
    data,
    onChange,
    onCheckboxChange,
    onPrev,
    onNext,
}) {
    return (
        <div className="basic-container">

            <h2>💰 소득 · 지출 정보</h2>

            <p className="description">
                현재 소득과 월평균 지출을 입력해주세요.
            </p>

            <hr />

            <div className="form-group">
                <label>직업</label>

                <input
                    type="text"
                    placeholder="예) 회사원"
                    value={data.job}
                    onChange={(e) =>
                        onChange("job", e.target.value)
                    }
                />
            </div>

            <div className="form-group">
                <label>근무기간</label>

                <input
                    type="text"
                    placeholder="예) 5년"
                    value={data.work_period}
                    onChange={(e) =>
                        onChange("work_period", e.target.value)
                    }
                />
            </div>

            <div className="form-group">
                <label>월 소득</label>

                <input
                    type="number"
                    placeholder="0"
                    value={data.monthly_income}
                    onChange={(e) =>
                        onChange(
                            "monthly_income",
                            Number(e.target.value)
                        )
                    }
                />
            </div>

            <div className="form-group">
                <label>생활비</label>

                <div className="checkbox-group">

                    <label>
                        <input
                            type="checkbox"
                            checked={data.living_expenses.includes("식비")}
                            onChange={() =>
                                onCheckboxChange("living_expenses", "식비")
                            }
                        />
                        식비
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={data.living_expenses.includes("교통비")}
                            onChange={() =>
                                onCheckboxChange("living_expenses", "교통비")
                            }
                        />
                        교통비
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={data.living_expenses.includes("통신비")}
                            onChange={() =>
                                onCheckboxChange("living_expenses", "통신비")
                            }
                        />
                        통신비
                    </label>

                </div>

            </div>

            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <button onClick={onPrev}>
                    ← 이전
                </button>

                <button onClick={onNext}>
                    다음 →
                </button>
            </div>

        </div>
    );
}

export default IncomeInfo;