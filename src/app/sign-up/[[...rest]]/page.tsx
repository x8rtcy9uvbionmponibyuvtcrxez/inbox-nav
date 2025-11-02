"use client";

import { ClerkLoaded, SignUp } from "@clerk/nextjs";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";

export default function SignUpPage() {
  const signUpAppearance = {
    ...clerkDarkAppearance,
    elements: {
      ...clerkDarkAppearance.elements,
      headerSubtitle: "text-white text-sm",
      footerActionText: "text-white",
      footerActionLink: "text-white hover:text-white/90 underline",
    },
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,34,42,0.85)_0%,_#060608_65%)] px-4">
      <div className="w-full max-w-md">
        {/* Header - aligned with sign-up form */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Inbox Navigator
          </h1>
          <p className="text-lg text-white/90">
            Email inbox management platform
          </p>
        </div>
        
        {/* Sign-up form */}
        <ClerkLoaded>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            appearance={signUpAppearance}
          />
        </ClerkLoaded>
      </div>
    </div>
  );
}
