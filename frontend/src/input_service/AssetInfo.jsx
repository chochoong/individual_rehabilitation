import "./AssetInfo.css";

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
                현재 보유하고 있는 재산 정보를 입력해주세요.
                <br />
                입력한 내용은 자동으로 저장됩니다.
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

                <div className="money-input-row">
                    <input
                        type="text"
                        placeholder="0"
                        value={data.real_estate_price ? formatMoney(data.real_estate_price) : ""}
                        onChange={(e) =>
                            onChange(
                                "real_estate_price",
                                parseMoney(e.target.value)
                            )
                        }
                    />
                    <span className="amount-preview">
                        {data.real_estate_price ? `${formatMoney(data.real_estate_price)}원` : ""}
                    </span>
                </div>
            </div>

            <div className="form-group">
                <label>담보대출</label>

                <div className="money-input-row">
                    <input
                        type="text"
                        placeholder="0"
                        value={data.mortgage_loan ? formatMoney(data.mortgage_loan) : ""}
                        onChange={(e) =>
                            onChange(
                                "mortgage_loan",
                                parseMoney(e.target.value)
                            )
                        }
                    />
                    <span className="amount-preview">
                        {data.mortgage_loan ? `${formatMoney(data.mortgage_loan)}원` : ""}
                    </span>
                </div>
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

                <div className="asset-group">
                    {((Array.isArray(data.financial_assets) && data.financial_assets.length > 0)
                        ? data.financial_assets
                        : [{ name: "", amount: 0 }]
                    ).map((asset, idx) => (
                        <div className="asset-item" key={idx}>
                            <div className="asset-row-header">
                                <span>금융자산 {idx + 1}</span>
                                <button
                                    type="button"
                                    className="remove-asset-btn"
                                    onClick={() => {
                                        const next = Array.isArray(data.financial_assets)
                                            ? data.financial_assets.slice()
                                            : [];
                                        next.splice(idx, 1);
                                        if (next.length === 0) {
                                            next.push({ name: "", amount: 0 });
                                        }
                                        onChange("financial_assets", next);
                                    }}
                                    disabled={!Array.isArray(data.financial_assets) || data.financial_assets.length <= 1}
                                >
                                    삭제
                                </button>
                            </div>
                            <label>종류</label>
                            <input
                                type="text"
                                placeholder="예) 예금, 적금, 주식"
                                value={asset?.name || ""}
                                onChange={(e) => {
                                    const next = Array.isArray(data.financial_assets)
                                        ? data.financial_assets.slice()
                                        : [{ name: "", amount: 0 }];
                                    next[idx] = { ...(next[idx] || { name: "", amount: 0 }), name: e.target.value };
                                    onChange("financial_assets", next);
                                }}
                            />
                            <label>금액</label>
                            <div className="money-input-row">
                                <input
                                    type="text"
                                    placeholder="예) 1,000,000"
                                    value={asset?.amount ? formatMoney(asset.amount) : ""}
                                    onChange={(e) => {
                                        const next = Array.isArray(data.financial_assets)
                                            ? data.financial_assets.slice()
                                            : [{ name: "", amount: 0 }];
                                        next[idx] = {
                                            ...(next[idx] || { name: "", amount: 0 }),
                                            amount: parseMoney(e.target.value),
                                        };
                                        onChange("financial_assets", next);
                                    }}
                                />
                                <span className="amount-preview">
                                    {asset?.amount ? `${formatMoney(asset.amount)}원` : ""}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="add-asset-btn"
                    onClick={() => {
                        const next = Array.isArray(data.financial_assets)
                            ? data.financial_assets.slice()
                            : [];
                        next.push({ name: "", amount: 0 });
                        onChange("financial_assets", next);
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

export default AssetInfo;