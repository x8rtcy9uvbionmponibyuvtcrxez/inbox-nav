import type { Metadata } from "next";
import Link from "next/link";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Page Not Found | InboxNavigator",
  other: {
    "color-scheme": "light only",
  },
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function NotFound() {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable}`}
      style={{ background: "#faf9fe" }}
    >
      <body
        style={{
          fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif",
          backgroundColor: "#faf9fe",
          color: "#1e1054",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 540, width: "100%" }}>
          <div
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', serif",
              fontSize: "1.75rem",
              marginBottom: "3rem",
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                background: "linear-gradient(90deg, #e84393, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Inbox
            </span>
            <span style={{ color: "#1e1054" }}>Navigator</span>
          </div>

          <div
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', serif",
              fontSize: "clamp(6rem, 15vw, 10rem)",
              fontWeight: 400,
              lineHeight: 1,
              background: "linear-gradient(135deg, #a855f7, #e84393, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "1.5rem",
            }}
          >
            404
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', serif",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              color: "#1e1054",
              marginBottom: "1rem",
              lineHeight: 1.3,
              fontWeight: 400,
            }}
          >
            This page wandered off
          </h1>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "#5a5278",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.875rem 2rem",
                borderRadius: 100,
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                border: "none",
                background:
                  "linear-gradient(135deg, #a855f7, #e84393, #f97316)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)",
              }}
            >
              Back to Home
            </Link>
            <a
              href="https://app.inboxnavigator.com/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.875rem 2rem",
                borderRadius: 100,
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                background: "transparent",
                color: "#1e1054",
                border: "2px solid rgba(30, 16, 84, 0.15)",
              }}
            >
              Go to App
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
