export function extractChartData(fullText) {
  if (!fullText) {
    return { income: 0, debtBefore: 0, debtAfter: 0, payment: 0, period: 0, rate: 0 };
  }

  const findValue = (pattern) => {
    const match = fullText.match(pattern);
    return match;
  };

  // 1. 월 소득
  const incomeMatch = findValue(/월\s*소득[:\s]*([0-9,]+)\s*만/);
  const income = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, ""), 10) : 0;

  // 2. 채무 변동 (변제 전 -> 변제 후)
  let debtBefore = 0;
  let debtAfter = 0;

  const debtMatch = fullText.match(/(?:채무\s*변동|채무\s*조정)[:\s]*([^\n]+)/);

  if (debtMatch) {
    const content = debtMatch[1].trim();
    
    // 화살표(→, ->, >) 또는 구분 기호가 있는 경우
    if (/[→>|-]/.test(content)) {
      const parts = content.split(/→|->|>|~/).map((p) => p.trim());
      debtBefore = parseKoreanMoney(parts[0]);
      debtAfter = parts[1] ? parseKoreanMoney(parts[1]) : 0;
    } 
    // 화살표 없이 "8천7백만 원 2천3백만 원" 공백으로만 구분된 경우
    else {
      // 한글 금액 단위 패턴으로 나눔
      const moneyMatches = content.match(/((?:\d+억)?\s*(?:\d+천)?\s*(?:\d+백)?\s*(?:\d+십)?\s*\d*\s*만?\s*원?)/g)
                                  ?.map(s => s.trim())
                                  .filter(Boolean);

      if (moneyMatches && moneyMatches.length >= 2) {
        debtBefore = parseKoreanMoney(moneyMatches[0]);
        debtAfter = parseKoreanMoney(moneyMatches[1]);
      } else {
        debtBefore = parseKoreanMoney(content);
      }
    }
  }

  // 3. 월 변제금
  const paymentMatch = findValue(/월\s*변제금[:\s]*([0-9,]+)\s*만/);
  const payment = paymentMatch ? parseInt(paymentMatch[1].replace(/,/g, ""), 10) : 0;

  // 4. 변제 기간
  const periodMatch = findValue(/변제\s*기간[:\s]*([0-9]+)\s*개월/);
  const period = periodMatch ? parseInt(periodMatch[1], 10) : 36;

  // 5. 변제율
  const rateMatch = findValue(/변제율[:\s]*([0-9.]+)\s*%/);
  const rate = rateMatch ? parseFloat(rateMatch[1]) : 0;

  return { income, debtBefore, debtAfter, payment, period, rate };
}


/**
 * 한글 금액 문자열을 읽어 '만원' 단위의 숫자(number)로 정확하게 변환
 * 예: "8천7백만 원" -> 8700
 * 예: "1억 2천만 원" -> 12000
 */
export function parseKoreanMoney(text) {
  if (!text) return 0;
  if (typeof text === "number") return text;

  let totalStr = text.replace(/,/g, "").trim();
  let totalNum = 0;

  // 1) '억' 단위 처리
  const ukMatch = totalStr.match(/(\d+)\s*억/);
  if (ukMatch) {
    totalNum += parseInt(ukMatch[1], 10) * 10000;
  }

  // '억' 이후 텍스트 추출 (만약 억 단위가 없다면 전체 텍스트)
  const remainder = ukMatch ? totalStr.split('억')[1] : totalStr;

  // 2) 만원 미만 단위 조합 (천, 백, 십, 일만) 파싱
  let manPartNum = 0;
  
  // "8천7백만" 또는 "8700만" 형태 대응
  const cheonMatch = remainder.match(/(\d+)\s*천/);
  const baekMatch = remainder.match(/(\d+)\s*백/);
  const sipMatch = remainder.match(/(\d+)\s*십/);
  const plainManMatch = remainder.match(/(\d+)\s*만/);

  if (cheonMatch) manPartNum += parseInt(cheonMatch[1], 10) * 1000;
  if (baekMatch) manPartNum += parseInt(baekMatch[1], 10) * 100;
  if (sipMatch) manPartNum += parseInt(sipMatch[1], 10) * 10;

  // '8천7백만'처럼 천/백이 뽑혔으나 '만' 자리에 숫자가 지정되지 않은 경우
  if (!cheonMatch && !baekMatch && !sipMatch && plainManMatch) {
    // "8700만" 처럼 숫자 전체가 들어간 형태
    manPartNum += parseInt(plainManMatch[1], 10);
  } else if (plainManMatch) {
    // "8천7백5만" 처럼 천/백 외에 '만' 앞 낱개 숫자가 더 있는 경우
    const lastDigits = plainManMatch[1].match(/\d+$/);
    if (lastDigits) {
      manPartNum += parseInt(lastDigits[0], 10);
    }
  }

  totalNum += manPartNum;

  // 순수 숫자만 적혀 있는 경우 예외 처리
  if (totalNum === 0) {
    const numOnly = totalStr.replace(/[^0-9]/g, "");
    if (numOnly) totalNum = parseInt(numOnly, 10);
  }

  return totalNum;
}


export function calcYearlyDebtProgress(debtBefore, debtAfter, periodMonths) {
  // 시작 금액을 전체 원금이 아닌 '총 변제 목표액(debtAfter)'으로 설정합니다.
  const startDebt = debtAfter; 
  const years = Math.ceil(periodMonths / 12); // 총 연차 계산 (36개월 -> 3년)

  const result = [];

  // 0년차(시작 시점): 변제해야 할 총 금액 (예: 2,300만원)
  result.push({
    label: "시작",
    months: 0,
    debt: startDebt,
  });

  // 연차별로 남은 변제금 계산 (3년차에 정확히 0원이 됨)
  for (let year = 1; year <= years; year++) {
    const elapsedMonths = Math.min(year * 12, periodMonths);
    const ratio = elapsedMonths / periodMonths;
    // 변제 진행률에 따라 remainingDebt가 0원까지 줄어듭니다.
    const remainingDebt = Math.round(startDebt * (1 - ratio));

    result.push({
      label: `${year}년차`,
      months: elapsedMonths,
      debt: remainingDebt,
    });
  }

  return result;
}

export function formatCorrectionText(text) {
  return text
    .replace(/([^\n])(\d+\.\s)/g, "$1\n$2")
    .trim();
}