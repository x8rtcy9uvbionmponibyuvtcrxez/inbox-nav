"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" signInFallbackRedirectUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
