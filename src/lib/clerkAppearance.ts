import type { Appearance } from "@clerk/types";

export const clerkCardClassName =
  "w-full rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_25px_60px_-40px_rgba(8,8,8,0.9)]";

const baseElements: Appearance["elements"] = {
  rootBox: "mx-auto w-full",
  card: clerkCardClassName,
  headerTitle: "text-white text-2xl font-semibold mb-1",
  headerSubtitle: "text-white/70 text-sm",
  formButtonPrimary:
    "bg-white text-black hover:bg-gray-100 font-semibold transition shadow-sm",
  formFieldInput:
    "bg-white/[0.08] border-white/[0.16] text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/[0.12]",
  formFieldLabel: "text-white font-medium mb-1",
  formFieldInputShowPasswordButton: "text-white/80 hover:text-white",
  socialButtonsBlockButton:
    "bg-white/[0.08] border-white/[0.16] text-white hover:bg-white/[0.12] hover:border-white/30 transition",
  socialButtonsIconButton:
    "bg-white/[0.08] border-white/[0.16] hover:bg-white/[0.12]",
  socialButtonsBlockButtonText: "text-white font-medium",
  footerActionLink: "text-white hover:text-white/80 underline",
  footerActionText: "text-white/70",
  identityPreviewEditButton: "text-white hover:text-white/80",
  formFieldAction: "text-white hover:text-white/80",
  dividerLine: "bg-white/15",
  dividerText: "text-white/70 tracking-wide uppercase text-xs",
  formHeaderTitle: "text-white",
  formHeaderSubtitle: "text-white/70",
  otpCodeFieldInput:
    "bg-white/[0.08] border-white/[0.16] text-white focus:border-white/40 focus:bg-white/[0.12]",
  toaster: "bg-white text-black rounded-xl shadow-lg",
};

const baseVariables: Appearance["variables"] = {
  colorPrimary: "#FFFFFF",
  colorBackground: "#000000",
  colorInputBackground: "rgba(255, 255, 255, 0.08)",
  colorInputText: "rgba(255, 255, 255, 0.96)",
  colorText: "rgba(255, 255, 255, 0.96)",
  colorTextSecondary: "rgba(255, 255, 255, 0.8)",
  colorTextOnPrimaryBackground: "#000000",
  colorDanger: "#FB7185",
  colorShimmer: "rgba(255, 255, 255, 0.15)",
  borderRadius: "1.5rem",
  fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif",
};

export const clerkDarkAppearance: Appearance = {
  elements: baseElements,
  variables: baseVariables,
};

export const clerkDarkElements = baseElements;
export const clerkDarkVariables = baseVariables;
