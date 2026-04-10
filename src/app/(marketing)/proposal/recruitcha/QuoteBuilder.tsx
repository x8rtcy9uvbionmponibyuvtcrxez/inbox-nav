"use client";

import { useState, useMemo } from "react";

const GOOGLE_DAILY_CAP = 15;
const OUTLOOK_DAILY_CAP = 200;
const GOOGLE_PRICE = 3;
const OUTLOOK_PRICE = 30;

const RATIOS = [
  { label: "100% Google", google: 1.0, outlook: 0.0 },
  { label: "80 / 20", google: 0.8, outlook: 0.2 },
  { label: "70 / 30", google: 0.7, outlook: 0.3 },
  { label: "60 / 40", google: 0.6, outlook: 0.4 },
  { label: "40 / 60", google: 0.4, outlook: 0.6 },
  { label: "20 / 80", google: 0.2, outlook: 0.8 },
  { label: "100% Outlook", google: 0.0, outlook: 1.0 },
];

export default function QuoteBuilder() {
  const [monthlyVolume, setMonthlyVolume] = useState(65000);
  const [sendingDays, setSendingDays] = useState<5 | 7>(5);
  const [ratioIndex, setRatioIndex] = useState(2); // 70/30 default for Recruitcha

  const ratio = RATIOS[ratioIndex];

  const calc = useMemo(() => {
    const dailyVolume = Math.round(monthlyVolume / (sendingDays * 4.33));
    const googleDaily = Math.round(dailyVolume * ratio.google);
    const outlookDaily = Math.round(dailyVolume * ratio.outlook);

    const googleInboxes = ratio.google > 0 ? Math.ceil(googleDaily / GOOGLE_DAILY_CAP) : 0;
    const outlookDomains = ratio.outlook > 0 ? Math.ceil(outlookDaily / OUTLOOK_DAILY_CAP) : 0;

    const googleCost = googleInboxes * GOOGLE_PRICE;
    const outlookCost = outlookDomains * OUTLOOK_PRICE;
    const totalCost = googleCost + outlookCost;

    const perEmail = monthlyVolume > 0 ? totalCost / monthlyVolume : 0;

    return {
      dailyVolume,
      googleDaily,
      outlookDaily,
      googleInboxes,
      outlookDomains,
      googleCost,
      outlookCost,
      totalCost,
      perEmail,
    };
  }, [monthlyVolume, sendingDays, ratio]);

  return (
    <div className="quote-builder">
      {/* ── Inputs ── */}
      <div className="qb-inputs">
        {/* Monthly volume */}
        <div className="qb-input-group">
          <label className="qb-label">Monthly email volume</label>
          <div className="qb-volume-input">
            <input
              type="range"
              min={1000}
              max={200000}
              step={1000}
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value))}
              className="qb-slider"
            />
            <div className="qb-volume-display">
              <input
                type="number"
                value={monthlyVolume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v) && v >= 0) setMonthlyVolume(v);
                }}
                className="qb-number-input"
              />
              <span className="qb-unit">emails/mo</span>
            </div>
          </div>
        </div>

        {/* Sending days */}
        <div className="qb-input-group">
          <label className="qb-label">Sending days per week</label>
          <div className="qb-toggle">
            <button
              className={`qb-toggle-btn ${sendingDays === 5 ? "active" : ""}`}
              onClick={() => setSendingDays(5)}
            >
              5 days
              {sendingDays === 5 && <span className="qb-badge">Recommended</span>}
            </button>
            <button
              className={`qb-toggle-btn ${sendingDays === 7 ? "active" : ""}`}
              onClick={() => setSendingDays(7)}
            >
              7 days
              <span className="qb-not-rec">not recommended</span>
            </button>
          </div>
        </div>

        {/* Ratio */}
        <div className="qb-input-group">
          <label className="qb-label">Google to Outlook ratio</label>
          <div className="qb-segments">
            {RATIOS.map((r, i) => (
              <button
                key={i}
                className={`qb-segment ${ratioIndex === i ? "active" : ""}`}
                onClick={() => setRatioIndex(i)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Outputs ── */}
      <div className="qb-outputs">
        <div className="qb-output-card">
          {/* Daily volume */}
          <div className="qb-output-row">
            <div className="qb-metric">
              <span className="qb-metric-label">Daily sending volume</span>
              <span className="qb-metric-value">{calc.dailyVolume.toLocaleString()}</span>
            </div>
          </div>

          {/* Provider split */}
          <div className="qb-split-row">
            {ratio.google > 0 && (
              <div className="qb-split-item google">
                <span className="qb-split-icon">G</span>
                <div>
                  <span className="qb-split-label">Google Workspace</span>
                  <span className="qb-split-detail">
                    {calc.googleDaily.toLocaleString()}/day · {calc.googleInboxes} inboxes
                  </span>
                </div>
                <span className="qb-split-cost">${calc.googleCost}/mo</span>
              </div>
            )}
            {ratio.outlook > 0 && (
              <div className="qb-split-item outlook">
                <span className="qb-split-icon">O</span>
                <div>
                  <span className="qb-split-label">Outlook</span>
                  <span className="qb-split-detail">
                    {calc.outlookDaily.toLocaleString()}/day · {calc.outlookDomains} domains
                  </span>
                </div>
                <span className="qb-split-cost">${calc.outlookCost}/mo</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="qb-total">
            <span className="qb-total-label">Total monthly infrastructure</span>
            <span className="qb-total-value">
              ${calc.totalCost.toLocaleString()}
              <span className="qb-total-unit">/mo</span>
            </span>
            <span className="qb-per-email">
              ${calc.perEmail.toFixed(4)} per email sent
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
