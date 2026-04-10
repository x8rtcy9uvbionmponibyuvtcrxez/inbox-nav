import type { Metadata } from "next";
import "./proposal.css";
import {
  ScrollReveal,
  SmoothScroll,
  AnimatedCounter,
  DonutChart,
  InboxGrid,
  FloatingOrbs,
  TimelineAnimator,
  AnimatedBar,
} from "./ProposalClientComponents";
import QuoteBuilder from "./QuoteBuilder";

export const metadata: Metadata = {
  title: "Outbound Infrastructure Proposal | Recruitcha",
  description:
    "Custom outbound infrastructure blueprint prepared exclusively for Recruitcha. 15,000 emails per week capacity.",
  robots: { index: false, follow: false },
};

export default function RecruitchaProposal() {
  return (
    <div className="proposal-page">
      <ScrollReveal />
      <SmoothScroll />

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="proposal-hero">
        <FloatingOrbs />
        <div className="hero-grid-bg" />
        <div className="proposal-container">
          <div className="reveal">
            <span className="proposal-tag light">OUTBOUND INFRASTRUCTURE PROPOSAL</span>
          </div>
          <h1 className="hero-headline reveal reveal-delay-1" style={{ fontSize: "clamp(48px, 9vw, 96px)", marginBottom: "16px" }}>
            <em>Recruitcha</em>
          </h1>
          <div className="reveal reveal-delay-2">
            <div className="hero-volume">15,000</div>
            <div className="hero-unit">emails per week, built to scale</div>
          </div>
          <div className="hero-sub reveal reveal-delay-3">
            <span>April 2026</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VOLUME BREAKDOWN
          ═══════════════════════════════════════════ */}
      <section className="proposal-volume">
        <div className="proposal-container">
          <div className="section-header reveal">
            <span className="proposal-tag gradient">THE NUMBERS</span>
            <h2>Volume at a glance</h2>
            <p>
              Here&apos;s what your sending infrastructure looks like at full
              capacity. Every number below is calculated, not estimated.
            </p>
          </div>

          <div className="stat-grid">
            <div className="stat-card reveal reveal-delay-1">
              <div className="stat-number">
                <AnimatedCounter target={15000} suffix="" />
              </div>
              <div className="stat-label">Emails per week</div>
              <div className="stat-detail">
                Consistent weekly volume across all inboxes
              </div>
              <div className="pulse-ring" />
            </div>

            <div className="stat-card reveal reveal-delay-2">
              <div className="stat-number">
                <AnimatedCounter target={3000} />
              </div>
              <div className="stat-label">Emails per day</div>
              <div className="stat-detail">
                Spread across Google and Outlook infrastructure
              </div>
              <div className="pulse-ring" />
            </div>

            <div className="stat-card reveal reveal-delay-3">
              <div className="stat-number">
                <AnimatedCounter target={5} />
              </div>
              <div className="stat-label">Sending days</div>
              <div className="stat-detail">
                Monday through Friday for optimal deliverability
              </div>
              <div className="pulse-ring" />
            </div>
          </div>

          {/* Volume bars */}
          <div className="volume-bar-section reveal reveal-delay-4">
            <AnimatedBar
              value={2100}
              max={3000}
              color="google"
              label="Google Workspace"
              valueLabel="2,100 emails/day (70%)"
            />
            <AnimatedBar
              value={900}
              max={3000}
              color="outlook"
              label="Outlook"
              valueLabel="900 emails/day (30%)"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INFRASTRUCTURE ARCHITECTURE
          ═══════════════════════════════════════════ */}
      <section className="proposal-infra">
        <div className="proposal-container">
          <div className="section-header reveal">
            <span className="proposal-tag gradient">INFRASTRUCTURE</span>
            <h2>The architecture behind your volume</h2>
            <p>
              Two providers, one unified sending engine. Here&apos;s exactly how
              your 3,000 daily emails get distributed.
            </p>
          </div>

          <div className="infra-layout">
            {/* Donut chart */}
            <div className="infra-visual reveal-scale">
              <div>
                <DonutChart
                  segments={[
                    { value: 70, color: "#a855f7", label: "Google" },
                    { value: 30, color: "#e84393", label: "Outlook" },
                  ]}
                />
                <div className="donut-legend">
                  <div className="legend-item">
                    <div className="legend-dot google" />
                    Google (70%)
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot outlook" />
                    Outlook (30%)
                  </div>
                </div>
              </div>
            </div>

            {/* Provider cards */}
            <div className="provider-cards">
              <div className="provider-card google reveal reveal-delay-1">
                <div className="provider-header">
                  <span className="provider-name google">Google Workspace</span>
                  <span className="provider-cost">
                    $420<span>/mo</span>
                  </span>
                </div>
                <div className="provider-stats">
                  <div className="provider-stat">
                    <span className="provider-stat-value">2,100</span>
                    <span className="provider-stat-label">emails/day</span>
                  </div>
                  <div className="provider-stat">
                    <span className="provider-stat-value">140</span>
                    <span className="provider-stat-label">inboxes</span>
                  </div>
                  <div className="provider-stat">
                    <span className="provider-stat-value">15</span>
                    <span className="provider-stat-label">per inbox/day</span>
                  </div>
                </div>
              </div>

              <div className="provider-card outlook reveal reveal-delay-2">
                <div className="provider-header">
                  <span className="provider-name outlook">Outlook</span>
                  <span className="provider-cost">
                    $150<span>/mo</span>
                  </span>
                </div>
                <div className="provider-stats">
                  <div className="provider-stat">
                    <span className="provider-stat-value">900</span>
                    <span className="provider-stat-label">emails/day</span>
                  </div>
                  <div className="provider-stat">
                    <span className="provider-stat-value">5</span>
                    <span className="provider-stat-label">domains</span>
                  </div>
                  <div className="provider-stat">
                    <span className="provider-stat-value">200</span>
                    <span className="provider-stat-label">per domain/day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DOMAIN NETWORK
          ═══════════════════════════════════════════ */}
      <section className="proposal-domains">
        <FloatingOrbs />
        <div className="proposal-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-header reveal">
            <span className="proposal-tag light">DOMAINS</span>
            <h2>52 domains powering your outreach</h2>
            <p>
              Every inbox needs a domain. Here&apos;s the full network that supports
              your sending infrastructure.
            </p>
          </div>

          {/* Domain summary */}
          <div className="domain-summary reveal">
            <div className="domain-summary-item">
              <span className="domain-summary-value">
                <AnimatedCounter target={47} />
              </span>
              <span className="domain-summary-label">Google domains (3 inboxes each)</span>
            </div>
            <div className="domain-summary-item">
              <span className="domain-summary-value">
                <AnimatedCounter target={5} />
              </span>
              <span className="domain-summary-label">Outlook domains</span>
            </div>
            <div className="domain-summary-item">
              <span className="domain-summary-value">
                <AnimatedCounter target={52} />
              </span>
              <span className="domain-summary-label">Total domains</span>
            </div>
          </div>

          {/* Inbox grid visualization */}
          <div className="reveal">
            <InboxGrid google={140} outlook={5} />
          </div>

          {/* Domain cost options */}
          <div className="domain-cost-grid">
            <div className="domain-cost-card recommended reveal reveal-delay-1">
              <div className="domain-cost-ext">.com domains</div>
              <div className="domain-cost-price">$624</div>
              <div className="domain-cost-detail">
                52 domains × $12 each<br />
                One-time purchase, higher trust signals
              </div>
            </div>
            <div className="domain-cost-card reveal reveal-delay-2">
              <div className="domain-cost-ext">.info domains</div>
              <div className="domain-cost-price">$208</div>
              <div className="domain-cost-detail">
                52 domains × $4 each<br />
                One-time purchase, budget-friendly option
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INVESTMENT / QUOTE BUILDER
          ═══════════════════════════════════════════ */}
      <section className="proposal-investment">
        <div className="proposal-container">
          <div className="section-header reveal">
            <span className="proposal-tag gradient">INVESTMENT</span>
            <h2>Build your quote</h2>
            <p>
              Adjust the inputs below to see how your infrastructure costs scale.
              The defaults match your 15,000/week target.
            </p>
          </div>

          <div className="reveal">
            <QuoteBuilder />
          </div>

          {/* Monthly total card */}
          <div className="monthly-total-card reveal">
            <FloatingOrbs />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span className="monthly-total-label">
                Your recommended monthly infrastructure
              </span>
              <span className="monthly-total-value">$570/mo</span>
              <div className="monthly-total-breakdown">
                <span className="monthly-total-item">
                  <strong>$420</strong> Google (140 inboxes)
                </span>
                <span className="monthly-total-item">
                  <strong>$150</strong> Outlook (5 domains)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TIMELINE
          ═══════════════════════════════════════════ */}
      <section className="proposal-timeline">
        <div className="proposal-container">
          <div className="section-header reveal">
            <span className="proposal-tag gradient">TIMELINE</span>
            <h2>From zero to 15,000</h2>
            <p>
              Fast, focused execution. Domains on day one, infrastructure on
              day two, warmup for 2 to 3 weeks, then full send.
            </p>
          </div>

          <TimelineAnimator />

          <div className="timeline-track">
            <div className="timeline-line-bg" />
            <div className="timeline-line-fill" />

            {/* Phase 1 */}
            <div className="timeline-step">
              <div className="timeline-dot-wrapper">
                <div className="timeline-dot">01</div>
                <div className="timeline-dot-ring" />
              </div>
              <div className="timeline-content">
                <span className="timeline-tag">Day 1</span>
                <h3 className="timeline-title">Domain Acquisition</h3>
                <p className="timeline-desc">
                  Purchase all 52 domains and begin DNS configuration.
                  SPF, DKIM, and DMARC records set from the start.
                </p>
                <ul className="timeline-deliverables">
                  <li>52 domains registered</li>
                  <li>SPF, DKIM, DMARC configured for every domain</li>
                  <li>DNS propagation initiated</li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="timeline-step">
              <div className="timeline-dot-wrapper">
                <div className="timeline-dot">02</div>
                <div className="timeline-dot-ring" />
              </div>
              <div className="timeline-content">
                <span className="timeline-tag">Day 2</span>
                <h3 className="timeline-title">Infrastructure Setup</h3>
                <p className="timeline-desc">
                  Provision all inboxes and accounts across Google and Outlook.
                  Warmup begins immediately after setup.
                </p>
                <ul className="timeline-deliverables">
                  <li>140 Google Workspace inboxes created</li>
                  <li>5 Outlook domains with 50 users each</li>
                  <li>Automated warmup sequences kick off</li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="timeline-step">
              <div className="timeline-dot-wrapper">
                <div className="timeline-dot">03</div>
                <div className="timeline-dot-ring" />
              </div>
              <div className="timeline-content">
                <span className="timeline-tag">Week 1-3</span>
                <h3 className="timeline-title">Warmup Period</h3>
                <p className="timeline-desc">
                  2 to 3 weeks of automated warmup across all inboxes. Sender
                  reputation builds while deliverability is monitored daily.
                </p>
                <ul className="timeline-deliverables">
                  <li>Gradual volume ramp across 145 sending accounts</li>
                  <li>Daily deliverability and reputation monitoring</li>
                  <li>Inbox placement tracking</li>
                </ul>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="timeline-step">
              <div className="timeline-dot-wrapper">
                <div className="timeline-dot">04</div>
                <div className="timeline-dot-ring" />
              </div>
              <div className="timeline-content">
                <span className="timeline-tag">Week 3-4</span>
                <h3 className="timeline-title">Launch at Full Capacity</h3>
                <p className="timeline-desc">
                  All systems go. 3,000 emails per day, 15,000 per week,
                  running at full volume with proven deliverability.
                </p>
                <ul className="timeline-deliverables">
                  <li>15,000 emails per week at full throttle</li>
                  <li>Ongoing deliverability health checks</li>
                  <li>Infrastructure scaling support as needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <section className="proposal-cta">
        <FloatingOrbs />
        <div className="proposal-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="reveal">
            <span className="proposal-tag light">NEXT STEPS</span>
            <h2>
              Next steps?
            </h2>
            <p>
              Reply via the email you received this beautiful proposal
              and we get rolling.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="proposal-footer">
        <div className="proposal-container">
          <span className="footer-brand">InboxNavigator</span>
          <p>
            This proposal was prepared exclusively for Recruitcha.
          </p>
        </div>
      </footer>
    </div>
  );
}
