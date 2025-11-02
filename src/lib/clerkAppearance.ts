import type { Appearance } from "@clerk/types";

export const clerkCardClassName =
  "w-full overflow-hidden rounded-[24px] border border-white/12 bg-[radial-gradient(circle_at_top,_rgba(31,41,84,0.92)_0%,_rgba(13,19,40,0.88)_60%,_rgba(3,6,22,0.94)_100%)] shadow-[0_40px_88px_-44px_rgba(4,7,20,0.92)] backdrop-blur-xl";

const baseElements = {
  rootBox: "mx-auto w-full",
  card: clerkCardClassName,
  headerTitle: "text-white text-2xl font-semibold mb-1",
  headerSubtitle: "text-white/80 text-sm",
  formButtonPrimary:
    "bg-white text-[#040714] font-semibold tracking-wide rounded-full shadow-[0_14px_44px_-26px_rgba(255,255,255,0.95)] transition-all duration-200 hover:bg-[#f7f8ff] hover:shadow-[0_18px_54px_-24px_rgba(255,255,255,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
  formFieldInput:
    "bg-[rgba(31,41,84,0.32)] border-white/[0.18] text-white placeholder:text-white/55 focus:border-white/45 focus:bg-[rgba(31,41,84,0.5)] rounded-[14px] transition-all duration-200",
  formFieldLabel: "text-white font-medium mb-1 tracking-wide",
  formFieldInputShowPasswordButton: "text-white/85 hover:text-white",
  socialButtonsBlockButton:
    "bg-white/[0.05] border border-white/20 text-white rounded-full transition-all duration-200 hover:bg-white/[0.08] hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
  socialButtonsIconButton:
    "bg-white/[0.05] border border-white/20 rounded-full hover:bg-white/[0.08] transition-all duration-200",
  socialButtonsBlockButtonText: "text-white font-semibold tracking-wide",
  footerActionLink: "text-white hover:text-white/85 underline",
  footerActionText: "text-white/70",
  identityPreviewEditButton: "text-white hover:text-white/85",
  formFieldAction: "text-white hover:text-white/85",
  dividerLine: "bg-white/[0.08]",
  dividerText: "text-white/65 tracking-[0.16em] text-xs font-semibold",
  formHeaderTitle: "text-white",
  formHeaderSubtitle: "text-white/75",
  otpCodeFieldInput:
    "bg-[rgba(31,41,84,0.32)] border-white/[0.18] text-white focus:border-white/45 focus:bg-[rgba(31,41,84,0.5)] rounded-[14px]",
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
