function DebtInfo({ data, onChange, onCheckboxChange, onPrev, onSubmit }) {
    const causeOptions = ["생활비", "사업 자금", "도박", "주식", "코인", "기타"];

    return (
        <div className="basic-container">

            <h2>💳 채무 정보</h2>

            <p className="description">
                현재 보유한 채무 정보를 입력해주세요.
            </p>

            <hr />

            <div className="form-group">
                <label>신용채무</label>

                <input
                    type="number"
                    placeholder="0"
                    value={data.credit_debt}
                    onChange={(e) => onChange("credit_debt", Number(e.target.value))}
                />
            </div>

            <div className="form-group">
                <label>담보채무</label>

                <input
                    type="number"
                    placeholder="0"
                    value={data.secured_debt}
                    onChange={(e) => onChange("secured_debt", Number(e.target.value))}
                />
            </div>

            <div className="form-group">
                <label>우선 변제 채무</label>

                <input
                    type="number"
                    placeholder="0"
                    value={data.priority_debt}
                    onChange={(e) => onChange("priority_debt", Number(e.target.value))}
                />
            </div>

            <div className="form-group">
                <label>채무 원인</label>

                <div className="checkbox-group">
                    {causeOptions.map((cause) => (
                        <label key={cause}>
                            <input
                                type="checkbox"
                                checked={(data.debt_causes || []).includes(cause)}
                                onChange={() => onCheckboxChange("debt_causes", cause)}
                            />
                            {cause}
                        </label>
                    ))}
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

                <button onClick={onSubmit}>
                    제출하기
                </button>
            </div>

        </div>
    );
}

export default DebtInfo;