"use client";

import { useState } from "react";

const tabs = [
  { key: "google", label: "Google" },
  { key: "microsoft", label: "Microsoft" },
  { key: "prewarmed", label: "Prewarmed" },
  { key: "smtp", label: "SMTP" },
];

export default function PricingTabs() {
  const [active, setActive] = useState("google");

  return (
    <>
      <div className="pricing-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={active === tab.key ? "active" : ""}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className={`pricing-panel${active === "google" ? " active" : ""}`}
        id="tab-google"
      >
        <div className="pricing-card">
          <div className="price">
            $3
            <span style={{ fontSize: 18, fontWeight: 400, color: "#888" }}>
              /month
            </span>
          </div>
          <div className="price-label">MOQ: 10</div>
          <p className="price-desc">
            Zero risk - Bulletproof inboxes built for scale and reliability
          </p>
          <ul className="pricing-features">
            <li>Low risk of Google crackdown</li>
            <li>US IP Only</li>
            <li>Send up to 15 emails/day/inbox</li>
            <li>Bring your own domains</li>
            <li>Complete DFY Service</li>
            <li>DNS setup included (SPF, DMARC, DKIM)</li>
          </ul>
          <a
            href="https://app.inboxnavigator.com/sign-up?redirect_url=/checkout/configure?product=GOOGLE"
            className="btn btn-gradient"
            data-rewardful=""
          >
            BUY NOW
          </a>
        </div>
      </div>

      <div
        className={`pricing-panel${active === "microsoft" ? " active" : ""}`}
        id="tab-microsoft"
      >
        <div className="pricing-card">
          <div className="price">
            $30
            <span style={{ fontSize: 18, fontWeight: 400, color: "#888" }}>
              /month per domain
            </span>
          </div>
          <p className="price-desc">
            Microsoft 365 enterprise inboxes based on Azure. Each domain
            includes 50 users.
          </p>
          <ul className="pricing-features">
            <li>Isolated tenants</li>
            <li>Up to 100 users/domain</li>
            <li>Send up to 200 emails/domain</li>
            <li>Same quality as Hypertide</li>
            <li>Performs better than standard Microsoft inboxes</li>
          </ul>
          <a
            href="https://app.inboxnavigator.com/sign-up?redirect_url=/checkout/configure?product=MICROSOFT"
            className="btn btn-gradient"
            data-rewardful=""
          >
            BUY NOW
          </a>
        </div>
      </div>

      <div
        className={`pricing-panel${active === "prewarmed" ? " active" : ""}`}
        id="tab-prewarmed"
      >
        <div className="pricing-card">
          <div className="price">
            $70
            <span style={{ fontSize: 18, fontWeight: 400, color: "#888" }}>
              /month
            </span>
          </div>
          <div className="price-label">10 prewarmed inboxes</div>
          <p className="price-desc">
            Pre-warmed and ready to send from day one
          </p>
          <ul className="pricing-features">
            <li>Free .com domains included</li>
            <li>Premium US IP Google Inboxes only</li>
            <li>Industry best deliverability</li>
            <li>Be live in under 24 hours</li>
            <li>Fully customizable</li>
            <li>Pre-warmed and ready-to-send</li>
          </ul>
          <a
            href="https://app.inboxnavigator.com/sign-up?redirect_url=/checkout/configure?product=PREWARMED&qty=10"
            className="btn btn-gradient"
            data-rewardful=""
          >
            BUY NOW
          </a>
        </div>
      </div>

      <div
        className={`pricing-panel${active === "smtp" ? " active" : ""}`}
        id="tab-smtp"
      >
        <div className="pricing-card">
          <div className="price">
            $1.25
            <span style={{ fontSize: 18, fontWeight: 400, color: "#888" }}>
              /month
            </span>
          </div>
          <div className="price-label">AWS based SMTP</div>
          <p className="price-desc">
            High-performance SMTP built on enterprise infrastructure
          </p>
          <ul className="pricing-features">
            <li>Built on AWS</li>
            <li>Dedicated IPs and isolated tenants</li>
            <li>Premium SMTP inboxes</li>
            <li>Send up to 15 emails/day/inbox</li>
          </ul>
          <a
            href="https://app.inboxnavigator.com/sign-up?redirect_url=/checkout/configure?product=AWS"
            className="btn btn-gradient"
            data-rewardful=""
          >
            BUY NOW
          </a>
        </div>
      </div>
    </>
  );
}
