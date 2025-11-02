"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,34,42,0.85)_0%,_#060608_65%)] px-4">
      <div className="w-full max-w-md">
        {/* Header - aligned with sign-in form */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Inbox Navigator
          </h1>
          <p className="text-lg text-white/90">
            Email inbox management platform
          </p>
        </div>
        
        {/* Sign-in form */}
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={clerkDarkAppearance}
        />
      </div>
    </div>
  );
}
