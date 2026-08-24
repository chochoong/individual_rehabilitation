// CaseChart.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CaseChart from "./CaseChart";

// -----------------------------------------------------------------------------
// recharts 모킹 안내
// -----------------------------------------------------------------------------
// jsdom 환경에서는 ResizeObserver가 기본으로 존재하지 않고, recharts의
// <ResponsiveContainer>가 부모 요소의 실제 픽셀 크기(getBoundingClientRect)를
// 읽어 width/height를 계산하는데 jsdom에서는 이 값이 항상 0으로 반환된다.
// 그 결과 <LineChart>/<BarChart> 내부의 <svg>가 렌더되지 않거나 축/선/막대
// 요소를 DOM에서 찾을 수 없는 문제가 널리 알려져 있다.
//
// 이를 우회하기 위해 recharts 모듈 전체를 가벼운 스텁 컴포넌트로 모킹한다.
// - ResponsiveContainer/LineChart/BarChart 는 자신에게 전달된 data/props를
//   data-testid, data-* 속성으로 노출하는 단순 div로 대체한다.
// - XAxis/YAxis/Tooltip/CartesianGrid 는 렌더 결과에 영향이 없으므로 null.
// - Cell 은 fill 색상을 data-fill 속성으로 노출한다.
// 이렇게 하면 CaseChart가 recharts 컴포넌트에 "무엇을(data, 색상 등)" 전달하는지
// 검증할 수 있고, recharts 내부의 SVG 렌더링(축 눈금, path 좌표 계산 등)은
// 이 컴포넌트의 책임이 아니므로 검증 범위에서 제외한다.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ data, children }) => (
    <div data-testid="line-chart" data-points={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: (props) => <div data-testid="line" data-datakey={props.dataKey} />,
  BarChart: ({ data, children }) => (
    <div data-testid="bar-chart" data-points={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ children }) => <div data-testid="bar">{children}</div>,
  Cell: (props) => <div data-testid="cell" data-fill={props.fill} />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

// 테스트에서 반복 사용할 기본 chartData
const baseChartData = {
  income: 350,
  debtBefore: 8700,
  debtAfter: 2300,
  payment: 60,
  period: 36,
  rate: 27,
};

describe("CaseChart", () => {
  it("요약 카드 4개(월 소득, 월 변제금, 변제 기간, 변제율)를 올바른 값으로 렌더링한다", () => {
    render(<CaseChart chartData={baseChartData} />);

    expect(screen.getByText("월 소득")).toBeInTheDocument();
    expect(screen.getByText("350만원")).toBeInTheDocument();

    expect(screen.getByText("월 변제금")).toBeInTheDocument();
    expect(screen.getByText("60만원")).toBeInTheDocument();

    expect(screen.getByText("변제 기간")).toBeInTheDocument();
    expect(screen.getByText("36개월")).toBeInTheDocument();

    // "변제율" 텍스트는 요약 카드 라벨(span)과 변제율 바 섹션 제목(h4)에 중복으로
    // 존재하므로 getAllByText로 두 곳 모두 렌더링됐는지 확인한다.
    expect(screen.getAllByText("변제율").length).toBe(2);
    // "27%" 도 요약 카드 값과 변제율 바 텍스트 양쪽에 나타난다.
    expect(screen.getAllByText("27%").length).toBeGreaterThanOrEqual(1);
  });

  it("숫자가 큰 경우 toLocaleString 형식(천 단위 콤마)으로 표시한다", () => {
    render(
      <CaseChart
        chartData={{ ...baseChartData, income: 12345, payment: 6789 }}
      />
    );

    expect(screen.getByText("12,345만원")).toBeInTheDocument();
    expect(screen.getByText("6,789만원")).toBeInTheDocument();
  });

  it("변제율 요약 카드에는 highlight 클래스가 적용되고 다른 카드에는 적용되지 않는다", () => {
    render(<CaseChart chartData={baseChartData} />);

    // "변제율" 텍스트는 요약 카드 라벨(span.summary-label)과 변제율 바 섹션 제목(h4)
    // 두 곳에 존재하므로, summary-label 클래스를 가진 span만 선택해 카드를 찾는다.
    const rateLabel = screen
      .getAllByText("변제율")
      .find((el) => el.className === "summary-label");
    const rateCard = rateLabel.closest(".summary-card");
    expect(rateCard).toHaveClass("summary-card", "highlight");

    const incomeLabel = screen.getByText("월 소득");
    const incomeCard = incomeLabel.closest(".summary-card");
    expect(incomeCard).toHaveClass("summary-card");
    expect(incomeCard).not.toHaveClass("highlight");
  });

  it("채무 변동 추이 제목에 변제 기간(개월)이 표시된다", () => {
    render(<CaseChart chartData={baseChartData} />);

    expect(
      screen.getByRole("heading", {
        name: "채무 변동 추이 (36개월, 연차별 예상)",
      })
    ).toBeInTheDocument();
  });

  it("채무 변동 추이 하단 설명에 변제 전/후 금액과 기간이 포함된다", () => {
    render(<CaseChart chartData={baseChartData} />);

    const note = screen.getByText((_, element) => {
      return (
        element?.tagName?.toLowerCase() === "p" &&
        element?.className === "chart-note"
      );
    });

    expect(note.textContent).toContain("8,700만원");
    expect(note.textContent).toContain("2,300만원");
    expect(note.textContent).toContain("36개월");
    expect(note.textContent).toContain("균등 변제된다고 가정한 예상치입니다");
  });

  it("calcYearlyDebtProgress 계산 결과가 그대로 LineChart에 전달된다 (debtAfter를 시작값으로 연차별 균등 감소)", () => {
    render(<CaseChart chartData={baseChartData} />);

    const lineChart = screen.getByTestId("line-chart");
    const points = JSON.parse(lineChart.getAttribute("data-points"));

    // debtBefore=8700, debtAfter=2300, period=36개월(3년) 기준
    // 시작값은 debtAfter(2300)이며, 균등 변제 가정 하에 연차별로 0까지 감소한다.
    expect(points).toEqual([
      { label: "시작", months: 0, debt: 2300 },
      { label: "1년차", months: 12, debt: 1533 },
      { label: "2년차", months: 24, debt: 767 },
      { label: "3년차", months: 36, debt: 0 },
    ]);
  });

  it("월 소득 대비 변제금 BarChart에 [월 소득, 월 변제금] 순서로 데이터가 전달된다", () => {
    render(<CaseChart chartData={baseChartData} />);

    expect(
      screen.getByRole("heading", { name: "월 소득 대비 변제금" })
    ).toBeInTheDocument();

    const barChart = screen.getByTestId("bar-chart");
    const points = JSON.parse(barChart.getAttribute("data-points"));

    expect(points).toEqual([
      { name: "월 소득", value: 350 },
      { name: "월 변제금", value: 60 },
    ]);
  });

  it("막대 그래프의 Cell이 월 소득(주황)→월 변제금(초록) 순서의 색상으로 렌더링된다", () => {
    render(<CaseChart chartData={baseChartData} />);

    const cells = screen.getAllByTestId("cell");
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveAttribute("data-fill", "#f59e0b");
    expect(cells[1]).toHaveAttribute("data-fill", "#10b981");
  });

  it("변제율 바(progress bar)의 너비는 rate(%)만큼 채워지고 텍스트로도 표시된다", () => {
    render(<CaseChart chartData={baseChartData} />);

    const fillBar = document.querySelector(".rate-bar-fill");
    expect(fillBar).toHaveStyle({ width: "27%" });
    // "27%" 는 요약 카드 값과 변제율 바 텍스트 두 곳에 나타나므로
    // getByText 대신 rate-bar-text 요소를 직접 지정해 검증한다.
    expect(document.querySelector(".rate-bar-text")).toHaveTextContent("27%");
  });

  it("rate가 100을 초과하면 바 너비는 100%로 클램프되지만, 텍스트는 원래 값 그대로 표시된다", () => {
    render(<CaseChart chartData={{ ...baseChartData, rate: 150 }} />);

    const fillBar = document.querySelector(".rate-bar-fill");
    expect(fillBar).toHaveStyle({ width: "100%" });
    // "150%" 역시 요약 카드와 변제율 바 두 곳에 나타난다.
    expect(document.querySelector(".rate-bar-text")).toHaveTextContent("150%");
  });

  it("모든 수치가 0인 엣지 케이스에서도 에러 없이 렌더링되고 0 값이 그대로 표시된다", () => {
    const zeroChartData = {
      income: 0,
      debtBefore: 0,
      debtAfter: 0,
      payment: 0,
      period: 0,
      rate: 0,
    };

    render(<CaseChart chartData={zeroChartData} />);

    expect(screen.getAllByText("0만원")).toHaveLength(2); // 월 소득, 월 변제금
    expect(screen.getByText("0개월")).toBeInTheDocument();
    expect(screen.getAllByText("0%").length).toBeGreaterThanOrEqual(1);

    // period가 0이면 calcYearlyDebtProgress는 "시작" 항목 하나만 반환한다.
    const lineChart = screen.getByTestId("line-chart");
    const points = JSON.parse(lineChart.getAttribute("data-points"));
    expect(points).toEqual([{ label: "시작", months: 0, debt: 0 }]);

    const fillBar = document.querySelector(".rate-bar-fill");
    expect(fillBar).toHaveStyle({ width: "0%" });
  });

  it("변제율 바 제목 섹션이 렌더링된다", () => {
    render(<CaseChart chartData={baseChartData} />);

    expect(
      screen.getByRole("heading", { name: "변제율" })
    ).toBeInTheDocument();
  });
});
