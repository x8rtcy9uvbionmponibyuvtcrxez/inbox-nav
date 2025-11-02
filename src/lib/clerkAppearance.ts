import type { Appearance } from "@clerk/types";

export const clerkCardClassName =
  "w-full overflow-hidden rounded-[18px] border border-white/12 bg-[radial-gradient(circle_at_top,_rgba(32,33,41,0.9)_0%,_rgba(18,19,26,0.94)_55%,_rgba(8,8,12,0.96)_100%)] shadow-[0_40px_80px_-42px_rgba(0,0,0,0.75)] backdrop-blur-[22px]";

const baseElements = {
  rootBox: "mx-auto w-full",
  card: clerkCardClassName,
  headerTitle: "text-white text-2xl font-semibold mb-1 tracking-tight",
  headerSubtitle: "text-white/80 text-sm",
  formButtonPrimary:
    "bg-white text-[#050508] font-semibold tracking-wide rounded-full shadow-[0_14px_40px_-24px_rgba(255,255,255,0.9)] transition-all duration-200 hover:bg-[#f5f5f8] hover:shadow-[0_18px_52px_-22px_rgba(255,255,255,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(16,16,20,0.7)]",
  formFieldInput:
    "bg-[rgba(40,41,50,0.35)] border-white/[0.14] text-white placeholder:text-white/55 focus:border-white/40 focus:bg-[rgba(44,45,58,0.55)] rounded-[14px] transition-all duration-200",
  formFieldLabel: "text-white font-medium mb-1 tracking-[0.012em]",
  formFieldInputShowPasswordButton: "text-white/90 hover:text-white",
  socialButtonsBlockButton:
    "bg-[rgba(32,33,41,0.55)] border border-white/14 text-white rounded-full transition-all duration-200 hover:bg-[rgba(38,39,48,0.7)] hover:border-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(15,15,23,0.7)]",
  socialButtonsIconButton:
    "bg-[rgba(32,33,41,0.55)] border border-white/14 rounded-full hover:bg-[rgba(38,39,48,0.7)] transition-all duration-200",
  socialButtonsBlockButtonText: "text-white font-semibold tracking-[0.025em]",
  footerActionLink: "text-white hover:text-white underline underline-offset-4",
  footerActionText: "text-white/80",
  identityPreviewEditButton: "text-white hover:text-white/95",
  formFieldAction: "text-white hover:text-white/95",
  dividerLine: "bg-white/[0.16]",
  dividerText: "text-white/60 tracking-[0.22em] text-[0.7rem] font-semibold",
  formHeaderTitle: "text-white",
  formHeaderSubtitle: "text-white/78",
  otpCodeFieldInput:
    "bg-[rgba(40,41,50,0.35)] border-white/[0.14] text-white focus:border-white/40 focus:bg-[rgba(44,45,58,0.55)] rounded-[14px]",
  toaster:
    "bg-[rgba(10,11,16,0.96)] text-white border border-white/12 shadow-[0_26px_60px_-32px_rgba(0,0,0,0.75)]",
} satisfies Appearance["elements"];

const baseVariables = {
  colorPrimary: "#FFFFFF",
  colorBackground: "rgba(9, 9, 13, 0.94)",
  colorInputBackground: "rgba(40, 41, 50, 0.35)",
  colorInputText: "rgba(255, 255, 255, 0.96)",
  colorText: "rgba(255, 255, 255, 0.96)",
  colorTextSecondary: "rgba(224, 228, 240, 0.86)",
  colorTextOnPrimaryBackground: "#040714",
  colorDanger: "#FB7185",
  colorShimmer: "rgba(255, 255, 255, 0.2)",
  borderRadius: "18px",
  fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif",
} satisfies Appearance["variables"];

export const clerkDarkAppearance: Appearance = {
  elements: baseElements,
  variables: baseVariables,
};
