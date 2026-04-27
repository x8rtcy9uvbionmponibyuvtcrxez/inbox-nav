import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import BannerBar from "./components/BannerBar";
import MobileMenu from "./components/MobileMenu";
import PricingTabs from "./components/PricingTabs";
import FaqSection from "./components/FaqSection";
import ScrollReveal from "./components/ScrollReveal";
import NavbarScroll from "./components/NavbarScroll";
import VideoPlayer from "./components/VideoPlayer";
import LazyCalendly from "./components/LazyCalendly";
import "./home.css";

export const metadata: Metadata = {
  title: "InboxNavigator - Scale Your Cold Email Infrastructure",
  description:
    "The only cold email infrastructure that does it all. DFY Google Workspace, Outlook, SMTP, and prewarmed inboxes with 99% inbox placement. Starting at $3/inbox/month. No setup fee, cancel anytime.",
  alternates: {
    canonical: "https://inboxnavigator.com/",
  },
  openGraph: {
    type: "website",
    url: "https://inboxnavigator.com/",
    title: "InboxNavigator - Scale Your Cold Email Infrastructure",
    description:
      "DFY Google Workspace, Outlook, SMTP & prewarmed inboxes. 99% inbox placement, dedicated US IPs. Starting at $3/inbox/month.",
  },
  twitter: {
    card: "summary_large_image",
    title: "InboxNavigator - Scale Your Cold Email Infrastructure",
    description:
      "DFY Google Workspace, Outlook, SMTP & prewarmed inboxes. 99% inbox placement. Starting at $3/inbox/month.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "InboxNavigator",
  url: "https://inboxnavigator.com",
  description:
    "Done-for-you cold email infrastructure. Google Workspace, Outlook, SMTP, and prewarmed inboxes with industry-best deliverability.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "80 N Gould Street",
    addressLocality: "Sheridan",
    addressRegion: "WY",
    postalCode: "82801",
    addressCountry: "US",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's included in the service?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Everything you need: complete DFY inbox setup, technical configuration, domain management, custom tracking domains, warmup configuration, platform import, and ongoing support.",
      },
    },
    {
      "@type": "Question",
      name: "How long will it take to get everything set up?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Everything would get delivered in less than 72 hours.",
      },
    },
    {
      "@type": "Question",
      name: "Can you guarantee deliverability?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After the initial month or two, your sending practices, nature of campaigns, level of personalization, and new regulation policies will influence your deliverability. We monitor and optimize continuously, but results also depend on your campaign quality.",
      },
    },
    {
      "@type": "Question",
      name: "How is this better than IP-based providers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Shared IPs from these providers are prone to blacklisting because they attract spammers and abusers. This means you're sharing servers with high-risk users, increasing the risk to your outbound emails. Our inboxes offer safer, dedicated infrastructure.",
      },
    },
    {
      "@type": "Question",
      name: "What Sending tools do you integrate with?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We integrate with all major cold email platforms: Smartlead, Instantly, Lemlist, Pipl, Reply.io, and similar tools. Our inboxes work seamlessly with any tool that supports OAuth.",
      },
    },
    {
      "@type": "Question",
      name: "Do I have full control over the inboxes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. You get complete access to the inboxes and can easily log into them if you'd like to.",
      },
    },
    {
      "@type": "Question",
      name: "What happens when and if an account burns down?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We have a free replacement policy - if an inbox gets burned, we'll replace it at no cost (just cover domain costs if new domains are needed).",
      },
    },
    {
      "@type": "Question",
      name: "How long do I need to warm the inboxes up for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We recommend a 3-week warmup period before you start sending cold emails.",
      },
    },
    {
      "@type": "Question",
      name: "Can you purchase new domains for me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we can buy domains for you at $15/domain. As standard, we only buy .com domains as they perform the best.",
      },
    },
    {
      "@type": "Question",
      name: "Do you have ongoing support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we provide ongoing monthly support to all of our clients. For clients with over 100 inboxes, we have a dedicated account manager and a private Slack channel for priority support.",
      },
    },
    {
      "@type": "Question",
      name: "Is there any flexibility on pricing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we offer flexible pricing based on the specific needs and scale of your campaigns. Let's discuss your requirements, and we can work out a plan that fits.",
      },
    },
    {
      "@type": "Question",
      name: "Do I own the domains I purchase from Inbox Nav?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you have full ownership of any domains purchased through us.",
      },
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "InboxNavigator Cold Email Infrastructure",
  provider: {
    "@type": "Organization",
    name: "InboxNavigator",
    url: "https://inboxnavigator.com",
  },
  description:
    "Done-for-you cold email infrastructure including Google Workspace inboxes, Outlook inboxes, SMTP, and prewarmed inboxes with 99% inbox placement.",
  url: "https://inboxnavigator.com",
  serviceType: "Cold Email Infrastructure",
  areaServed: "Worldwide",
  offers: {
    "@type": "Offer",
    name: "Google Workspace Inboxes",
    priceCurrency: "USD",
    price: "3.00",
    description:
      "Fully managed Google Workspace inboxes with dedicated US IPs, technical setup, domain configuration, and ongoing support",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "130",
    bestRating: "5",
  },
};

/* ── Checkmark SVG used in pricing features grid ── */
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#e8e8e8" />
      <path
        d="M6 10l3 3 5-5"
        stroke="#555"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd),
        }}
      />

      {/* ── Tracking Scripts (all deferred to reduce TBT) ── */}
      <Script id="gtm" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-M9CS985P');`}
      </Script>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-8X4CYX7D3G"
        strategy="lazyOnload"
      />
      <Script id="ga4" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-8X4CYX7D3G');`}
      </Script>
      <Script id="reb2b" strategy="lazyOnload">
        {`!function(){var reb2b=window.reb2b=window.reb2b||[];if(reb2b.invoked)return;reb2b.invoked=true;reb2b.methods=["identify","collect"];reb2b.factory=function(method){return function(){var args=Array.prototype.slice.call(arguments);args.unshift(method);reb2b.push(args);return reb2b;};};for(var i=0;i<reb2b.methods.length;i++){var key=reb2b.methods[i];reb2b[key]=reb2b.factory(key);}reb2b.load=function(key){var script=document.createElement("script");script.type="text/javascript";script.async=true;script.src="https://s3-us-west-2.amazonaws.com/b2bjsstore/b/"+key+"/reb2b.js.gz";var first=document.getElementsByTagName("script")[0];first.parentNode.insertBefore(script,first);};reb2b.SNIPPET_VERSION="1.0.1";reb2b.load("DNXY8HK8P7O0");}();`}
      </Script>
      <Script
        src="https://cdn.referraltrk.com/referralstack.js"
        data-referralstack="247d13e4-66af-4b38-af84-6aad969aaf91|dd78370f-ef6c-4c9f-9e97-0148913de9d3"
        strategy="lazyOnload"
      />
      <Script id="rewardful-init" strategy="lazyOnload">
        {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
      </Script>
      <Script
        src="https://r.wdfl.co/rw.js"
        data-rewardful="a49b0f"
        strategy="lazyOnload"
      />

      {/* ── Client-side behaviors ── */}
      <ScrollReveal />
      <NavbarScroll />

      {/* ── 1. BANNER BAR ── */}
      <BannerBar />

      {/* ── 2. NAVBAR ── */}
      <nav className="navbar" id="navbar">
        <div className="navbar-inner">
          <Link href="/" className="logo">
            <span>Inbox</span>Navigator
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/dfy">Done-For-You</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#demo">Contact</Link>
            <Link href="#faq">FAQ</Link>
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
              data-rewardful=""
            >
              Get Started
            </a>
          </div>
          <MobileMenu />
        </div>
      </nav>

      {/* ── 3. HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="reveal">
            <div className="hero-tag">
              <span className="badge">New</span> Aged Prewarmed Google Inboxes
            </div>
            <h1>
              Scale faster with{" "}
              <span className="gradient-text">cost-efficient, reliable</span>{" "}
              inbox infrastructure built for scale
            </h1>
            <p className="hero-sub">
              The only inbox infrastructure that truly does it all, with
              complete transparency, full-service reliability, and the most
              competitive rates for teams serious about achieving massive
              scale.
            </p>
            <Link href="#pricing" className="btn btn-gradient">
              Start Scaling
            </Link>
          </div>

        </div>
      </section>

      {/* ── 4. LOGO MARQUEE ── */}
      <section className="in_logo_section">
        <div className="container">
          <div>
            <h2 className="in_logo_heading">
              We supercharge{" "}
              <span className="in_gradient_text_2">
                the platforms you love with seamless integration
              </span>
            </h2>
            <div className="in_logo_loop">
              <div className="in_logos">
                <img
                  src="/images/image-21.svg"
                  loading="lazy"
                  alt="Smartlead logo"
                  className="in_logo_img"
                />
                <img
                  src="/images/instantly-logo.svg"
                  loading="lazy"
                  alt="Instantly logo"
                  className="in_logo_img"
                />
                <img
                  src="/images/Frame-1171276546.webp"
                  loading="lazy"
                  alt="Lemlist logo"
                  className="in_logo_img"
                />
                <img
                  src="/images/plusvibe-logo.svg"
                  loading="lazy"
                  alt="Plusvibe logo"
                  className="in_logo_img"
                />
                <img
                  src="/images/reply-logo.svg"
                  loading="lazy"
                  alt="Reply.io logo"
                  className="in_logo_img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. ABOUT ── */}
      <section className="about section-warm">
        <div className="container reveal">
          <div className="tag gradient">Accelerate Success</div>
          <h2>
            Completely Managed Google Workspace &amp; Outlook Inboxes That Scale
            With You
          </h2>
          <p>
            Don&apos;t leave your outbound motion up to chance. Focus on closing
            deals and let us worry about your cold email infrastructure and
            deliverability. Inbox Navigator is your secret weapon in winning the
            outbound game. No setup fee. Flat rate. Cancel anytime. Bring your
            domains.
          </p>
          <a
            href="https://app.inboxnavigator.com/sign-up?redirect_url=/dashboard/products"
            className="btn btn-gradient"
            data-rewardful=""
          >
            BUY NOW
          </a>
        </div>
      </section>

      {/* ── 6. FEATURES ── */}
      <section className="features">
        <div className="container">
          <div
            className="tag gradient"
            style={{ textAlign: "center", display: "block" }}
          >
            Accelerate Success
          </div>
          <h2 style={{ textAlign: "center", marginBottom: 56 }}>
            Here are more details
          </h2>

          {/* Feature Row 1 */}
          <div className="feat-row reveal">
            <div className="feat-text">
              <div className="tag gradient">Accelerate Success</div>
              <h3>Zero Effort Required</h3>
              <div className="feat-box">
                <p>
                  Fill out the onboarding form in 5 minutes and our team will
                  take care of everything else, no matter how many inboxes you
                  buy.
                  <br />
                  <br />
                  We set up your domains and inboxes, delivering them piping hot
                  directly into your Smartlead/Instantly account.
                </p>
              </div>
            </div>
            <div className="feat-img">
              <div className="sc-mockup">
                <div className="sc-mockup-bar">
                  <span className="d"></span>
                  <span className="d"></span>
                  <span className="d"></span>
                  <span className="t">onboarding.form</span>
                </div>
                <div className="sc-mockup-body">
                  <div className="title">Quick Setup</div>
                  <div className="row">
                    <span className="lbl">Company name</span>
                    <span className="badge badge-green">Done</span>
                  </div>
                  <div className="row">
                    <span className="lbl">ICP details</span>
                    <span className="badge badge-green">Done</span>
                  </div>
                  <div className="row">
                    <span className="lbl">Sending platform</span>
                    <span className="badge badge-green">Done</span>
                  </div>
                  <div className="row">
                    <span className="lbl">Domain preferences</span>
                    <span className="badge badge-green">Done</span>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      textAlign: "center",
                      padding: 8,
                      background:
                        "linear-gradient(135deg,#a855f7,#e84393)",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    Setup Complete, Delivering Now
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Row 2 */}
          <div className="feat-row reverse reveal">
            <div className="feat-img">
              <div className="sc-mockup">
                <div className="sc-mockup-bar">
                  <span className="d"></span>
                  <span className="d"></span>
                  <span className="d"></span>
                  <span className="t">deliverability.monitor</span>
                </div>
                <div className="sc-mockup-body">
                  <div className="title">US-IP Deliverability</div>
                  <div className="grid2">
                    <div className="stat-box">
                      <div className="n" style={{ color: "#28c840" }}>
                        99%
                      </div>
                      <div className="l">Inbox Rate</div>
                    </div>
                    <div className="stat-box">
                      <div className="n" style={{ color: "#a855f7" }}>
                        0.5%
                      </div>
                      <div className="l">Bounce Rate</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div className="row">
                      <span className="lbl">Region</span>
                      <span className="val" style={{ color: "#28c840" }}>
                        US Only
                      </span>
                    </div>
                    <div className="row">
                      <span className="lbl">IP Type</span>
                      <span className="val">Dedicated</span>
                    </div>
                    <div className="row">
                      <span className="lbl">Blacklist Status</span>
                      <span className="badge badge-green">Clean</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="feat-text">
              <div className="tag gradient">Accelerate Success</div>
              <h3>US-IP Based + High Deliverability</h3>
              <div className="feat-box">
                <p>
                  Don&apos;t let shady IP-based inbox providers and unreliable
                  resellers destroy your deliverability and growth.
                  <br />
                  <br />
                  All of our inboxes are US-IP based and we use the latest best
                  practices to make sure that you continue to get high
                  deliverability in every single campaign that you launch.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Row 3 */}
          <div className="feat-row reveal">
            <div className="feat-text">
              <div className="tag gradient">Accelerate Success</div>
              <h3>Affordable, Reliable &amp; Scalable</h3>
              <div className="feat-box">
                <p>
                  Cold email infrastructure that you can rely on, that delivers
                  consistently and scales with you with zero setup fee, better
                  prices.
                  <br />
                  <br />
                  Built by outbound experts for outbound astronauts.
                </p>
              </div>
            </div>
            <div className="feat-img">
              <div className="sc-mockup">
                <div className="sc-mockup-bar">
                  <span className="d"></span>
                  <span className="d"></span>
                  <span className="d"></span>
                  <span className="t">cost.comparison</span>
                </div>
                <div className="sc-mockup-body">
                  <div className="title">Cost per Inbox / Month</div>
                  <div style={{ marginBottom: 12 }}>
                    <div className="lbl" style={{ marginBottom: 4 }}>
                      Other Providers
                    </div>
                    <div className="meter">
                      <div
                        className="meter-fill"
                        style={{
                          width: "85%",
                          background:
                            "linear-gradient(90deg,#e84393,rgba(232,67,147,.4))",
                        }}
                      ></div>
                    </div>
                    <div
                      className="val"
                      style={{
                        marginTop: 4,
                        color: "rgba(255,255,255,.4)",
                      }}
                    >
                      $6 to $8 / inbox
                    </div>
                  </div>
                  <div>
                    <div className="lbl" style={{ marginBottom: 4 }}>
                      InboxNavigator
                    </div>
                    <div className="meter">
                      <div
                        className="meter-fill"
                        style={{
                          width: "35%",
                          background:
                            "linear-gradient(90deg,#28c840,#a855f7)",
                        }}
                      ></div>
                    </div>
                    <div
                      className="val"
                      style={{ marginTop: 4, color: "#28c840" }}
                    >
                      $3 / inbox
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      textAlign: "center",
                      fontSize: 10,
                      color: "rgba(255,255,255,.3)",
                    }}
                  >
                    Save 50%+ on infrastructure
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a
              href="#pricing"
              className="btn btn-gradient"
              data-rewardful=""
            >
              BUY NOW
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. PREWARMED ── */}
      <section className="prewarmed section-warm">
        <div className="container">
          <div
            className="tag gradient"
            style={{
              textAlign: "center",
              display: "block",
              fontSize: 9,
              maxWidth: 500,
              margin: "0 auto 8px",
            }}
          >
            We beat Instantly in every single aspect when it comes to prewarmed
            infra
          </div>
          <h2 style={{ textAlign: "center", marginBottom: 8 }}>Prewarmed</h2>
          <p className="prewarmed-sub">
            Get prewarmed, ready-to-launch inboxes in record time and be live
            today + get free .com domains with every order.
          </p>
          <div className="prewarm-grid">
            <div className="prewarm-card reveal">
              <div className="prewarm-card-img">
                <img src="/images/Frame-1171276536.svg" alt="Instant Scale" loading="lazy" />
              </div>
              <div className="prewarm-card-body">
                <h3>Instant Scale for Winning Campaigns</h3>
                <p>
                  Take your top-performing campaigns to the next level with
                  seamless scaling. No delays, just results.
                </p>
              </div>
            </div>
            <div className="prewarm-card reveal">
              <div className="prewarm-card-img">
                <img src="/images/rescue.svg" alt="Rescue Campaigns" loading="lazy" />
              </div>
              <div className="prewarm-card-body">
                <h3>Rescue Campaigns in Crisis</h3>
                <p>
                  When your reseller goes bust or your inboxes burn out,
                  don&apos;t let your winning campaigns die. Use pre-warmed
                  infrastructure to keep sending without missing a beat.
                </p>
              </div>
            </div>
            <div className="prewarm-card featured reveal">
              <h3>Skip The Wait, Start Scaling</h3>
              <p>
                Pre-warmed inboxes built to deliver game-changing results fast,
                limited availability for those ready to scale.
              </p>
              <div className="pricing-box">
                <div className="price-row">
                  <span className="price">$7</span>
                  <span className="price-unit">/ Inbox</span>
                </div>
                <div className="price-note">Limited stock</div>
                <h4>Prewarmed Google Inboxes</h4>
                <ul className="feat-list">
                  <li>Premium US IP Only</li>
                  <li>MOQ: 10 Inboxes</li>
                  <li>FREE .COM DOMAIN</li>
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
            <div className="prewarm-card reveal">
              <div className="prewarm-card-img">
                <img src="/images/customize.svg" alt="Customize" loading="lazy" />
              </div>
              <div className="prewarm-card-body">
                <h3>Customize Every Detail</h3>
                <p>
                  Update the sender name, profile picture, and the forwarding
                  URL to your choice and be live instantly.
                </p>
              </div>
            </div>
            <div className="prewarm-card reveal">
              <div className="prewarm-card-img">
                <img src="/images/quality.svg" alt="Quality" loading="lazy" />
              </div>
              <div className="prewarm-card-body">
                <h3>Quality You Need, Prices You&apos;ll Love</h3>
                <p>
                  Don&apos;t let Instantly overcharge you. Inbox Navigator
                  offers premium pre-warmed infrastructure with competitive
                  pricing, no hidden fees, and no compromises.
                </p>
              </div>
            </div>
          </div>
          <div className="feature-strip">
            <div className="strip-item reveal">
              <div className="strip-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h4>Deliverability Optimized</h4>
              <p>
                Engineered for the highest inbox placement rates, ensuring your
                emails consistently land where they matter most.
              </p>
            </div>
            <div className="strip-item reveal">
              <div className="strip-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>High-Quality US IP Accounts</h4>
              <p>
                Accounts powered by premium US-based IPs for reliable
                performance and consistent deliverability.
              </p>
            </div>
            <div className="strip-item reveal">
              <div className="strip-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h4>Seamless Sender Profile Updates</h4>
              <p>
                Effortlessly update profile pictures, sender names, and email
                addresses without compromising deliverability.
              </p>
            </div>
            <div className="strip-item reveal">
              <div className="strip-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h4>Premium Domains with Full Control</h4>
              <p>
                Choose from professional-grade domains, set up seamless
                forwarding, and enjoy up to 3 users per domain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. WALL OF LOVE ── */}
      <section className="wall-of-love section-warm">
        <div className="container">
          <div
            className="tag gradient"
            style={{ textAlign: "center", display: "block" }}
          >
            Accelerate Success
          </div>
          <h2>Wall of Love</h2>
          <p className="wall-sub">
            Hear what our satisfied customers have to say about us.
          </p>
        </div>
        <div className="testimonial-track">
          {/* Original cards */}
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;I appreciate all the help I&apos;ve received from Kunal and
              his team with my email setup and questions. Delivery was fast and
              I look forward to a continued partnership!&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Daniel-Wellington.webp"
                alt="Daniel Wellington - Founder, Marketing Agency"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Daniel Wellington</div>
                <div className="test-role">Founder, Marketing Agency</div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;Inbox Navigator is 5 times cheaper, way easier to scale and
              they do the setup for you. I get to focus on the campaign creative
              while they take care of everything else.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Mitch-Hill.webp"
                alt="Mitch Hill - CEO, Lead Gen Agency Owner"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Mitch Hill</div>
                <div className="test-role">CEO - Lead Gen Agency Owner</div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;We were spending over $600 a month for just 80 Google
              Workspace inboxes. That&apos;s when we switched to Inbox Nav and
              decided to buy 150 accounts, this was a game changer.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Conner-Baker_1.webp"
                alt="Conner Baker - Ecomm. Email Marketing Agency"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Conner Baker</div>
                <div className="test-role">
                  Ecomm. Email Marketing Agency
                </div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;For our B2B side, we were barely doing anything with just a
              handful of inboxes, Kunal set us with 40 inboxes delivered right
              into our Instantly smoothly and also helped us launch better
              campaigns.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Damian-Ross.webp"
                alt="Damian Ross - Course & coaching business"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Damian Ross</div>
                <div className="test-role">
                  Course &amp; coaching business
                </div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;We&apos;re consistently booking over a dozen appointments
              every single month thanks to Inbox Navigator. They&apos;re fast,
              reliable, and effective.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Chris-Gibbins.webp"
                alt="Chris Gibbins - CTO, National Business"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Chris Gibbins</div>
                <div className="test-role">CTO, National Business</div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;Wonderful experience working with the team at Inbox
              Navigator, onboarding process was a breeze. Thanks!&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Dhruv-Malhotra.webp"
                alt="Dhruv Malhotra - CEO, Eye Universal"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Dhruv Malhotra</div>
                <div className="test-role">CEO - Eye Universal</div>
              </div>
            </div>
          </div>
          {/* Duplicate for seamless loop */}
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;I appreciate all the help I&apos;ve received from Kunal and
              his team with my email setup and questions. Delivery was fast and
              I look forward to a continued partnership!&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Daniel-Wellington.webp"
                alt="Daniel Wellington - Founder, Marketing Agency"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Daniel Wellington</div>
                <div className="test-role">Founder, Marketing Agency</div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;Inbox Navigator is 5 times cheaper, way easier to scale and
              they do the setup for you. I get to focus on the campaign creative
              while they take care of everything else.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Mitch-Hill.webp"
                alt="Mitch Hill - CEO, Lead Gen Agency Owner"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Mitch Hill</div>
                <div className="test-role">CEO - Lead Gen Agency Owner</div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;We were spending over $600 a month for just 80 Google
              Workspace inboxes. That&apos;s when we switched to Inbox Nav and
              decided to buy 150 accounts, this was a game changer.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Conner-Baker_1.webp"
                alt="Conner Baker - Ecomm. Email Marketing Agency"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Conner Baker</div>
                <div className="test-role">
                  Ecomm. Email Marketing Agency
                </div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;For our B2B side, we were barely doing anything with just a
              handful of inboxes, Kunal set us with 40 inboxes delivered right
              into our Instantly smoothly and also helped us launch better
              campaigns.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Damian-Ross.webp"
                alt="Damian Ross - Course & coaching business"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Damian Ross</div>
                <div className="test-role">
                  Course &amp; coaching business
                </div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;We&apos;re consistently booking over a dozen appointments
              every single month thanks to Inbox Navigator. They&apos;re fast,
              reliable, and effective.&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Chris-Gibbins.webp"
                alt="Chris Gibbins - CTO, National Business"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Chris Gibbins</div>
                <div className="test-role">CTO, National Business</div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <blockquote>
              &quot;Wonderful experience working with the team at Inbox
              Navigator, onboarding process was a breeze. Thanks!&quot;
            </blockquote>
            <div className="test-author">
              <Image
                src="/images/Dhruv-Malhotra.webp"
                alt="Dhruv Malhotra - CEO, Eye Universal"
                className="test-avatar"
                width={80}
                height={80}
                loading="lazy"
              />
              <div>
                <div className="test-name">Dhruv Malhotra</div>
                <div className="test-role">CEO - Eye Universal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8b. VIDEO TESTIMONIALS ── */}
      <section className="video-test section-warm">
        <div className="container">
          <div
            className="tag gradient"
            style={{ textAlign: "center", display: "block" }}
          >
            Accelerate Success
          </div>
          <h2 style={{ textAlign: "center", marginBottom: 8 }}>
            What Our Clients Say
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              marginBottom: 48,
            }}
          >
            Feel the love!
          </p>

          <div className="video-grid-3">
            <div className="vt-card-lg reveal">
              <VideoPlayer
                thumbnailSrc="https://i.vimeocdn.com/video/2073797341-948a07e69575fc44811b9bcb0feb7c33e66881aca9bcada5303103c35c52049f-d_960"
                thumbnailAlt="Alfie Carter"
                vimeoId="1130193075"
              />
              <div className="vt-card-info">
                <h4>Inbox Nav is the best hands down</h4>
                <div className="vt-card-author">
                  <div>
                    <div className="vt-name">Alfie Carter</div>
                    <div className="vt-role2">
                      Founder of Prosp.ai &amp; Speel.AI
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="vt-card-lg reveal">
              <VideoPlayer
                thumbnailSrc="/images/Aaron-Reid.webp"
                thumbnailAlt="Aaron Reid"
                vimeoId="1036432342"
              />
              <div className="vt-card-info">
                <h4>Unmatched Quality</h4>
                <div className="vt-card-author">
                  <Image
                    src="/images/Aaron-Reid-2.avif"
                    alt="Aaron Reid - Traction"
                    width={64}
                    height={64}
                    loading="lazy"
                  />
                  <div>
                    <div className="vt-name">Aaron Reid</div>
                    <div className="vt-role2">
                      Traction | Official Clay, Instantly and Smartlead Partner
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="vt-card-lg reveal">
              <VideoPlayer
                thumbnailSrc="/images/Omar-Ismail_1.webp"
                thumbnailAlt="Omar Ismail"
                vimeoId="1036432285"
              />
              <div className="vt-card-info">
                <h4>Faster, Reliable, Efficient</h4>
                <div className="vt-card-author">
                  <Image
                    src="/images/Omar-Ismail_1.webp"
                    alt="Omar Ismail - Founder, Tenstrikes"
                    width={64}
                    height={64}
                    loading="lazy"
                  />
                  <div>
                    <div className="vt-name">Omar Ismail</div>
                    <div className="vt-role2">
                      Founder | Tenstrikes (High Ticket Lead Gen Agency)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a
              href="#pricing"
              className="btn btn-gradient"
              data-rewardful=""
            >
              BUY NOW
            </a>
          </div>
        </div>
      </section>

      {/* ── 9. WHAT MAKES US SPECIAL ── */}
      <section className="special">
        <div className="container">
          <div
            className="tag gradient"
            style={{ textAlign: "center", display: "block" }}
          >
            Accelerate Success
          </div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: 8,
              color: "#fff",
            }}
          >
            What Makes Us Special
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#aab",
              marginBottom: 56,
            }}
          >
            Here&apos;s what happens next
          </p>
          <div className="story-cards-wrap">
            {/* Card 1 */}
            <div className="story-card">
              <div className="story-card-text">
                <h3>Diversified Infrastructure, DFY</h3>
                <p>
                  Google Workspace, Outlook, prewarmed, SMTP, all under one
                  roof. Place your order, fill a 3-minute form, and we build
                  everything. You focus on campaigns. We handle the plumbing.
                </p>
              </div>
              <div className="story-card-img">
                <div className="sc-mockup">
                  <div className="sc-mockup-bar">
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="t">infrastructure.overview</span>
                  </div>
                  <div className="sc-mockup-body">
                    <div className="title">Infrastructure Types</div>
                    <div className="grid2">
                      <div className="stat-box">
                        <div className="n" style={{ fontSize: 14 }}>
                          Google
                        </div>
                        <div className="l">Google Workspace</div>
                        <div
                          className="badge badge-green"
                          style={{
                            marginTop: 6,
                            display: "inline-block",
                          }}
                        >
                          Active
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="n" style={{ fontSize: 14 }}>
                          Microsoft
                        </div>
                        <div className="l">Azure 365</div>
                        <div
                          className="badge badge-green"
                          style={{
                            marginTop: 6,
                            display: "inline-block",
                          }}
                        >
                          Active
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="n" style={{ fontSize: 14 }}>
                          SMTP
                        </div>
                        <div className="l">AWS Based</div>
                        <div
                          className="badge badge-green"
                          style={{
                            marginTop: 6,
                            display: "inline-block",
                          }}
                        >
                          Active
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="n" style={{ fontSize: 14 }}>
                          Prewarmed
                        </div>
                        <div className="l">Ready to Send</div>
                        <div
                          className="badge badge-purple"
                          style={{
                            marginTop: 6,
                            display: "inline-block",
                          }}
                        >
                          Live
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        textAlign: "center",
                        fontSize: 10,
                        color: "rgba(255,255,255,.3)",
                      }}
                    >
                      All types - One platform
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="story-card">
              <div className="story-card-text">
                <h3>Isolated, Dedicated Infrastructure</h3>
                <p>
                  Nothing is shared. Every inbox runs on its own dedicated IP,
                  in its own isolated workspace. No shared servers, no shared
                  tenants, no cross-contamination from other senders. Your
                  infrastructure is yours alone.
                </p>
              </div>
              <div className="story-card-img">
                <div className="sc-mockup">
                  <div className="sc-mockup-bar">
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="t">isolation.status</span>
                  </div>
                  <div className="sc-mockup-body">
                    <div className="title">Your Dedicated Environment</div>
                    <div className="row">
                      <span className="lbl">Workspace</span>
                      <span className="badge badge-purple">Isolated</span>
                    </div>
                    <div className="row">
                      <span className="lbl">IP Address</span>
                      <span className="badge badge-purple">Dedicated</span>
                    </div>
                    <div className="row">
                      <span className="lbl">Server</span>
                      <span className="badge badge-purple">Private</span>
                    </div>
                    <div className="row">
                      <span className="lbl">Tenant</span>
                      <span className="badge badge-purple">Single</span>
                    </div>
                    <div className="row">
                      <span className="lbl">Shared Users</span>
                      <span className="val" style={{ color: "#28c840" }}>
                        0
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        padding: 8,
                        background: "rgba(168,85,247,.08)",
                        border: "1px solid rgba(168,85,247,.12)",
                        borderRadius: 8,
                        textAlign: "center",
                        fontSize: 10,
                        color: "#a855f7",
                        fontWeight: 600,
                      }}
                    >
                      Zero cross-contamination
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="story-card">
              <div className="story-card-text">
                <h3>Zero Hassle Domains</h3>
                <p>
                  Bring your own domains or let us buy them for you, either way,
                  we handle everything. SPF, DKIM, DMARC, forwarding, tracking,
                  all configured end-to-end. You just tell us what you need.
                </p>
              </div>
              <div className="story-card-img">
                <div className="sc-mockup">
                  <div className="sc-mockup-bar">
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="t">domain.setup</span>
                  </div>
                  <div className="sc-mockup-body">
                    <div className="title">Domain Configuration</div>
                    <div className="row">
                      <span className="lbl">Iloveinboxnav.com</span>
                      <span className="badge badge-green">Verified</span>
                    </div>
                    <div style={{ padding: "4px 0 8px" }}>
                      <div className="row">
                        <span
                          className="lbl"
                          style={{ paddingLeft: 12 }}
                        >
                          SPF
                        </span>
                        <span
                          className="val"
                          style={{ color: "#28c840" }}
                        >
                          &#10003;
                        </span>
                      </div>
                      <div className="row">
                        <span
                          className="lbl"
                          style={{ paddingLeft: 12 }}
                        >
                          DKIM
                        </span>
                        <span
                          className="val"
                          style={{ color: "#28c840" }}
                        >
                          &#10003;
                        </span>
                      </div>
                      <div className="row">
                        <span
                          className="lbl"
                          style={{ paddingLeft: 12 }}
                        >
                          DMARC
                        </span>
                        <span
                          className="val"
                          style={{ color: "#28c840" }}
                        >
                          &#10003;
                        </span>
                      </div>
                      <div className="row">
                        <span
                          className="lbl"
                          style={{ paddingLeft: 12 }}
                        >
                          Forwarding
                        </span>
                        <span
                          className="val"
                          style={{ color: "#28c840" }}
                        >
                          &#10003;
                        </span>
                      </div>
                      <div className="row">
                        <span
                          className="lbl"
                          style={{ paddingLeft: 12 }}
                        >
                          Tracking
                        </span>
                        <span
                          className="val"
                          style={{ color: "#28c840" }}
                        >
                          &#10003;
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <span className="lbl">Iloveinboxnav.com</span>
                      <span className="badge badge-green">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="story-card">
              <div className="story-card-text">
                <h3>Alfred to your Batman</h3>
                <p>
                  We don&apos;t just set it up and disappear. Swap inboxes,
                  update profiles, add seats, anything you need, anytime, at no
                  extra cost. One Slack message and it&apos;s done.
                </p>
              </div>
              <div className="story-card-img">
                <div className="sc-mockup">
                  <div className="sc-mockup-bar">
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="t">support.chat</span>
                  </div>
                  <div className="sc-mockup-body">
                    <div className="chat-msg">
                      <div className="chat-from">You - 11:42 PM</div>
                      Hey, can you swap 20 inboxes to new domains and update
                      all sender names?
                    </div>
                    <div className="chat-msg reply">
                      <div
                        className="chat-from"
                        style={{ color: "#a855f7" }}
                      >
                        InboxNav - 11:44 PM
                      </div>
                      Done! 20 inboxes swapped, sender names updated, DNS
                      configured. All live and warming. &#10003;
                    </div>
                    <div className="chat-msg">
                      <div className="chat-from">You - 11:45 PM</div>
                      That was 2 minutes. Unreal.
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        textAlign: "center",
                        fontSize: 10,
                        color: "rgba(255,255,255,.25)",
                      }}
                    >
                      Avg response time: 4 minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="story-card">
              <div className="story-card-text">
                <h3>
                  Industry Best Deliverability,{" "}
                  <strong>Guaranteed</strong>
                </h3>
                <p>
                  Deliverability isn&apos;t set-and-forget. We actively monitor
                  trends, adapt to policy changes, and tune your infrastructure
                  daily. The result: consistent inbox placement that holds up
                  campaign after campaign.
                </p>
              </div>
              <div className="story-card-img">
                <div className="sc-mockup">
                  <div className="sc-mockup-bar">
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="d"></span>
                    <span className="t">deliverability.guarantee</span>
                  </div>
                  <div
                    className="sc-mockup-body"
                    style={{
                      padding: "24px 18px 32px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      className="big-num"
                      style={{
                        background:
                          "linear-gradient(135deg,#a855f7,#e84393,#f97316)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontSize: 56,
                        margin: "0 0 8px",
                      }}
                    >
                      99%
                    </div>
                    <div className="sub" style={{ fontSize: 13 }}>
                      Inbox Placement Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. IS THIS FOR YOU (HIDDEN) ── */}
      <section
        className="for-you section-warm"
        style={{ display: "none" }}
      >
        <div className="container">
          <div
            className="tag gradient"
            style={{ textAlign: "center", display: "block" }}
          >
            Accelerate Success
          </div>
          <h2>Is This for You</h2>
          <p className="for-you-sub">
            Lead Gen Agencies | SaaS | Recruitment | Business Funding |
            Acquisition | Marketing Agency
          </p>
          <div className="for-you-grid">
            <div className="feature-card reveal">
              <h3>Sick and Tired of Unreliable Infra</h3>
              <p>
                If you&apos;re tired of unreliable reseller Google Workspace and
                Outlook inboxes that die in 30 days, you&apos;re in the right
                place.
              </p>
            </div>
            <div className="feature-card reveal">
              <h3>Are You a Lead Gen Agency Owner</h3>
              <p>
                Inbox Navigator is specially built for lead gen agency owners who
                want high deliverability while sending massive volumes for their
                clients.
              </p>
            </div>
            <div className="feature-card reveal">
              <h3>Need a Backup</h3>
              <p>
                Outbound is dynamic, with new policies and regulations popping
                up every 2 weeks. Relying on a single inbox provider is too
                risky.
              </p>
            </div>
            <div className="feature-card reveal">
              <h3>Burnt by Other Inbox Providers</h3>
              <p>
                Had a bad experience with server IP-based inbox providers? We
                did too. That&apos;s why we started Inbox Navigator.
              </p>
            </div>
          </div>
          <div className="for-you-cta reveal">
            <h3>
              Scale campaigns effortlessly and send thousands of emails per
              month with ease
            </h3>
            <p>
              Whether you&apos;re sending 10,000 or 100,000 emails a month,
              InboxNavigator gives you the infrastructure to do it reliably and
              affordably.
            </p>
            <a
              href="https://app.inboxnavigator.com/sign-up?redirect_url=/dashboard/products"
              className="btn btn-gradient"
              data-rewardful=""
            >
              BUY NOW
            </a>
          </div>
        </div>
      </section>

      {/* ── 11. STATISTICS ── */}
      <section
        className="statistics section-navy"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 20% 40%,rgba(168,85,247,.12),transparent 70%),radial-gradient(ellipse 50% 50% at 80% 60%,rgba(232,67,147,.08),transparent 70%)",
            pointerEvents: "none",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(168,85,247,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,.02) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
            pointerEvents: "none",
            opacity: 0.5,
          }}
        ></div>
        <div
          className="container"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div
            className="tag"
            style={{
              textAlign: "center",
              display: "block",
              marginBottom: 16,
              color: "rgba(168,85,247,.7)",
            }}
          >
            Accelerate Success
          </div>
          <h2
            style={{
              textAlign: "center",
              color: "#fff",
              marginBottom: 56,
            }}
          >
            Our pride and glory
          </h2>
          <div className="stats-grid">
            <div className="stat-item reveal">
              <div
                className="num"
                style={{
                  fontSize: "clamp(48px,7vw,80px)",
                  fontStyle: "italic",
                  background: "linear-gradient(135deg,#a855f7,#e84393)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                130+
              </div>
              <div className="label">Happy Clients</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item reveal">
              <div
                className="num"
                style={{
                  fontSize: "clamp(48px,7vw,80px)",
                  fontStyle: "italic",
                  background: "linear-gradient(135deg,#e84393,#f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                14,000+
              </div>
              <div className="label">Inboxes Delivered</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item reveal">
              <div
                className="num"
                style={{
                  fontSize: "clamp(48px,7vw,80px)",
                  fontStyle: "italic",
                  background: "linear-gradient(135deg,#f97316,#a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                48 Hour
              </div>
              <div className="label">Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. PRICING ── */}
      <section className="pricing" id="pricing">
        <div className="container">
          <h2>Pricing</h2>
          <PricingTabs />
          <div
            style={{
              maxWidth: 960,
              margin: "48px auto 0",
              background: "#fff",
              borderRadius: 20,
              padding: "48px 56px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "#1a1a1a",
                margin: "0 0 40px",
                lineHeight: 1.4,
              }}
            >
              Every plan includes the full platform, upgrade, mix products, or
              scale up anytime
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 64px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  Done-for-You Inbox Provisioning
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  ESP &amp; Warmup Tool Integrations
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  Deliverability-Tuned DNS &amp; Records
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  Domain &amp; Inbox Management at Scale
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  SPF, DKIM &amp; DMARC Health Monitoring
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  Bulk Profile &amp; Persona Setup
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  Isolated Workspace &amp; Domain Separation
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 15, color: "#444" }}>
                  Email Forwarding &amp; Tag-Based Routing
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. OUR PROCESS ── */}
      <section className="process section-warm">
        <div className="container">
          <div
            className="tag gradient"
            style={{ textAlign: "center", display: "block" }}
          >
            Accelerate Success
          </div>
          <h2 style={{ textAlign: "center", marginBottom: 8 }}>
            Our Process
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#888",
              marginBottom: 56,
            }}
          >
            Here&apos;s what happens next
          </p>
          <div className="process-grid">
            <div className="process-card reveal">
              <div className="process-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#pg1)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <defs>
                    <linearGradient
                      id="pg1"
                      x1="0"
                      y1="0"
                      x2="24"
                      y2="24"
                    >
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="#e84393" />
                    </linearGradient>
                  </defs>
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3>Select Your Plan and Place Your Order</h3>
              <p>
                Choose the number of Google Workspace and Outlook inboxes you
                want and place your order. You can bring your own domains at no
                extra charge or have us buy domains for you.
              </p>
            </div>
            <div className="process-card reveal">
              <div className="process-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#pg2)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <defs>
                    <linearGradient
                      id="pg2"
                      x1="0"
                      y1="0"
                      x2="24"
                      y2="24"
                    >
                      <stop stopColor="#e84393" />
                      <stop offset="1" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </div>
              <h3>3-Minute Onboarding</h3>
              <p>
                Fill out a brief onboarding form in just 3 minutes and give us
                all the details about your order like the domains you want to
                use, the usernames, profile pictures, configuration, and
                preferences, and our team takes care of everything else.
              </p>
            </div>
            <div className="process-card reveal">
              <div className="process-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#pg3)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <defs>
                    <linearGradient
                      id="pg3"
                      x1="0"
                      y1="0"
                      x2="24"
                      y2="24"
                    >
                      <stop stopColor="#f97316" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M8 12l2 2 4-4" />
                </svg>
              </div>
              <h3>Domain Setup</h3>
              <p>
                We handle the technical details, setting up SPF, DMARC, and
                DKIM records, along with domain forwarding and custom tracking
                for all your domains.
              </p>
            </div>
            <div className="process-card reveal">
              <div className="process-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#pg4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <defs>
                    <linearGradient
                      id="pg4"
                      x1="0"
                      y1="0"
                      x2="24"
                      y2="24"
                    >
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 8h20" />
                  <circle cx="7" cy="14" r="2" />
                </svg>
              </div>
              <h3>Inbox Setup</h3>
              <p>
                We set up all of your Google Workspace &amp; Outlook inboxes
                along with profile pictures, email forwarding, and everything
                in between.
              </p>
            </div>
            <div className="process-card reveal">
              <div className="process-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#pg5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <defs>
                    <linearGradient
                      id="pg5"
                      x1="0"
                      y1="0"
                      x2="24"
                      y2="24"
                    >
                      <stop stopColor="#e84393" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>Warming Up in Less Than 2 Days</h3>
              <p>
                We import the users directly into your Instantly/Smartlead and
                configure industry-best warmup settings completely DFY in less
                than 2 days.
              </p>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link href="#demo" className="btn btn-gradient">
              CONTACT US
            </Link>
          </div>
        </div>
      </section>

      {/* ── 14. FAQ ── */}
      <section className="faq" id="faq">
        <div className="container">
          <h2 style={{ textAlign: "center", marginBottom: 8 }}>
            Frequently Asked Questions
          </h2>
          <p className="faq-sub">Get the Answers You&apos;re Looking For</p>
          <FaqSection />
        </div>
      </section>

      {/* ── 15. BOOK A DEMO ── */}
      <section className="demo section-warm" id="demo">
        <div className="container reveal">
          <h2>Book a Demo Call Today</h2>
          <LazyCalendly url="https://calendly.com/inboxnavigator/demo" />
        </div>
      </section>

      {/* ── 16. MARQUEE BAR ── */}
      <div className="marquee-bar">
        <div className="marquee-bar-track">
          <span>Built for Lead Gen Agency Owners</span>
          <span>Golden Standard of Deliverability</span>
          <span>Better than your Current Provider/Reseller</span>
          <span>Built for Lead Gen Agency Owners</span>
          <span>Golden Standard of Deliverability</span>
          <span>Better than your Current Provider/Reseller</span>
        </div>
      </div>

      {/* ── 17. FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>InboxNavigator</h4>
              <p>
                Minted Ventures Labs LLC
                <br />
                80 N Gould Street
                <br />
                Sheridan, Wyoming 82801, USA
              </p>
            </div>
            <div className="footer-col">
              <h4>Pages</h4>
              <Link href="/">Home</Link>
              <Link href="/dfy">Done-For-You</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="#demo">Contact</Link>
            </div>
            <div className="footer-col">
              <h4>Help</h4>
              <Link href="#demo">Contact</Link>
              <Link href="#faq">FAQ</Link>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/cookies">Cookies</Link>
              <Link href="/refund">Return &amp; Refund Policy</Link>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2026 InboxNavigator. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ── Post-body Scripts ── */}
      <Script
        src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=W7Svnv"
        strategy="lazyOnload"
      />
      <Script id="referralstack-stripe" strategy="lazyOnload">
        {`(function(){let timeoutId;const check=()=>{const referralCode=window.ReferralStack?.getReferral();const eventId=window.ReferralStack?.getReferralAndEventId()?.eventId;if(eventId){document.querySelectorAll('a[href*="buy.stripe.com"]').forEach((link)=>{const url=new URL(link.href);url.searchParams.set('client_reference_id',encodeURIComponent(referralCode));link.href=url;});}else{timeoutId=setTimeout(check,1000);}};setTimeout(()=>{clearTimeout(timeoutId);},10000);if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',check);}else{check();}})();`}
      </Script>
    </>
  );
}
