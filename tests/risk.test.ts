import { describe, expect, it } from "vitest";
import { calculateRiskPlan } from "../src/market/risk";

describe("calculateRiskPlan", () => {
  const base = { side: "LONG" as const, accountEquity: 1000, riskPercent: 1, entryPrice: 100, stopPrice: 95, targetR: 2, feeBps: 0, slippageBps: 0 };

  it("sizes a long position from a fixed cash risk budget", () => {
    const result = calculateRiskPlan(base);
    expect(result.riskBudget).toBe(10);
    expect(result.quantity).toBe(2);
    expect(result.targetPrice).toBe(110);
    expect(result.estimatedLossAtStop).toBe(10);
    expect(result.rewardRisk).toBe(2);
  });

  it("calculates short targets below entry", () => {
    const result = calculateRiskPlan({ ...base, side: "SHORT", stopPrice: 105 });
    expect(result.targetPrice).toBe(90);
  });

  it("includes estimated fees and slippage in position sizing", () => {
    const result = calculateRiskPlan({ ...base, feeBps: 10, slippageBps: 5 });
    expect(result.quantity).toBeLessThan(2);
    expect(result.estimatedCosts).toBeGreaterThan(0);
    expect(result.estimatedLossAtStop).toBeCloseTo(10);
  });

  it("rejects invalid stop placement", () => {
    expect(() => calculateRiskPlan({ ...base, stopPrice: 101 })).toThrow();
  });

  it("rejects zero entry-stop distance and invalid equity", () => {
    expect(() => calculateRiskPlan({ ...base, stopPrice: 100 })).toThrow();
    expect(() => calculateRiskPlan({ ...base, accountEquity: 0 })).toThrow();
  });
});
