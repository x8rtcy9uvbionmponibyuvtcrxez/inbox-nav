import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "InboxNavigator — Scale faster with cost-efficient, reliable inbox infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#fdf5ef",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Soft gradient glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.25), rgba(232,67,147,0.15) 40%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -250,
            left: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.2), rgba(232,67,147,0.1) 40%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top: logo + tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#1e1054",
              letterSpacing: "-0.5px",
            }}
          >
            <span style={{ display: "flex" }}>Inbox</span>
            <span
              style={{
                display: "flex",
                backgroundImage: "linear-gradient(90deg, #e84393, #f97316)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Navigator
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              border: "1.5px solid rgba(30,16,84,0.15)",
              borderRadius: 999,
              fontSize: 18,
              color: "#1e1054",
              fontWeight: 500,
              background: "rgba(255,255,255,0.6)",
            }}
          >
            <span
              style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: 999,
                backgroundImage:
                  "linear-gradient(135deg, #a855f7, #e84393, #f97316)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              NEW
            </span>
            Aged Prewarmed Google Inboxes
          </div>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              fontWeight: 500,
              lineHeight: 1.05,
              color: "#1e1054",
              letterSpacing: "-2px",
              fontFamily: "serif",
            }}
          >
            Scale faster with&nbsp;
            <span
              style={{
                display: "flex",
                backgroundImage: "linear-gradient(90deg, #e84393, #f97316)",
                backgroundClip: "text",
                color: "transparent",
                fontStyle: "italic",
              }}
            >
              cost-efficient, reliable
            </span>
            &nbsp;inbox infrastructure
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 26,
              color: "rgba(30,16,84,0.65)",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            DFY Google Workspace, Outlook, SMTP & prewarmed inboxes. 99% inbox
            placement. Starting at $3/inbox/month.
          </div>
        </div>

        {/* Bottom: stats row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 42,
                fontWeight: 700,
                backgroundImage: "linear-gradient(90deg, #e84393, #f97316)",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-1px",
              }}
            >
              99%
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "rgba(30,16,84,0.6)",
              }}
            >
              Inbox placement
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: 1,
              height: 56,
              background: "rgba(30,16,84,0.15)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 42,
                fontWeight: 700,
                backgroundImage: "linear-gradient(90deg, #e84393, #f97316)",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-1px",
              }}
            >
              $3
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "rgba(30,16,84,0.6)",
              }}
            >
              Per inbox / month
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: 1,
              height: 56,
              background: "rgba(30,16,84,0.15)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 42,
                fontWeight: 700,
                backgroundImage: "linear-gradient(90deg, #e84393, #f97316)",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-1px",
              }}
            >
              Dedicated
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "rgba(30,16,84,0.6)",
              }}
            >
              US IPs included
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
