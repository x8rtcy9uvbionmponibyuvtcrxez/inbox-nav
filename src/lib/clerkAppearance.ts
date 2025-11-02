import type { Appearance } from "@clerk/types";

export const clerkCardClassName =
  "w-full overflow-hidden rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,_rgba(28,28,34,0.95)_0%,_rgba(11,11,16,0.98)_100%)] shadow-[0_32px_80px_-42px_rgba(0,0,0,0.72)] backdrop-blur-[20px]";

const baseElements = {
  rootBox: "mx-auto w-full",
  card: clerkCardClassName,
  headerTitle: "text-white text-2xl font-semibold mb-1 tracking-tight",
  headerSubtitle: "text-white/82 text-[0.95rem]",
  formButtonPrimary:
    "bg-white text-[#050508] font-semibold tracking-wide rounded-full shadow-[0_16px_46px_-24px_rgba(255,255,255,0.92)] transition-all duration-200 hover:bg-[#f4f4f7] hover:shadow-[0_20px_58px_-22px_rgba(255,255,255,0.96)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(14,14,18,0.8)]",
  formFieldInput:
    "bg-[rgba(255,255,255,0.05)] border-white/[0.12] text-white placeholder:text-white/55 focus:border-white/35 focus:bg-[rgba(255,255,255,0.08)] rounded-[14px] transition-all duration-200",
  formFieldLabel: "text-white/92 font-medium mb-1 tracking-[0.015em]",
  formFieldInputShowPasswordButton: "text-white/88 hover:text-white",
  socialButtonsBlockButton:
    "bg-[rgba(255,255,255,0.06)] border border-white/14 text-white rounded-full transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)] hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(12,12,16,0.6)]",
  socialButtonsIconButton:
    "bg-[rgba(255,255,255,0.06)] border border-white/14 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200",
  socialButtonsBlockButtonText: "text-white font-semibold tracking-[0.02em]",
  footerActionLink: "text-white hover:text-white underline underline-offset-4",
  footerActionText: "text-white/82",
  footerAction:
    "mt-6 border-t border-white/[0.1] pt-6 text-center text-sm text-white/82",
  identityPreviewEditButton: "text-white hover:text-white/95",
  formFieldAction: "text-white hover:text-white/95",
  dividerLine: "bg-white/[0.14]",
  dividerText: "text-white/62 tracking-[0.18em] text-[0.68rem] font-semibold",
  formHeaderTitle: "text-white",
  formHeaderSubtitle: "text-white/78",
  otpCodeFieldInput:
    "bg-[rgba(255,255,255,0.05)] border-white/[0.12] text-white focus:border-white/35 focus:bg-[rgba(255,255,255,0.08)] rounded-[14px]",
  toaster:
    "bg-[rgba(12,12,16,0.96)] text-white border border-white/12 shadow-[0_26px_60px_-32px_rgba(0,0,0,0.75)]",
} satisfies Appearance["elements"];

const baseVariables = {
  colorPrimary: "#FFFFFF",
  colorBackground: "rgba(9, 9, 13, 0.95)",
  colorInputBackground: "rgba(255, 255, 255, 0.06)",
  colorInputText: "rgba(255, 255, 255, 0.96)",
  colorText: "rgba(255, 255, 255, 0.96)",
  colorTextSecondary: "rgba(224, 228, 240, 0.88)",
  colorTextOnPrimaryBackground: "#040714",
  colorDanger: "#FB7185",
  colorShimmer: "rgba(255, 255, 255, 0.24)",
  borderRadius: "16px",
  fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif",
} satisfies Appearance["variables"];

export const clerkDarkAppearance: Appearance = {
  elements: baseElements,
  variables: baseVariables,
};
