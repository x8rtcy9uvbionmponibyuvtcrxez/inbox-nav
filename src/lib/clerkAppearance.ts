import type { Appearance } from "@clerk/types";

export const clerkCardClassName =
  "w-full overflow-hidden rounded-[20px] border border-white/14 bg-[radial-gradient(circle_at_top,_rgba(31,41,84,0.9)_0%,_rgba(13,19,40,0.9)_55%,_rgba(3,6,22,0.95)_100%)] shadow-[0_48px_88px_-44px_rgba(4,7,20,0.88)] backdrop-blur-xl";

const baseElements = {
  rootBox: "mx-auto w-full",
  card: clerkCardClassName,
  headerTitle: "text-white text-2xl font-semibold mb-1",
  headerSubtitle: "text-white/75 text-sm",
  formButtonPrimary:
    "bg-[#fdfdff] text-[#040714] font-semibold tracking-wide rounded-full shadow-[0_16px_48px_-24px_rgba(255,255,255,0.95)] transition-all duration-200 hover:bg-white hover:shadow-[0_18px_56px_-24px_rgba(255,255,255,0.98)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(13,19,40,0.8)]",
  formFieldInput:
    "bg-[rgba(31,41,84,0.32)] border-white/[0.2] text-white placeholder:text-white/55 focus:border-white/45 focus:bg-[rgba(31,41,84,0.5)] rounded-[14px] transition-all duration-200",
  formFieldLabel: "text-white font-medium mb-1 tracking-[0.01em]",
  formFieldInputShowPasswordButton: "text-white/85 hover:text-white",
  socialButtonsBlockButton:
    "bg-[rgba(15,21,44,0.72)] border border-white/18 text-white rounded-full transition-all duration-200 hover:bg-[rgba(18,26,52,0.88)] hover:border-white/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,15,34,0.65)]",
  socialButtonsIconButton:
    "bg-[rgba(15,21,44,0.72)] border border-white/18 rounded-full hover:bg-[rgba(18,26,52,0.88)] transition-all duration-200",
  socialButtonsBlockButtonText: "text-white font-semibold tracking-[0.02em]",
  footerActionLink: "text-white hover:text-white underline",
  footerActionText: "text-white/75",
  identityPreviewEditButton: "text-white hover:text-white",
  formFieldAction: "text-white hover:text-white",
  dividerLine: "bg-white/[0.12]",
  dividerText: "text-white/65 tracking-[0.18em] text-[0.68rem] font-semibold",
  formHeaderTitle: "text-white",
  formHeaderSubtitle: "text-white/75",
  otpCodeFieldInput:
    "bg-[rgba(31,41,84,0.32)] border-white/[0.2] text-white focus:border-white/45 focus:bg-[rgba(31,41,84,0.5)] rounded-[14px]",
  toaster:
    "bg-[rgba(3,6,22,0.96)] text-white border border-white/10 shadow-[0_26px_60px_-30px_rgba(4,7,20,0.9)]",
} satisfies Appearance["elements"];

const baseVariables = {
  colorPrimary: "#FFFFFF",
  colorBackground: "rgba(3, 6, 22, 0.92)",
  colorInputBackground: "rgba(31, 41, 84, 0.32)",
  colorInputText: "rgba(255, 255, 255, 0.96)",
  colorText: "rgba(255, 255, 255, 0.96)",
  colorTextSecondary: "rgba(228, 233, 255, 0.86)",
  colorTextOnPrimaryBackground: "#040714",
  colorDanger: "#FB7185",
  colorShimmer: "rgba(255, 255, 255, 0.18)",
  borderRadius: "24px",
  fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif",
} satisfies Appearance["variables"];

export const clerkDarkAppearance: Appearance = {
  elements: baseElements,
  variables: baseVariables,
};
