"use client";

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_60px_-40px_rgba(8,8,8,0.9)] backdrop-blur">
        <ClerkLoading>
          <div className="flex flex-col items-center gap-4 text-white/70">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" aria-hidden="true" />
            <p className="text-sm font-medium">Loading sign-up...</p>
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        </ClerkLoaded>
      </div>
    </div>
  );
}
