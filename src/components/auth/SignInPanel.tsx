"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { clerkCardClassName } from "@/lib/clerkAppearance";

export function SignInPanel() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailPasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded || !signIn) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
        return;
      }

      // If an additional factor is required, Clerk will guide the user.
      if (result.status === "needs_first_factor" && result.firstFactorVerification) {
        setErrorMessage("Additional verification is required. Please check your email or device.");
        return;
      }

      setErrorMessage("Unable to sign in with those credentials. Please try again.");
    } catch (err) {
      const error = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      if (error?.errors?.[0]) {
        const firstError = error.errors[0];
        setErrorMessage(firstError?.longMessage || firstError?.message || "We couldn't sign you in. Please try again.");
      } else {
        setErrorMessage("We couldn't sign you in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in",
        fallbackRedirectUrl: "/dashboard",
      });
    } catch (err) {
      setIsGoogleLoading(false);
      const error = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      if (error?.errors?.[0]) {
        const firstError = error.errors[0];
        setErrorMessage(firstError?.longMessage || firstError?.message || "Google sign-in failed. Please try again.");
      } else {
        setErrorMessage("Google sign-in failed. Please try again.");
      }
    }
  };

  const isSubmitDisabled =
    !isLoaded || isSubmitting || email.trim().length === 0 || password.trim().length === 0;

  return (
    <div className="w-full max-w-md">
      <div className={`${clerkCardClassName} px-8 py-9`}>
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-white">Sign in to Inbox Nav</h2>
          <p className="mt-2 text-sm text-white/70">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!isLoaded || isGoogleLoading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 text-white text-sm font-semibold tracking-wide transition duration-200 hover:bg-white/16 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,10,14,0.65)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="grid h-6 w-6 place-content-center rounded-full bg-white">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  d="M17.64 9.20455c0-.639546-.0573-1.280454-.1818-1.909091H9v3.618181h4.8436c-.2073 1.125-.8436 2.0773-1.7959 2.7136v2.2582h2.9091c1.7045-1.5691 2.6827-3.8818 2.6827-6.68182z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.4719-.8045 5.9627-2.2045l-2.9091-2.2582c-.8046.5409-1.83636.8573-3.0536.8573-2.34455 0-4.33273-1.5827-5.04455-3.7159H.955444v2.3263C2.46736 15.8936 5.52282 18 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.95545 10.6782C3.76818 10.1373 3.65909 9.56182 3.65909 9c0-.56182.10909-1.13727.29636-1.67818V4.99546H.955454C.347727 6.21364 0 7.56818 0 9s.347727 2.7864.955454 4.0045l3.000006-2.3263z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.54545c1.3209 0 2.5036.45455 3.4391 1.34545l2.5773-2.57727C13.4673.875454 11.4273 0 9 0 5.52282 0 2.46736 2.10682.955444 5.00455l3.000006 2.32637C4.66727 5.12818 6.65545 3.54545 9 3.54545z"
                  fill="#EA4335"
                />
              </svg>
            </span>
            {isGoogleLoading ? "Connecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            <span className="h-px flex-1 bg-white/14" />
            or
            <span className="h-px flex-1 bg-white/14" />
          </div>

          <form className="space-y-5" onSubmit={handleEmailPasswordSignIn}>
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="text-sm font-medium text-white/92 tracking-[0.012em]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-[14px] border border-white/12 bg-white/8 px-4 text-sm font-medium text-white placeholder:text-white/55 focus:border-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div className="space-y-2 text-left">
              <label htmlFor="password" className="text-sm font-medium text-white/92 tracking-[0.012em]">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-[14px] border border-white/12 bg-white/8 px-4 text-sm font-medium text-white placeholder:text-white/55 focus:border-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {errorMessage ? (
              <p className="text-sm font-medium text-[#FB7185]">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex h-12 w-full items-center justify-center rounded-full bg-white !text-[#050508] text-sm font-semibold tracking-wide shadow-[0_16px_46px_-24px_rgba(255,255,255,0.92)] transition duration-200 hover:bg-[#f4f4f7] hover:shadow-[0_20px_58px_-22px_rgba(255,255,255,0.96)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(14,14,18,0.8)] disabled:cursor-not-allowed disabled:bg-white disabled:!text-[#050508]/55 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Continue"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-white/82">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/sign-up")}
              className="font-semibold text-white underline underline-offset-4 hover:text-white/90"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
