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
          <SignUp 
            routing="path" 
            path="/sign-up" 
            signInUrl="/sign-in"
            appearance={{
              elements: {
                // Main container styling
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none border-none',
                
                // Header text
                headerTitle: 'text-white text-2xl font-semibold',
                headerSubtitle: 'text-gray-400',
                
                // Form fields
                formButtonPrimary: 'bg-white text-black hover:bg-gray-100',
                formFieldInput: 'bg-white/10 border-white/20 text-white focus:border-white/40',
                formFieldLabel: 'text-gray-300',
                
                // Social buttons
                socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
                socialButtonsIconButton: 'bg-white/10 border-white/20 hover:bg-white/20',
                
                // Links
                footerActionLink: 'text-blue-400 hover:text-blue-300',
                
                // Divider
                dividerLine: 'bg-white/10',
                dividerText: 'text-gray-400',
              },
              variables: {
                colorPrimary: '#FFFFFF',
                colorBackground: '#000000',
                colorInputBackground: 'rgba(255, 255, 255, 0.1)',
                colorInputText: '#FFFFFF',
                colorText: 'rgba(255, 255, 255, 0.96)',
                colorTextSecondary: 'rgba(228, 233, 255, 0.86)',
              },
            }}
          />
        </ClerkLoaded>
      </div>
    </div>
  );
}
