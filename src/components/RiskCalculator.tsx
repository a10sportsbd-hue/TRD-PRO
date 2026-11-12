import { useMemo, useState } from "react";
import { calculateRiskPlan, type TradeSide } from "../market/risk";

export function RiskCalculator() {
  const [side, setSide] = useState<TradeSide>("LONG");
  const [equity, setEquity] = useState("");
  const [risk, setRisk] = useState("1");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [targetR, setTargetR] = useState("2");
  const [fee, setFee] = useState("10");
  const [slippage, setSlippage] = useState("5");
  const [error, setError] = useState("");

  const plan = useMemo(() => {
    if (![equity, entry, stop].every((value) => value.trim() !== "")) return null;
    try {
      const result = calculateRiskPlan({
        side,
        accountEquity: Number(equity),
        riskPercent: Number(risk),
        entryPrice: Number(entry),
        stopPrice: Number(stop),
        targetR: Number(targetR),
        feeBps: Number(fee),
        slippageBps: Number(slippage),
      });
      return result;
    } catch (reason) {
      return null;
    }
  }, [side, equity, risk, entry, stop, targetR, fee, slippage]);

  const format = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 8 });
  const validate = () => {
    try {
      calculateRiskPlan({ side, accountEquity: Number(equity), riskPercent: Number(risk), entryPrice: Number(entry), stopPrice: Number(stop), targetR: Number(targetR), feeBps: Number(fee), slippageBps: Number(slippage) });
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invalid risk inputs.");
    }
  };

  return (
    <div className="risk-calculator">
      <div className="panel-heading">
        <div><div className="panel-kicker">CAPITAL PROTECTION</div><h2>Risk calculator</h2></div>
        <span className="disabled-pill">MANUAL INPUTS</span>
      </div>
      <p className="risk-intro">Enter your own account and hypothetical trade levels. Nothing is prefilled as an account balance or live trade.</p>
      <div className="risk-form-grid">
        <label>Position side<select value={side} onChange={(event) => setSide(event.target.value as TradeSide)}><option value="LONG">Long</option><option value="SHORT">Short</option></select></label>
        <label>Account equity<input inputMode="decimal" type="number" min="0" placeholder="e.g. 1000" value={equity} onChange={(event) => setEquity(event.target.value)} /></label>
        <label>Risk per trade (%)<input inputMode="decimal" type="number" min="0.01" max="100" step="0.1" value={risk} onChange={(event) => setRisk(event.target.value)} /></label>
        <label>Entry price<input inputMode="decimal" type="number" min="0" placeholder="Entry" value={entry} onChange={(event) => setEntry(event.target.value)} /></label>
        <label>Stop-loss price<input inputMode="decimal" type="number" min="0" placeholder="Stop" value={stop} onChange={(event) => setStop(event.target.value)} /></label>
        <label>Target (R multiple)<input inputMode="decimal" type="number" min="0.1" step="0.1" value={targetR} onChange={(event) => setTargetR(event.target.value)} /></label>
        <label>Fee (bps per side)<input inputMode="decimal" type="number" min="0" max="500" value={fee} onChange={(event) => setFee(event.target.value)} /></label>
        <label>Slippage (bps per side)<input inputMode="decimal" type="number" min="0" max="500" value={slippage} onChange={(event) => setSlippage(event.target.value)} /></label>
      </div>
      <button className="risk-calculate" onClick={validate}>Validate risk inputs</button>
      {error && <p className="risk-error" role="alert">{error}</p>}
      {plan ? <div className="risk-results">
        <div><span>RISK BUDGET</span><strong>{format(plan.riskBudget)}</strong></div>
        <div><span>POSITION SIZE</span><strong>{format(plan.quantity)}</strong></div>
        <div><span>POSITION NOTIONAL</span><strong>{format(plan.notional)}</strong></div>
        <div><span>STOP DISTANCE</span><strong>{format(plan.stopDistancePercent)}%</strong></div>
        <div><span>PLANNED TARGET</span><strong>{format(plan.targetPrice)}</strong></div>
        <div><span>EST. LOSS AT STOP</span><strong>{format(plan.estimatedLossAtStop)}</strong></div>
        <div><span>EST. ROUND-TRIP COST</span><strong>{format(plan.estimatedCosts)}</strong></div>
        <div><span>NET REWARD / RISK</span><strong>{format(plan.rewardRisk)}R</strong></div>
      </div> : <div className="risk-empty">Enter account equity, entry and stop prices to calculate a position size. Invalid values are rejected.</div>}
      <div className="strategy-disclaimer">Illustrative calculator only. Fees/slippage are estimates; funding, spread, liquidation, lot-size and exchange-specific rules are not included. Not an order or financial advice.</div>
    </div>
  );
}
