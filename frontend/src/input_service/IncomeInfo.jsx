import "./IncomeInfo.css";

const formatMoney = (value) => {
    if (value === undefined || value === null || value === "") return "";
    const number = Number(value);
    if (Number.isNaN(number)) return "";
    return number.toLocaleString();
};

const parseMoney = (value) => {
    const numeric = String(value).replace(/,/g, "").replace(/[^0-9]/g, "");
    return numeric === "" ? 0 : Number(numeric);
};

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
                현재 소득과 월평균 지출 정보를 입력해주세요.
                <br />
                입력한 내용은 자동으로 저장됩니다.
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

                <div className="money-input-row">
                    <input
                        type="text"
                        placeholder="예) 2,500,000"
                        value={data.monthly_income ? formatMoney(data.monthly_income) : ""}
                        onChange={(e) =>
                            onChange(
                                "monthly_income",
                                parseMoney(e.target.value)
                            )
                        }
                    />
                    <span className="amount-preview">
                        {data.monthly_income ? `${formatMoney(data.monthly_income)}원` : ""}
                    </span>
                </div>
            </div>

            <div className="form-group">
                <label>생활비 (월 고정지출)</label>

                <div className="amounts-group">
                    {((Array.isArray(data.living_expenses) && data.living_expenses.length > 0)
                        ? data.living_expenses
                        : [{ name: "", amount: 0 }]
                    ).map((item, idx) => (
                        <div className="amount-item" key={idx}>
                            <div className="amount-row-header">
                                <span>항목 {idx + 1}</span>
                                <button
                                    type="button"
                                    className="remove-expense-btn"
                                    onClick={() => {
                                        const next = Array.isArray(data.living_expenses)
                                            ? data.living_expenses.slice()
                                            : [];
                                        next.splice(idx, 1);
                                        if (next.length === 0) {
                                            next.push({ name: "", amount: 0 });
                                        }
                                        onChange("living_expenses", next);
                                    }}
                                    disabled={!Array.isArray(data.living_expenses) || data.living_expenses.length <= 1}
                                >
                                    삭제
                                </button>
                            </div>
                            <label>항목</label>
                            <input
                                type="text"
                                placeholder="예: 식비, 교통비, 통신비, 보험비"
                                value={item.name || ""}
                                onChange={(e) => {
                                    const next = Array.isArray(data.living_expenses)
                                        ? data.living_expenses.slice()
                                        : [];
                                    next[idx] = { ...(next[idx] || {}), name: e.target.value };
                                    if (idx === next.length - 1 && e.target.value.trim() !== "") {
                                        next.push({ name: "", amount: 0 });
                                    }
                                    onChange("living_expenses", next);
                                }}
                            />
                            <label>금액</label>
                            <div className="money-input-row">
                                <input
                                    type="text"
                                    placeholder="예) 200,000"
                                    value={item.amount ? formatMoney(item.amount) : ""}
                                    onChange={(e) => {
                                        const next = Array.isArray(data.living_expenses)
                                            ? data.living_expenses.slice()
                                            : [{ name: "", amount: 0 }];
                                        next[idx] = {
                                            ...(next[idx] || {}),
                                            amount: parseMoney(e.target.value),
                                        };
                                        onChange("living_expenses", next);
                                    }}
                                />
                                <span className="amount-preview">
                                    {item.amount ? `${formatMoney(item.amount)}원` : ""}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="add-expense-btn"
                    onClick={() => {
                        const next = Array.isArray(data.living_expenses)
                            ? data.living_expenses.slice()
                            : [];
                        next.push({ name: "", amount: 0 });
                        onChange("living_expenses", next);
                    }}
                >
                    항목 추가
                </button>
            </div>

            <div className="button-group">

                <button
                    className="prev-btn"
                    onClick={onPrev}
                >
                    ← 이전
                </button>

                <button
                    className="next-btn"
                    onClick={onNext}
                >
                    다음 →
                </button>

            </div>

        </div>
    );
}

export default IncomeInfo;