import type { Metadata } from "next";
import "./dfy.css";
import {
  ScrollReveal,
  NavbarScroll,
  DfyMobileMenu,
  StackingCards,
  FaqAccordion,
  SmoothScroll,
} from "./DfyClientComponents";

export const metadata: Metadata = {
  title: "Done-For-You Cold Email That Actually Scales",
  description:
    "We own the cold email infrastructure other agencies rent. Get 2x the outreach volume at the same price. Done-for-you cold email starting at $1,500/mo.",
  openGraph: {
    title: "InboxNavigator | Done-For-You Cold Email That Actually Scales",
    description:
      "We own the cold email infrastructure other agencies rent. Get 2x the outreach volume at the same price. More emails, more replies, more pipeline.",
    type: "website",
    url: "https://inboxnavigator.com/dfy",
    images: ["https://inboxnavigator.com/images/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "InboxNavigator | Done-For-You Cold Email That Actually Scales",
    description:
      "We own the cold email infrastructure other agencies rent. Get 2x the outreach volume at the same price.",
  },
  alternates: {
    canonical: "https://inboxnavigator.com/dfy",
  },
};

const faqItems = [
  {
    question: "How fast do campaigns go live?",
    answer:
      "Campaigns go live on day 15. Week 1 is onboarding, ICP mapping, and copy. Week 2 is infrastructure warmup. Day 15, you're sending.",
  },
  {
    question: "How does the trial work?",
    answer:
      "We use our infrastructure to run a mini campaign for you targeting your ICP. Once we generate positive replies, we forward the qualified leads directly to you so you can see the quality of our work firsthand. No commitment beyond the trial.",
  },
  {
    question: "What do I need to provide?",
    answer:
      "Your ICP details (who you want to target), your current offers, any insight into what's worked or hasn't in the past, and approval on copy before we send. We handle everything else.",
  },
  {
    question: "Do I need to buy any tools?",
    answer:
      "No. Everything is included: infrastructure, sending platform, lead data, enrichment tools. You don't pay for anything except our monthly fee.",
  },
  {
    question: "Do you book the appointments?",
    answer:
      "No. We generate the positive replies and route them to you, but the follow-up and booking is on your side. We'll help you build reply templates and set up your CRM so managing leads and following up is as easy as possible.",
  },
  {
    question: "Do you guarantee results?",
    answer:
      "We guarantee volume, deliverability, and results. You'll reach the number of prospects we promise, your emails will land in primary, and our trial guarantees 5 positive replies from your ICP. If you don't see results in the first 60 days on a monthly plan, we run an additional month at no cost while we optimize.",
  },
  {
    question: "What industries do you work with?",
    answer:
      "Any B2B company with a large TAM. We work best with SaaS, professional services, agencies, staffing firms, and MSPs. If your market has thousands of potential customers, we can fill your pipeline.",
  },
];

export default function DfyPage() {
  return (
    <div className="dfy-page">
      {/* Client-side behavior */}
      <ScrollReveal />
      <NavbarScroll />
      <StackingCards />
      <SmoothScroll />

      {/* ============================================
          NAVIGATION
          ============================================ */}
      <nav className="dfy-navbar" id="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <span>Inbox</span>Navigator
          </a>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#demo">Contact</a>
            <a href="/#faq">FAQ</a>
          </div>
          <div className="nav-right">
            <a
              href="https://app.inboxnavigator.com/sign-in"
              className="login"
            >
              Log In
            </a>
            <a
              href="https://app.inboxnavigator.com/sign-up?redirect_url=/dashboard/products"
              className="btn btn-gradient"
            >
              Get Started
            </a>
          </div>
          <DfyMobileMenu />
        </div>
      </nav>

      {/* ============================================
          HERO
          ============================================ */}
      <section className="dfy-hero">
        <div className="container">
          <div className="hero-tag reveal">
            <span className="grad-text">Done-for-you cold email</span>
          </div>
          <h1 className="reveal reveal-delay-1">
            Your competitors are reaching 5% of the market.{" "}
            <em>
              <span className="grad-text">We&apos;ll cover all of it</span>
            </em>
          </h1>
          <p className="hero-sub reveal reveal-delay-2">
            We own the cold email infrastructure other agencies rent from people
            like us. You get 2x the outreach volume at the same price. More
            emails, more replies, more pipeline.
          </p>
          <div className="hero-ctas reveal reveal-delay-3">
            <a href="#trial" className="btn btn-accent">
              Start your trial
            </a>
            <a href="#method" className="btn btn-ghost">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          INTRO / WHO WE ARE
          ============================================ */}
      <section>
        <div className="container">
          <div className="intro-section">
            <span className="section-tag grad-text">Who we are</span>
            <h2 className="reveal">
              More volume. Better targeting.{" "}
              <em>
                <span className="grad-text">Qualified replies guaranteed</span>
              </em>
            </h2>
            <div className="intro-body reveal reveal-delay-1">
              <p>
                We run <strong>45,000+ cold email inboxes</strong> across our
                infrastructure. That means we send more, we see deliverability
                trends before anyone else, and we operate at a scale that lets
                us offer <strong>2x the outreach volume</strong> at prices other
                agencies can&apos;t touch.
              </p>
              <br />
              <p>
                Most agencies cut corners on infrastructure to protect their
                margins. We don&apos;t. We own every inbox, every domain, every
                server, which means you get 2x the sending volume at the same
                price, with deliverability that actually lands in primary. Cold
                email done right, not done cheap.
              </p>
            </div>
            <div className="stat-row reveal reveal-delay-2">
              <div className="stat-cell">
                <div className="num">45,000+</div>
                <div className="lbl">Inboxes delivered</div>
              </div>
              <div className="stat-cell">
                <div className="num">10M+</div>
                <div className="lbl">Emails sent</div>
              </div>
              <div className="stat-cell">
                <div className="num">200+</div>
                <div className="lbl">Businesses served</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA BANNER 1
          ============================================ */}
      <div className="cta-banner">
        <div className="cta-banner-inner">
          <p>
            45,000+ inboxes. 10M+ emails sent. All on our own infrastructure.{" "}
            <span className="highlight grad-text">
              Now we run your outbound on it. 2x the volume, same price.
            </span>
          </p>
          <a href="#trial" className="btn btn-accent">
            Start your trial
          </a>
        </div>
        <span
          className="cta-star"
          style={{ top: "15%", left: "10%", animationDelay: "0s" }}
        />
        <span
          className="cta-star"
          style={{ top: "25%", left: "85%", animationDelay: "1s" }}
        />
        <span
          className="cta-star"
          style={{ top: "70%", left: "20%", animationDelay: "0.5s" }}
        />
        <span
          className="cta-star"
          style={{ top: "60%", left: "75%", animationDelay: "1.5s" }}
        />
        <span
          className="cta-star"
          style={{ top: "80%", left: "50%", animationDelay: "2s" }}
        />
      </div>

      {/* ============================================
          COMPARISON
          ============================================ */}
      <section>
        <div className="container">
          <div className="comp-header reveal">
            <span className="section-tag grad-text">Why us</span>
            <h2>Same budget. Twice the pipeline</h2>
            <p>
              Here&apos;s what you actually get when your outbound runs on
              infrastructure built for scale.
            </p>
          </div>
          <div className="comp-wrapper reveal reveal-delay-1">
            {/* Other agencies column */}
            <div className="comp-col comp-col-them">
              <div className="comp-col-header">Other agencies</div>
              <div className="comp-row">
                <div className="comp-row-label">Inboxes</div>
                <div className="comp-row-value">20-30 rented</div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Prospects / month</div>
                <div className="comp-row-value">4,000-6,000</div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">TAM coverage</div>
                <div className="comp-row-value">6+ months, if ever</div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Infrastructure cost</div>
                <div className="comp-row-value">$3-6/inbox markup</div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Deliverability</div>
                <div className="comp-row-value">
                  Reactive, they find out when it&apos;s already broken
                </div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Approach</div>
                <div className="comp-row-value">
                  Spray and pray or low-volume GTM, pick one
                </div>
              </div>
            </div>
            {/* InboxNavigator column */}
            <div className="comp-col comp-col-us">
              <div className="comp-col-header">InboxNavigator DFY</div>
              <div className="comp-row">
                <div className="comp-row-label">Inboxes</div>
                <div className="comp-row-value">40-100s owned</div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Prospects / month</div>
                <div className="comp-row-value">8,000-80,000+</div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">TAM coverage</div>
                <div className="comp-row-value">
                  Your timeline, 60 to 180 days
                </div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Infrastructure cost</div>
                <div className="comp-row-value">At cost, we own it</div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Deliverability</div>
                <div className="comp-row-value">
                  45,000+ inboxes of data, we see trends first
                </div>
              </div>
              <div className="comp-row">
                <div className="comp-row-label">Approach</div>
                <div className="comp-row-value">
                  Both: high precision + high-volume coverage
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PROBLEM STATEMENT
          ============================================ */}
      <section>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag grad-text">
              The problem with outbound today
            </span>
            <h2>
              Outbound works. But the way most people do it doesn&apos;t
            </h2>
          </div>
          <div className="problem-grid">
            <div className="problem-card reveal">
              <div className="problem-num">01</div>
              <h3>
                Your agency is saving on infrastructure, at your expense
              </h3>
              <p>
                They know more volume means more results. They just don&apos;t
                want to spend on it. So you get 20-30 rented inboxes, 4K
                prospects a month, and a TAM that&apos;ll take over a year to
                cover. They&apos;re optimizing their margins, not your pipeline.
              </p>
            </div>
            <div className="problem-card reveal reveal-delay-1">
              <div className="problem-num">02</div>
              <h3>Too precise to scale, or too sloppy to convert</h3>
              <p>
                Most outbound falls into two traps. Either it&apos;s so
                laser-focused you only reach a handful of people and never see
                meaningful volume. Or it&apos;s spray-and-pray. You cover the
                TAM but every email is generic and no one replies. You need both
                precision and volume. That&apos;s the gap.
              </p>
            </div>
            <div className="problem-card reveal reveal-delay-2">
              <div className="problem-num">03</div>
              <h3>Complex at 5K, impossible at 50K</h3>
              <p>
                Domains, inboxes, warmup, deliverability, ESP, enrichment, list
                building. Cold email is complex enough at 5,000 emails/month. At
                50,000, it&apos;s a full-time operations problem. By the time
                you figure it out, your competitors already booked the meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA BANNER 2
          ============================================ */}
      <div className="cta-banner">
        <div className="cta-banner-inner">
          <p>
            Not sure if cold email works for your market?{" "}
            <span className="highlight grad-text">
              We guarantee 5 positive replies from your ICP, or you don&apos;t
              pay.
            </span>
          </p>
          <a href="#trial" className="btn btn-accent">
            Start your trial
          </a>
        </div>
        <span
          className="cta-star"
          style={{ top: "20%", left: "15%", animationDelay: "0.3s" }}
        />
        <span
          className="cta-star"
          style={{ top: "30%", left: "80%", animationDelay: "1.2s" }}
        />
        <span
          className="cta-star"
          style={{ top: "75%", left: "25%", animationDelay: "0.8s" }}
        />
        <span
          className="cta-star"
          style={{ top: "65%", left: "90%", animationDelay: "1.8s" }}
        />
      </div>

      {/* ============================================
          METHODOLOGY
          ============================================ */}
      <section id="method">
        <div className="container">
          <div className="method-header reveal">
            <span className="section-tag grad-text">Our methodology</span>
            <h2>Precision where it counts, volume everywhere else</h2>
            <p>
              We don&apos;t pick between quality and quantity. We run both, and
              we never stop testing.
            </p>
          </div>
          <div className="method-grid">
            {/* Card 1: Precision at the top */}
            <div className="method-card reveal">
              <div className="method-visual">
                <svg
                  viewBox="0 0 300 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="150"
                    cy="90"
                    r="70"
                    stroke="#a855f7"
                    strokeOpacity=".1"
                    strokeWidth="1"
                  />
                  <circle
                    cx="150"
                    cy="90"
                    r="50"
                    stroke="#a855f7"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <circle
                    cx="150"
                    cy="90"
                    r="30"
                    stroke="#a855f7"
                    strokeOpacity=".25"
                    strokeWidth="1"
                  />
                  <circle
                    cx="150"
                    cy="90"
                    r="10"
                    fill="#a855f7"
                    fillOpacity=".3"
                  />
                  <circle cx="150" cy="90" r="4" fill="#a855f7" />
                  <line
                    x1="150"
                    y1="20"
                    x2="150"
                    y2="160"
                    stroke="#a855f7"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <line
                    x1="80"
                    y1="90"
                    x2="220"
                    y2="90"
                    stroke="#a855f7"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="138"
                    cy="78"
                    r="3"
                    fill="#a855f7"
                    fillOpacity=".6"
                  />
                  <circle
                    cx="162"
                    cy="85"
                    r="3"
                    fill="#a855f7"
                    fillOpacity=".7"
                  />
                  <circle
                    cx="145"
                    cy="98"
                    r="3"
                    fill="#a855f7"
                    fillOpacity=".5"
                  />
                  <circle
                    cx="155"
                    cy="82"
                    r="2.5"
                    fill="#a855f7"
                    fillOpacity=".8"
                  />
                  <circle
                    cx="170"
                    cy="105"
                    r="2"
                    fill="#a855f7"
                    fillOpacity=".3"
                  />
                  <circle
                    cx="128"
                    cy="100"
                    r="2"
                    fill="#a855f7"
                    fillOpacity=".25"
                  />
                  <circle
                    cx="160"
                    cy="70"
                    r="2"
                    fill="#a855f7"
                    fillOpacity=".35"
                  />
                  <line
                    x1="150"
                    y1="90"
                    x2="210"
                    y2="50"
                    stroke="url(#sweepGrad)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 150 90"
                      to="360 150 90"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </line>
                  <defs>
                    <linearGradient
                      id="sweepGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#a855f7"
                        stopOpacity=".6"
                      />
                      <stop
                        offset="100%"
                        stopColor="#a855f7"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="method-card-body">
                <h3>Precision at the top</h3>
                <p>
                  Your top 10-20% gets Clay-enriched targeting and personalized
                  angles. Every email feels 1:1 because these are the accounts
                  most likely to close.
                </p>
              </div>
            </div>

            {/* Card 2: Volume across the rest */}
            <div className="method-card reveal reveal-delay-1">
              <div className="method-visual">
                <svg
                  viewBox="0 0 300 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="30"
                    y1="155"
                    x2="270"
                    y2="155"
                    stroke="#ece8f0"
                    strokeWidth="1"
                  />
                  <rect
                    x="40"
                    y="155"
                    width="24"
                    height="0"
                    rx="4"
                    fill="#f97316"
                    fillOpacity=".15"
                    stroke="#f97316"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="y"
                      values="155;130;155"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="height"
                      values="0;25;0"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="72"
                    y="155"
                    width="24"
                    height="0"
                    rx="4"
                    fill="#f97316"
                    fillOpacity=".2"
                    stroke="#f97316"
                    strokeOpacity=".2"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="y"
                      values="155;115;155"
                      dur="4s"
                      begin=".15s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="height"
                      values="0;40;0"
                      dur="4s"
                      begin=".15s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="104"
                    y="155"
                    width="24"
                    height="0"
                    rx="4"
                    fill="#f97316"
                    fillOpacity=".25"
                    stroke="#f97316"
                    strokeOpacity=".25"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="y"
                      values="155;95;155"
                      dur="4s"
                      begin=".3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="height"
                      values="0;60;0"
                      dur="4s"
                      begin=".3s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="136"
                    y="155"
                    width="24"
                    height="0"
                    rx="4"
                    fill="#f97316"
                    fillOpacity=".3"
                    stroke="#f97316"
                    strokeOpacity=".3"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="y"
                      values="155;80;155"
                      dur="4s"
                      begin=".45s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="height"
                      values="0;75;0"
                      dur="4s"
                      begin=".45s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="168"
                    y="155"
                    width="24"
                    height="0"
                    rx="4"
                    fill="#f97316"
                    fillOpacity=".4"
                    stroke="#f97316"
                    strokeOpacity=".35"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="y"
                      values="155;65;155"
                      dur="4s"
                      begin=".6s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="height"
                      values="0;90;0"
                      dur="4s"
                      begin=".6s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="200"
                    y="155"
                    width="24"
                    height="0"
                    rx="4"
                    fill="#f97316"
                    fillOpacity=".5"
                    stroke="#f97316"
                    strokeOpacity=".4"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="y"
                      values="155;50;155"
                      dur="4s"
                      begin=".75s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="height"
                      values="0;105;0"
                      dur="4s"
                      begin=".75s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="232"
                    y="155"
                    width="24"
                    height="0"
                    rx="4"
                    fill="url(#barGrad2)"
                    stroke="#f97316"
                    strokeOpacity=".5"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="y"
                      values="155;35;155"
                      dur="4s"
                      begin=".9s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="height"
                      values="0;120;0"
                      dur="4s"
                      begin=".9s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <path
                    d="M52 125 L244 30"
                    stroke="#f97316"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    strokeOpacity=".3"
                  />
                  <polygon
                    points="250,26 238,28 244,36"
                    fill="#f97316"
                    fillOpacity=".4"
                  />
                  <rect
                    x="238"
                    y="8"
                    width="36"
                    height="18"
                    rx="9"
                    fill="#f97316"
                    fillOpacity=".15"
                    stroke="#f97316"
                    strokeOpacity=".3"
                    strokeWidth="1"
                  />
                  <text
                    x="256"
                    y="20"
                    fill="#f97316"
                    fontFamily="monospace"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    2x
                  </text>
                  <defs>
                    <linearGradient
                      id="barGrad2"
                      x1="244"
                      y1="35"
                      x2="244"
                      y2="155"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop
                        offset="0%"
                        stopColor="#f97316"
                        stopOpacity=".7"
                      />
                      <stop
                        offset="100%"
                        stopColor="#f97316"
                        stopOpacity=".2"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="method-card-body">
                <h3>Volume across the rest</h3>
                <p>
                  The other 80% gets hit at scale. Other agencies send 4K emails
                  a month. We send 8K-80K+. Every prospect touched, every cycle.
                </p>
              </div>
            </div>

            {/* Card 3: Test what moves the needle */}
            <div className="method-card reveal reveal-delay-2">
              <div className="method-visual">
                <svg
                  viewBox="0 0 300 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="150"
                    y1="20"
                    x2="150"
                    y2="160"
                    stroke="#ddd8e8"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x="30"
                    y="40"
                    width="100"
                    height="24"
                    rx="6"
                    fill="#e84393"
                    fillOpacity=".12"
                    stroke="#e84393"
                    strokeOpacity=".2"
                    strokeWidth="1"
                  />
                  <rect
                    x="34"
                    y="46"
                    width="55"
                    height="3"
                    rx="1.5"
                    fill="#e84393"
                    fillOpacity=".4"
                  />
                  <rect
                    x="34"
                    y="53"
                    width="35"
                    height="3"
                    rx="1.5"
                    fill="#e84393"
                    fillOpacity=".2"
                  />
                  <text
                    x="80"
                    y="32"
                    fill="#e84393"
                    fillOpacity=".5"
                    fontFamily="monospace"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    A
                  </text>
                  <rect
                    x="30"
                    y="74"
                    width="100"
                    height="24"
                    rx="6"
                    fill="#e84393"
                    fillOpacity=".08"
                    stroke="#e84393"
                    strokeOpacity=".12"
                    strokeWidth="1"
                  />
                  <rect
                    x="34"
                    y="80"
                    width="48"
                    height="3"
                    rx="1.5"
                    fill="#e84393"
                    fillOpacity=".3"
                  />
                  <rect
                    x="34"
                    y="87"
                    width="30"
                    height="3"
                    rx="1.5"
                    fill="#e84393"
                    fillOpacity=".15"
                  />
                  <rect
                    x="30"
                    y="108"
                    width="100"
                    height="24"
                    rx="6"
                    fill="#e84393"
                    fillOpacity=".15"
                    stroke="#e84393"
                    strokeOpacity=".25"
                    strokeWidth="1"
                  />
                  <rect
                    x="34"
                    y="114"
                    width="62"
                    height="3"
                    rx="1.5"
                    fill="#e84393"
                    fillOpacity=".5"
                  />
                  <rect
                    x="34"
                    y="121"
                    width="40"
                    height="3"
                    rx="1.5"
                    fill="#e84393"
                    fillOpacity=".25"
                  />
                  <circle
                    cx="122"
                    cy="120"
                    r="4"
                    fill="#e84393"
                    fillOpacity=".4"
                  >
                    <animate
                      attributeName="r"
                      values="4;8;4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="fill-opacity"
                      values=".4;.1;.4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="122" cy="120" r="2" fill="#e84393">
                    <animate
                      attributeName="r"
                      values="2;3;2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <rect
                    x="170"
                    y="40"
                    width="100"
                    height="24"
                    rx="6"
                    fill="#f97316"
                    fillOpacity=".15"
                    stroke="#f97316"
                    strokeOpacity=".25"
                    strokeWidth="1"
                  />
                  <rect
                    x="174"
                    y="46"
                    width="60"
                    height="3"
                    rx="1.5"
                    fill="#f97316"
                    fillOpacity=".5"
                  />
                  <rect
                    x="174"
                    y="53"
                    width="38"
                    height="3"
                    rx="1.5"
                    fill="#f97316"
                    fillOpacity=".25"
                  />
                  <text
                    x="220"
                    y="32"
                    fill="#f97316"
                    fillOpacity=".5"
                    fontFamily="monospace"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    B
                  </text>
                  <rect
                    x="170"
                    y="74"
                    width="100"
                    height="24"
                    rx="6"
                    fill="#f97316"
                    fillOpacity=".08"
                    stroke="#f97316"
                    strokeOpacity=".12"
                    strokeWidth="1"
                  />
                  <rect
                    x="174"
                    y="80"
                    width="42"
                    height="3"
                    rx="1.5"
                    fill="#f97316"
                    fillOpacity=".3"
                  />
                  <rect
                    x="174"
                    y="87"
                    width="28"
                    height="3"
                    rx="1.5"
                    fill="#f97316"
                    fillOpacity=".15"
                  />
                  <rect
                    x="170"
                    y="108"
                    width="100"
                    height="24"
                    rx="6"
                    fill="#f97316"
                    fillOpacity=".1"
                    stroke="#f97316"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <rect
                    x="174"
                    y="114"
                    width="50"
                    height="3"
                    rx="1.5"
                    fill="#f97316"
                    fillOpacity=".35"
                  />
                  <rect
                    x="174"
                    y="121"
                    width="32"
                    height="3"
                    rx="1.5"
                    fill="#f97316"
                    fillOpacity=".18"
                  />
                  <rect
                    x="138"
                    y="78"
                    width="24"
                    height="20"
                    rx="10"
                    fill="#fff"
                    stroke="#ddd8e8"
                    strokeWidth="1"
                  />
                  <text
                    x="150"
                    y="92"
                    fill="#9e96b5"
                    fontFamily="monospace"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    VS
                  </text>
                </svg>
              </div>
              <div className="method-card-body">
                <h3>Test what moves the needle</h3>
                <p>
                  Most agencies A/B test subject lines. We test core offers,
                  positioning, and pain points. We never stop split testing.
                  Every campaign makes the next one sharper.
                </p>
              </div>
            </div>

            {/* Card 4: Scale what wins */}
            <div className="method-card reveal reveal-delay-3">
              <div className="method-visual">
                <svg
                  viewBox="0 0 440 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="40"
                    y1="40"
                    x2="40"
                    y2="150"
                    stroke="#ece8f0"
                    strokeWidth="1"
                  />
                  <line
                    x1="40"
                    y1="150"
                    x2="400"
                    y2="150"
                    stroke="#ece8f0"
                    strokeWidth="1"
                  />
                  <line
                    x1="40"
                    y1="110"
                    x2="400"
                    y2="110"
                    stroke="#ece8f0"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                  />
                  <line
                    x1="40"
                    y1="70"
                    x2="400"
                    y2="70"
                    stroke="#ece8f0"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                  />
                  <path
                    d="M40 140 L100 135 L160 125 L220 105 L280 78 L340 55 L400 38"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="500"
                    strokeDashoffset="500"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="500;0"
                      dur="3s"
                      fill="freeze"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M40 140 L100 135 L160 125 L220 105 L280 78 L340 55 L400 38 L400 150 L40 150Z"
                    fill="url(#chartFill4)"
                  />
                  <circle
                    cx="100"
                    cy="135"
                    r="3"
                    fill="#fff"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="160"
                    cy="125"
                    r="3"
                    fill="#fff"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="220"
                    cy="105"
                    r="3"
                    fill="#fff"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="280"
                    cy="78"
                    r="3"
                    fill="#fff"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="340"
                    cy="55"
                    r="3"
                    fill="#fff"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="400"
                    cy="38"
                    r="8"
                    fill="#a855f7"
                    fillOpacity="0"
                  >
                    <animate
                      attributeName="r"
                      values="4;12;4"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="fill-opacity"
                      values=".3;0;.3"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="400" cy="38" r="4" fill="#a855f7" />
                  <text
                    x="370"
                    y="30"
                    fill="#a855f7"
                    fillOpacity=".7"
                    fontFamily="monospace"
                    fontSize="9"
                  >
                    FIT
                  </text>
                  <path
                    d="M40 130 L100 120 L160 118 L220 112 L280 108 L340 100 L400 92"
                    stroke="#e84393"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="4 3"
                    strokeOpacity=".4"
                  />
                  <defs>
                    <linearGradient
                      id="chartFill4"
                      x1="220"
                      y1="38"
                      x2="220"
                      y2="150"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop
                        offset="0%"
                        stopColor="#a855f7"
                        stopOpacity=".15"
                      />
                      <stop
                        offset="100%"
                        stopColor="#a855f7"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="method-card-body">
                <h3>Scale what wins</h3>
                <p>
                  Once we find message-market fit, we double down. Winning copy,
                  angles, and segments get scaled systematically across your full
                  TAM.
                </p>
              </div>
            </div>

            {/* Card 5: Your TAM, your timeline */}
            <div className="method-card reveal reveal-delay-4">
              <div className="method-visual">
                <svg
                  viewBox="0 0 440 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="220"
                    cy="90"
                    r="12"
                    fill="#a855f7"
                    fillOpacity=".2"
                    stroke="#a855f7"
                    strokeOpacity=".4"
                    strokeWidth="1.5"
                  />
                  <circle cx="220" cy="90" r="5" fill="#a855f7" />
                  <circle
                    cx="170"
                    cy="55"
                    r="6"
                    fill="#e84393"
                    fillOpacity=".15"
                    stroke="#e84393"
                    strokeOpacity=".3"
                    strokeWidth="1"
                  />
                  <line
                    x1="220"
                    y1="90"
                    x2="170"
                    y2="55"
                    stroke="#e84393"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <circle
                    cx="270"
                    cy="55"
                    r="6"
                    fill="#a855f7"
                    fillOpacity=".15"
                    stroke="#a855f7"
                    strokeOpacity=".3"
                    strokeWidth="1"
                  />
                  <line
                    x1="220"
                    y1="90"
                    x2="270"
                    y2="55"
                    stroke="#a855f7"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <circle
                    cx="280"
                    cy="100"
                    r="6"
                    fill="#f97316"
                    fillOpacity=".15"
                    stroke="#f97316"
                    strokeOpacity=".3"
                    strokeWidth="1"
                  />
                  <line
                    x1="220"
                    y1="90"
                    x2="280"
                    y2="100"
                    stroke="#f97316"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <circle
                    cx="160"
                    cy="110"
                    r="6"
                    fill="#a855f7"
                    fillOpacity=".15"
                    stroke="#a855f7"
                    strokeOpacity=".3"
                    strokeWidth="1"
                  />
                  <line
                    x1="220"
                    y1="90"
                    x2="160"
                    y2="110"
                    stroke="#a855f7"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <circle
                    cx="220"
                    cy="140"
                    r="6"
                    fill="#e84393"
                    fillOpacity=".15"
                    stroke="#e84393"
                    strokeOpacity=".3"
                    strokeWidth="1"
                  />
                  <line
                    x1="220"
                    y1="90"
                    x2="220"
                    y2="140"
                    stroke="#e84393"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <circle
                    cx="120"
                    cy="35"
                    r="4"
                    fill="#a855f7"
                    fillOpacity=".1"
                    stroke="#a855f7"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="170"
                    y1="55"
                    x2="120"
                    y2="35"
                    stroke="#a855f7"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="140"
                    cy="70"
                    r="4"
                    fill="#e84393"
                    fillOpacity=".1"
                    stroke="#e84393"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="170"
                    y1="55"
                    x2="140"
                    y2="70"
                    stroke="#e84393"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="310"
                    cy="35"
                    r="4"
                    fill="#f97316"
                    fillOpacity=".1"
                    stroke="#f97316"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="270"
                    y1="55"
                    x2="310"
                    y2="35"
                    stroke="#f97316"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="320"
                    cy="75"
                    r="4"
                    fill="#a855f7"
                    fillOpacity=".1"
                    stroke="#a855f7"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="280"
                    y1="100"
                    x2="320"
                    y2="75"
                    stroke="#a855f7"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="330"
                    cy="120"
                    r="4"
                    fill="#e84393"
                    fillOpacity=".1"
                    stroke="#e84393"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="280"
                    y1="100"
                    x2="330"
                    y2="120"
                    stroke="#e84393"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="120"
                    cy="130"
                    r="4"
                    fill="#f97316"
                    fillOpacity=".1"
                    stroke="#f97316"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="160"
                    y1="110"
                    x2="120"
                    y2="130"
                    stroke="#f97316"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="190"
                    cy="155"
                    r="4"
                    fill="#a855f7"
                    fillOpacity=".1"
                    stroke="#a855f7"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="220"
                    y1="140"
                    x2="190"
                    y2="155"
                    stroke="#a855f7"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="260"
                    cy="155"
                    r="4"
                    fill="#f97316"
                    fillOpacity=".1"
                    stroke="#f97316"
                    strokeOpacity=".15"
                    strokeWidth="1"
                  />
                  <line
                    x1="220"
                    y1="140"
                    x2="260"
                    y2="155"
                    stroke="#f97316"
                    strokeOpacity=".08"
                    strokeWidth="1"
                  />
                  <circle
                    cx="80"
                    cy="20"
                    r="2.5"
                    fill="#a855f7"
                    fillOpacity=".06"
                  />
                  <line
                    x1="120"
                    y1="35"
                    x2="80"
                    y2="20"
                    stroke="#a855f7"
                    strokeOpacity=".04"
                    strokeWidth="1"
                  />
                  <circle
                    cx="350"
                    cy="50"
                    r="2.5"
                    fill="#e84393"
                    fillOpacity=".06"
                  />
                  <line
                    x1="310"
                    y1="35"
                    x2="350"
                    y2="50"
                    stroke="#e84393"
                    strokeOpacity=".04"
                    strokeWidth="1"
                  />
                  <circle
                    cx="370"
                    cy="110"
                    r="2.5"
                    fill="#a855f7"
                    fillOpacity=".06"
                  />
                  <line
                    x1="330"
                    y1="120"
                    x2="370"
                    y2="110"
                    stroke="#a855f7"
                    strokeOpacity=".04"
                    strokeWidth="1"
                  />
                  <circle
                    cx="80"
                    cy="150"
                    r="2.5"
                    fill="#e84393"
                    fillOpacity=".06"
                  />
                  <line
                    x1="120"
                    y1="130"
                    x2="80"
                    y2="150"
                    stroke="#e84393"
                    strokeOpacity=".04"
                    strokeWidth="1"
                  />
                  <circle
                    cx="220"
                    cy="90"
                    r="20"
                    stroke="#a855f7"
                    strokeOpacity=".15"
                    strokeWidth="1"
                    fill="none"
                  >
                    <animate
                      attributeName="r"
                      values="20;35;20"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-opacity"
                      values=".15;0;.15"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>
              <div className="method-card-body">
                <h3>Your TAM, your timeline</h3>
                <p>
                  We cycle your entire addressable market on your schedule: 60,
                  90, or 180 days. Every prospect touched. No one left behind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PROCESS
          ============================================ */}
      <section id="process">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag grad-text">Our process</span>
            <h2>From zero to live campaigns in 3 weeks</h2>
            <p>
              No long ramp. No hand-wringing. Here&apos;s exactly what happens
              after you book your call.
            </p>
          </div>
        </div>

        <div className="process-stack-wrap">
          <div className="pcard pcard--purple">
            <div className="pcard-inner">
              <div className="pcard-pill">
                <span className="pcard-dot" /> Phase 1
              </div>
              <div className="pcard-timing">Month 1 (Weeks 1-4)</div>
              <h3 className="pcard-title">
                Onboarded fast, live in the same month
              </h3>
              <p className="pcard-desc">
                You go from zero outbound to live campaigns sending to your ICP
                within 3 weeks. By the end of month 1, you&apos;ll have real
                reply data and your first qualified conversations.
              </p>
              <div className="pcard-grid">
                <div className="pcard-gi">
                  <span className="pcard-gn">01</span>ICP deep dive and TAM
                  mapping
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">02</span>Domain + inbox
                  provisioning on our private infrastructure
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">03</span>Campaigns ready with core
                  offer testing
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">04</span>Lead list built, cleaned,
                  and enriched via Clay
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">05</span>Campaigns launched with
                  initial split tests
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">06</span>Workspace access set up,
                  you see everything
                </div>
              </div>
            </div>
          </div>

          <div className="pcard pcard--beige">
            <div className="pcard-inner">
              <div className="pcard-pill">
                <span className="pcard-dot" /> Phase 2
              </div>
              <div className="pcard-timing">Month 2 (Weeks 5-8)</div>
              <h3 className="pcard-title">
                More tests, more data, more replies
              </h3>
              <p className="pcard-desc">
                We use month 1 performance to figure out what offer to run and
                what to test next. More split tests go live, personalized
                follow-up sequences start generating additional replies, and we
                enrich deeper into your TAM.
              </p>
              <div className="pcard-grid">
                <div className="pcard-gi">
                  <span className="pcard-gn">01</span>More of your TAM mapped
                  and enriched
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">02</span>Follow-up sequences
                  built, live, and rolling
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">03</span>More split tests active
                  across offers and angles
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">04</span>Month 1 data analyzed,
                  winning offers identified
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">05</span>New hypotheses formed and
                  tested
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">06</span>Your close data feeds
                  back into our targeting
                </div>
              </div>
            </div>
          </div>

          <div className="pcard pcard--navy">
            <div className="pcard-inner">
              <div className="pcard-pill">
                <span className="pcard-dot" /> Phase 3
              </div>
              <div className="pcard-timing">Month 3+ (Ongoing)</div>
              <h3 className="pcard-title">
                Proven offer, full scale, new markets
              </h3>
              <p className="pcard-desc">
                Message-market fit is established. We know the proven offer and
                what messaging converts. Now we scale it across your full TAM
                while driving incremental improvements. We never stop A/B
                testing. We cycle your entire market every 60-180 days to
                maximize ROI.
              </p>
              <div className="pcard-grid">
                <div className="pcard-gi">
                  <span className="pcard-gn">01</span>Winning campaigns scaled
                  across your full TAM
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">02</span>New messaging tested
                  while proven offers keep running
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">03</span>TAM cycled every 60-180
                  days for maximum coverage
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">04</span>Vertical and horizontal
                  ICP shifts to explore new markets
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">05</span>Strategy calls to align
                  on goals and keep growing
                </div>
                <div className="pcard-gi">
                  <span className="pcard-gn">06</span>Continuous A/B testing,
                  we never stop optimizing
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA BANNER 3
          ============================================ */}
      <div className="cta-banner">
        <div className="cta-banner-inner">
          <p>
            Still on the fence?{" "}
            <span className="highlight grad-text">
              We guarantee 5 positive replies from your ICP.
            </span>{" "}
            You keep every lead, every conversation, every piece of data.
          </p>
          <a href="#trial" className="btn btn-accent">
            Start your trial
          </a>
        </div>
        <span
          className="cta-star"
          style={{ top: "10%", left: "5%", animationDelay: "0.2s" }}
        />
        <span
          className="cta-star"
          style={{ top: "40%", left: "92%", animationDelay: "1.4s" }}
        />
        <span
          className="cta-star"
          style={{ top: "85%", left: "30%", animationDelay: "0.6s" }}
        />
        <span
          className="cta-star"
          style={{ top: "50%", left: "70%", animationDelay: "2.1s" }}
        />
        <span
          className="cta-star"
          style={{ top: "20%", left: "60%", animationDelay: "1s" }}
        />
      </div>

      {/* ============================================
          TEXT TESTIMONIALS (hidden)
          ============================================ */}
      <section
        id="results"
        className="warm-bg"
        style={{ display: "none" }}
      >
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag grad-text">What clients say</span>
            <h2>Don&apos;t take our word for it, take theirs</h2>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card reveal">
              <blockquote>
                &quot;In our very first month we logged 54 positive replies and
                turned 28 of them into booked intro calls. Their data-driven
                approach got us aligned fast, and now we&apos;re ready to go
                full throttle. These guys have the mechanics to make it
                happen.&quot;
              </blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">D</div>
                <div className="testimonial-info">
                  <div className="name">Devin R.</div>
                  <div className="role">
                    Head of Sales, Executive Networking Platform
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal reveal-delay-1">
              <blockquote>
                &quot;We spent 3-4 years testing different copy, domains, and
                platforms. A few replies here and there but nothing consistent.
                Then in less than 10 weeks, they completely turned things around:
                3-4 highly qualified leads per day, from companies like Calendly
                and GitLab. Next level.&quot;
              </blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">L</div>
                <div className="testimonial-info">
                  <div className="name">Laura C.</div>
                  <div className="role">
                    Strategic Marketing Manager, Video Production
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal reveal-delay-2">
              <blockquote>
                &quot;They set up our domains properly, optimized our outreach,
                and provided clear insights that immediately improved results.
                Any time we hit an issue (high bounce rates, inboxes
                disconnecting), their team was on it fast. When we needed to
                pivot from Outlook to Gmail, they kept campaigns running without
                missing a beat.&quot;
              </blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">E</div>
                <div className="testimonial-info">
                  <div className="name">Eric S.</div>
                  <div className="role">CEO, Digital Marketing Agency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CASE STUDIES
          ============================================ */}
      <section id="cases">
        {/* Animated background */}
        <div className="cases-bg">
          <div className="grid-line h" style={{ top: "20%" }} />
          <div className="grid-line h" style={{ top: "50%" }} />
          <div className="grid-line h" style={{ top: "80%" }} />
          <div className="grid-line v" style={{ left: "25%" }} />
          <div className="grid-line v" style={{ left: "50%" }} />
          <div className="grid-line v" style={{ left: "75%" }} />
          <div
            className="glow-orb"
            style={{
              width: "500px",
              height: "500px",
              background: "rgba(168,85,247,.14)",
              top: "5%",
              left: "-8%",
            }}
          />
          <div
            className="glow-orb"
            style={{
              width: "450px",
              height: "450px",
              background: "rgba(232,67,147,.1)",
              bottom: 0,
              right: "-8%",
              animationDelay: "-5s",
            }}
          />
          {/* Floating particles */}
          {[
            { w: 2, left: "3%", dur: "14s", delay: "0s" },
            { w: 3, left: "8%", dur: "11s", delay: "-2s" },
            { w: 2, left: "12%", dur: "16s", delay: "-7s" },
            { w: 2, left: "18%", dur: "13s", delay: "-4s" },
            { w: 3, left: "22%", dur: "15s", delay: "-9s" },
            { w: 2, left: "28%", dur: "12s", delay: "-1s" },
            { w: 2, left: "32%", dur: "17s", delay: "-6s" },
            { w: 3, left: "37%", dur: "14s", delay: "-11s" },
            { w: 2, left: "42%", dur: "13s", delay: "-3s" },
            { w: 2, left: "47%", dur: "16s", delay: "-8s" },
            { w: 3, left: "52%", dur: "11s", delay: "-5s" },
            { w: 2, left: "57%", dur: "15s", delay: "-10s" },
            { w: 2, left: "62%", dur: "12s", delay: "-2s" },
            { w: 3, left: "67%", dur: "14s", delay: "-7s" },
            { w: 2, left: "72%", dur: "17s", delay: "-4s" },
            { w: 2, left: "77%", dur: "13s", delay: "-9s" },
            { w: 3, left: "82%", dur: "11s", delay: "-1s" },
            { w: 2, left: "87%", dur: "16s", delay: "-6s" },
            { w: 2, left: "92%", dur: "14s", delay: "-12s" },
            { w: 3, left: "97%", dur: "12s", delay: "-3s" },
          ].map((p, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: `${p.w}px`,
                height: `${p.w}px`,
                left: p.left,
                bottom: "-10px",
                animationDuration: p.dur,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        <div
          className="container"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div className="section-header reveal">
            <span className="section-tag">Case studies</span>
            <h2>The results behind the claims</h2>
          </div>
          <div className="case-grid">
            {/* Case 1: Proper Websites */}
            <div className="case-study reveal">
              <div className="case-company-tag">
                <span className="dot" /> Proper Websites &middot; Website Design
                Agency
              </div>
              <div className="case-headline">
                From Referral-Dependent to 14 Qualified Sales Calls in 30 Days
              </div>
              <div className="case-body">
                <div className="case-left">
                  <div className="cs-card">
                    <div className="cs-card-header">
                      <h4>Challenge</h4>
                      <svg
                        className="cs-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" />
                        <circle cx="12" cy="16" r=".5" fill="#fff" />
                      </svg>
                    </div>
                    <p>
                      Yarden&apos;s agency had grown entirely on referrals. Some
                      months had 8 qualified calls, others had zero. No outbound
                      system, no SDR, and no predictable way to fill the
                      pipeline. Every new project started with &quot;who do I
                      know?&quot;
                    </p>
                  </div>
                  <div className="cs-card">
                    <div className="cs-card-header">
                      <h4>Strategy</h4>
                      <svg
                        className="cs-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z" />
                      </svg>
                    </div>
                    <p>
                      We mapped their ICP across three verticals (e-commerce,
                      professional services, SaaS), built Clay-enriched prospect
                      lists, and launched multi-angle campaigns at volume. Tested
                      two core offers in week one. Killed the loser by week
                      three, scaled the winner.
                    </p>
                  </div>
                </div>
                <div className="cs-card cs-card--result">
                  <div className="cs-card-header">
                    <h4>Result</h4>
                    <svg
                      className="cs-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <ul className="cs-result-list">
                    <li>
                      <span className="arrow">&rarr;</span>40+ positive replies
                      in the first 30 days
                    </li>
                    <li>
                      <span className="arrow">&rarr;</span>14 qualified sales
                      calls booked from cold outbound alone
                    </li>
                    <li>
                      <span className="arrow">&rarr;</span>Pipeline went from
                      referral-dependent to repeatable
                    </li>
                    <li>
                      <span className="arrow">&rarr;</span>Outbound system now
                      generates consistent deal flow month over month
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Case 2: Kalypso */}
            <div className="case-study reveal reveal-delay-1">
              <div className="case-company-tag">
                <span
                  className="dot"
                  style={{ background: "var(--pink)" }}
                />{" "}
                Kalypso &middot; B2B SaaS
              </div>
              <div className="case-headline">
                From Untouched TAM to Fastest-Growing Acquisition Channel in 60
                Days
              </div>
              <div className="case-body">
                <div className="case-left">
                  <div className="cs-card">
                    <div className="cs-card-header">
                      <h4>Challenge</h4>
                      <svg
                        className="cs-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" />
                        <circle cx="12" cy="16" r=".5" fill="#fff" />
                      </svg>
                    </div>
                    <p>
                      Dagem had strong product-market fit but no way to reach
                      their very specific ICP at scale. Their TAM was clearly
                      defined but virtually untouched. Previous cold email
                      attempts were low-volume and generic, generating a handful
                      of replies with no real pipeline behind them.
                    </p>
                  </div>
                  <div className="cs-card">
                    <div className="cs-card-header">
                      <h4>Strategy</h4>
                      <svg
                        className="cs-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z" />
                      </svg>
                    </div>
                    <p>
                      Started with high-precision, Clay-enriched campaigns
                      targeting their exact ICP. Used the initial data to find
                      message-market fit fast. Once we had a proven offer, scaled
                      volume across the full TAM and began cycling it on repeat.
                    </p>
                  </div>
                </div>
                <div className="cs-card cs-card--result">
                  <div className="cs-card-header">
                    <h4>Result</h4>
                    <svg
                      className="cs-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <ul className="cs-result-list">
                    <li>
                      <span className="arrow">&rarr;</span>30+ qualified
                      positive replies per month by week 6
                    </li>
                    <li>
                      <span className="arrow">&rarr;</span>Multiple demos booked
                      per week from cold outbound alone
                    </li>
                    <li>
                      <span className="arrow">&rarr;</span>Full TAM now being
                      cycled every quarter
                    </li>
                    <li>
                      <span className="arrow">&rarr;</span>Outbound became their
                      fastest-growing acquisition channel within 60 days
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          VIDEO TESTIMONIALS
          ============================================ */}
      <section>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag grad-text">Video testimonials</span>
            <h2>Hear it directly from them</h2>
          </div>
          <div className="video-grid">
            <div className="video-card reveal">
              <div className="video-embed">
                <div className="video-placeholder">
                  <div className="play-btn" />
                </div>
              </div>
              <div className="video-info">
                <div className="name">Sandor</div>
                <div className="role">Founder, [Company]</div>
              </div>
            </div>
            <div className="video-card reveal reveal-delay-1">
              <div className="video-embed">
                <div className="video-placeholder">
                  <div className="play-btn" />
                </div>
              </div>
              <div className="video-info">
                <div className="name">D</div>
                <div className="role">CEO, [Company]</div>
              </div>
            </div>
            <div className="video-card reveal reveal-delay-2">
              <div className="video-embed">
                <div className="video-placeholder">
                  <div className="play-btn" />
                </div>
              </div>
              <div className="video-info">
                <div className="name">Yarden</div>
                <div className="role">Founder, [Company]</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TRIAL OFFER
          ============================================ */}
      <section id="trial" className="trial-section">
        <div className="container">
          <div className="trial-card reveal">
            <h2>
              5 positive replies, <span className="grad-text">guaranteed</span>
            </h2>
            <p>
              We&apos;ll run a full cold email campaign for you:
              infrastructure, copy, targeting, sending.
              <br />
              <br />
              We deliver 5 qualified positive replies from your ICP.
              <br />
              <br />
              You keep every lead, every conversation, every piece of data.
              <br />
              <br />
              If you decide to continue, we scale it. If not, you walk away with
              real pipeline and zero risk.
            </p>
            <a
              href="#"
              className="btn btn-accent"
              style={{ fontSize: "15px", padding: "15px 40px" }}
            >
              Start your trial
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ
          ============================================ */}
      <section className="warm-bg">
        <div className="container">
          <div
            className="section-header reveal"
            style={{ textAlign: "center", maxWidth: "100%" }}
          >
            <span className="section-tag grad-text">FAQ</span>
            <h2 style={{ textAlign: "center" }}>
              Questions we hear on every intro call
            </h2>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="dfy-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>InboxNavigator</h4>
              <p>
                Minted Ventures Labs LLC
                <br />
                166 Geary Street
                <br />
                San Francisco, California, USA
              </p>
            </div>
            <div className="footer-col">
              <h4>Pages</h4>
              <a href="/">Home</a>
              <a href="/#pricing">Pricing</a>
              <a href="/#demo">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Help</h4>
              <a href="/#demo">Contact</a>
              <a href="/#faq">FAQ</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/cookies">Cookies</a>
              <a href="/refund">Return &amp; Refund Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2026 MSC. Built with love by Minted Ventures Labs LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
