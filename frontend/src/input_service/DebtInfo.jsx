import "./DebtInfo.css";

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

function DebtInfo({
    data,
    onChange,
    onCheckboxChange,
    onPrev,
    onSubmit,
}) {

    const causeOptions = [
        "생활비",
        "사업 자금",
        "도박",
        "주식",
        "코인",
        "기타",
    ];

    const debtGroups = [
        {
            field: "credit_debt_items",
            title: "신용채무",
            placeholder: "예) 카드빚, 개인신용대출",
        },
        {
            field: "secured_debt_items",
            title: "담보채무",
            placeholder: "예) 전세자금 대출, 주택담보대출",
        },
        {
            field: "priority_debt_items",
            title: "우선 변제 채무",
            placeholder: "예) 임차보증금 반환채무, 우선변제권 대출",
        },
    ];

    return (
        <div className="basic-container">

            <h2>💳 채무 정보</h2>

            <p className="description">
                현재 보유한 채무 정보를 입력해주세요.
                <br />
                입력한 내용은 자동으로 저장됩니다.
            </p>

            <hr />

            <p style={{ fontSize: "0.85em", color: "#6b7280" }}>
                * 채무 금액(신용/담보/우선변제 중 최소 하나) 또는 채무 원인 중 최소 한 가지는 입력해주세요.
            </p>

            {debtGroups.map((group) => {
                const items = Array.isArray(data[group.field]) ? data[group.field] : [{ name: "", amount: 0 }];
                const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                return (
                    <div className="form-group" key={group.field}>
                        <div className="debt-group-header">
                            <label>{group.title}</label>
                            <span className="debt-total">총액: {total.toLocaleString()}원</span>
                        </div>
                        <div className="debt-group">
                            {items.map((item, idx) => (
                                <div className="debt-item" key={idx}>
                                    <div className="debt-row-header">
                                        <span>{group.title} {idx + 1}</span>
                                        <button
                                            type="button"
                                            className="remove-debt-btn"
                                            onClick={() => {
                                                const next = items.slice();
                                                next.splice(idx, 1);
                                                if (next.length === 0) {
                                                    next.push({ name: "", amount: 0 });
                                                }
                                                onChange(group.field, next);
                                            }}
                                            disabled={items.length <= 1}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                    <label>채무 종류</label>
                                    <input
                                        type="text"
                                        placeholder={group.placeholder}
                                        value={item.name || ""}
                                        onChange={(e) => {
                                            const next = items.slice();
                                            next[idx] = { ...(next[idx] || { name: "", amount: 0 }), name: e.target.value };
                                            onChange(group.field, next);
                                        }}
                                    />
                                    <label>금액</label>
                                    <div className="money-input-row">
                                        <input
                                            type="text"
                                            placeholder="예) 1,000,000"
                                            value={item.amount ? formatMoney(item.amount) : ""}
                                            onChange={(e) => {
                                                const next = items.slice();
                                                next[idx] = {
                                                    ...(next[idx] || { name: "", amount: 0 }),
                                                    amount: parseMoney(e.target.value),
                                                };
                                                onChange(group.field, next);
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
                            className="add-debt-btn"
                            onClick={() => {
                                const next = items.slice();
                                next.push({ name: "", amount: 0 });
                                onChange(group.field, next);
                            }}
                        >
                            항목 추가
                        </button>
                    </div>
                );
            })}

            <div className="form-group">
                <label>채무 원인</label>
                <div className="checkbox-group">
                    {causeOptions.map((cause) => (
                        <label key={cause}>
                            <input
                                type="checkbox"
                                checked={(data.debt_causes || []).includes(cause)}
                                onChange={() =>
                                    onCheckboxChange(
                                        "debt_causes",
                                        cause
                                    )
                                }
                            />
                            {cause}
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>채무 사유 설명</label>
                <textarea
                    placeholder="채무가 발생한 이유를 간략히 적어주세요. 예: 생활비 부족으로 인한 카드론, 사업 부진으로 인한 운영자금 차입 등"
                    value={data.debt_cause_description || ""}
                    onChange={(e) => onChange("debt_cause_description", e.target.value)}
                />
            </div>

            <div className="button-group">
                <button
                    className="prev-btn"
                    onClick={onPrev}
                >
                    ← 이전
                </button>

                <button
                    className="submit-btn"
                    onClick={onSubmit}
                >
                    제출하기
                </button>
            </div>
        </div>
    );
}

export default DebtInfo;