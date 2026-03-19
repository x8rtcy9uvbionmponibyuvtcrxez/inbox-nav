"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClerkLoaded, SignUp, useAuth } from "@clerk/nextjs";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,34,42,0.85)_0%,_#060608_65%)] px-4">
        <p className="text-white/70 text-sm">Redirecting to dashboard…</p>
      </div>
    );
  }

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Inbox Navigator
          </h1>
          <p className="text-lg text-white/90">
            Email inbox management platform
          </p>
        </div>

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
