# input_service 기반 산출계산기

이 모듈은 팀원이 관리하는 `backend/input_service/`의 입력 모델을 받아 계산 결과를 생성한다.
기존 `api.py`, `schema.py`, 프론트엔드, 입력 서비스 파일은 수정하지 않는다.

## 입력

- `BasicInfo`
- `IncomeExpenseInfo`
- `AssetInfo`
- `DebtInfo`

## 호출 경계

`calculator.calculate_from_input_service(...)`에 네 입력 모델을 전달하면
`CalculationResponse`를 반환한다. 외부 API 연결은 기존 팀 API와 협의한 뒤 별도 추가한다.

## 현재 계산 범위

- 월소득에서 기준 생계비·추가 지출을 차감한 월 가용액
- 36개월 총 변제액 및 현재가치
- 신용채무 기준 원금 변제액·예상 감면액·감면율
- 입력된 재산의 단순 청산가치
- 담보·우선변제채무 포함 시 상세검토 상태 반환

채권자별 배당, 비면책 여부 확정, 관할별 법률판단은 이 모듈의 현재 범위가 아니다.
