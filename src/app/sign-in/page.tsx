"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" signInFallbackRedirectUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
