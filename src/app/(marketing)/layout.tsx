import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./marketing.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | InboxNavigator",
    default: "InboxNavigator - Scale Your Cold Email Infrastructure",
  },
  description:
    "Set up and scale your cold email infrastructure with automated domain purchasing, DNS configuration, and mailbox provisioning. Go from zero to sending in minutes.",
  other: {
    "color-scheme": "light only",
  },
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      style={{ background: "#ffffff" }}
    >
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
      </head>
      <body className={plusJakartaSans.className}>
        {children}
        <Script id="crisp-chat" strategy="lazyOnload">
          {`window.$crisp=[];window.CRISP_WEBSITE_ID="22ee366c-6548-4af9-bf9d-b89e73001d54";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
        </Script>
      </body>
    </html>
  );
}
