export type TradeSide = "LONG" | "SHORT";

export interface RiskPlanInput {
  side: TradeSide;
  accountEquity: number;
  riskPercent: number;
  entryPrice: number;
  stopPrice: number;
  targetR: number;
  feeBps?: number;
  slippageBps?: number;
}

export interface RiskPlan {
  riskBudget: number;
  quantity: number;
  notional: number;
  stopDistance: number;
  stopDistancePercent: number;
  targetPrice: number;
  plannedReward: number;
  estimatedCosts: number;
  estimatedLossAtStop: number;
  rewardRisk: number;
}

export function calculateRiskPlan(input: RiskPlanInput): RiskPlan {
  const feeBps = input.feeBps ?? 0;
  const slippageBps = input.slippageBps ?? 0;
  const values = [input.accountEquity, input.riskPercent, input.entryPrice, input.stopPrice, input.targetR, feeBps, slippageBps];
  if (!values.every(Number.isFinite)) throw new Error("All risk inputs must be finite numbers.");
  if (input.accountEquity <= 0) throw new Error("Account equity must be greater than zero.");
  if (input.riskPercent <= 0 || input.riskPercent > 100) throw new Error("Risk percent must be greater than 0 and at most 100.");
  if (input.entryPrice <= 0 || input.stopPrice <= 0) throw new Error("Entry and stop prices must be greater than zero.");
  if (input.targetR <= 0) throw new Error("Target R must be greater than zero.");
  if (feeBps < 0 || slippageBps < 0 || feeBps > 500 || slippageBps > 500) throw new Error("Fee and slippage must be between 0 and 500 basis points.");
  const stopDistance = Math.abs(input.entryPrice - input.stopPrice);
  if (stopDistance === 0) throw new Error("Entry and stop prices cannot be equal.");
  if (input.side === "LONG" && input.stopPrice >= input.entryPrice) throw new Error("A long trade stop must be below entry.");
  if (input.side === "SHORT" && input.stopPrice <= input.entryPrice) throw new Error("A short trade stop must be above entry.");

  const riskBudget = input.accountEquity * input.riskPercent / 100;
  const costRate = (feeBps + slippageBps) / 10_000;
  // Approximate round-trip execution costs on entry and stop notional.
  const costPerUnit = stopDistance + (input.entryPrice + input.stopPrice) * costRate;
  const quantity = riskBudget / costPerUnit;
  const notional = quantity * input.entryPrice;
  const estimatedCosts = quantity * (input.entryPrice + input.stopPrice) * costRate;
  const estimatedLossAtStop = quantity * stopDistance + estimatedCosts;
  const rewardDistance = stopDistance * input.targetR;
  const targetPrice = input.side === "LONG" ? input.entryPrice + rewardDistance : input.entryPrice - rewardDistance;
  if (targetPrice <= 0) throw new Error("Calculated target price is invalid.");
  const plannedReward = quantity * rewardDistance - quantity * (input.entryPrice + targetPrice) * costRate;
  const rewardRisk = plannedReward / estimatedLossAtStop;

  return {
    riskBudget,
    quantity,
    notional,
    stopDistance,
    stopDistancePercent: stopDistance / input.entryPrice * 100,
    targetPrice,
    plannedReward,
    estimatedCosts,
    estimatedLossAtStop,
    rewardRisk,
  };
}
