import "./BasicInfo.css";

function BasicInfo({ data, onChange, onNext }) {
    return (
        <div className="basic-container">

            <h2>📌 기본 정보 입력</h2>

            <p className="description">
                개인회생 신청을 위해 기본 정보를 입력해주세요.
                <br />
                입력한 내용은 자동으로 저장됩니다.
            </p>

            <hr />

            <div className="form-group">
                <label>이름 <span style={{ color: "#e11d48" }}>*</span></label>

                <input
                    type="text"
                    placeholder="예) 홍길동"
                    value={data.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>생년월일 <span style={{ color: "#e11d48" }}>*</span></label>
                <input
                    type="date"
                    value={data.birthdate || ""}
                    onChange={(e) => onChange("birthdate", e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>성별 <span style={{ color: "#e11d48" }}>*</span></label>
                <div className="radio-group">
                    <label className="radio-inline">
                        <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={data.gender === "male"}
                            onChange={(e) => onChange("gender", e.target.value)}
                        />
                        남자
                    </label>
                    <label className="radio-inline">
                        <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={data.gender === "female"}
                            onChange={(e) => onChange("gender", e.target.value)}
                        />
                        여자
                    </label>
                    
                </div>
            </div>

            <div className="form-group">
                <label>거주지역 <span style={{ color: "#e11d48" }}>*</span></label>

                <input
                    type="text"
                    placeholder="예) 광주광역시 북구"
                    value={data.region || ""}
                    onChange={(e) => onChange("region", e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>부양가족 수</label>

                <input
                    type="number"
                    placeholder="0"
                    value={data.dependents ?? ""}
                    onChange={(e) =>
                        onChange("dependents", e.target.value === "" ? "" : Number(e.target.value))
                    }
                />
            </div>

            <div className="form-group">
                <label>이전 회생 / 파산 / 면책 이력</label>

                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        checked={!!data.has_rehab_history}
                        onChange={(e) =>
                            onChange("has_rehab_history", e.target.checked)
                        }
                    />
                </div>
            </div>

            <div className="button-group center">
                <button className="next-btn" onClick={onNext}>
                    다음 →
                </button>
            </div>

        </div>
    );
}

export default BasicInfo;