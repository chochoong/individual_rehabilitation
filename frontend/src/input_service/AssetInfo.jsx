function AssetInfo({
    data,
    onChange,
    onCheckboxChange,
    onPrev,
    onNext,
}) {
    return (
        <div className="basic-container">

            <h2>🏠 재산 정보</h2>

            <p className="description">
                현재 보유하고 있는 재산을 입력해주세요.
            </p>

            <hr />

            <div className="form-group">
                <label>부동산</label>

                <input
                    type="text"
                    placeholder="예) 아파트"
                    value={data.real_estate}
                    onChange={(e) =>
                        onChange("real_estate", e.target.value)
                    }
                />
            </div>

            <div className="form-group">
                <label>부동산 시세</label>

                <input
                    type="number"
                    placeholder="0"
                    value={data.real_estate_price}
                    onChange={(e) =>
                        onChange(
                            "real_estate_price",
                            Number(e.target.value)
                        )
                    }
                />
            </div>

            <div className="form-group">
                <label>담보대출</label>

                <input
                    type="number"
                    placeholder="0"
                    value={data.mortgage_loan}
                    onChange={(e) =>
                        onChange(
                            "mortgage_loan",
                            Number(e.target.value)
                        )
                    }
                />
            </div>

            <div className="form-group">
                <label>자동차</label>

                <input
                    type="text"
                    placeholder="예) 아반떼"
                    value={data.car}
                    onChange={(e) =>
                        onChange("car", e.target.value)
                    }
                />
            </div>

            <div className="form-group">
                <label>금융자산</label>

                <div className="checkbox-group">

                    <label>
                        <input
                            type="checkbox"
                            checked={data.financial_assets.includes("예금")}
                            onChange={() =>
                                onCheckboxChange("financial_assets", "예금")
                            }
                        />
                        예금
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={data.financial_assets.includes("적금")}
                            onChange={() =>
                                onCheckboxChange("financial_assets", "적금")
                            }
                        />
                        적금
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={data.financial_assets.includes("주식")}
                            onChange={() =>
                                onCheckboxChange("financial_assets", "주식")
                            }
                        />
                        주식
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

export default AssetInfo;