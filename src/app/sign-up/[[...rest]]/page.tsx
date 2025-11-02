"use client";

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
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
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_60px_-40px_rgba(8,8,8,0.9)] backdrop-blur">
          <ClerkLoading>
            <div className="flex flex-col items-center gap-4 text-white/90">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
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
                  // Main container styling - ensure proper alignment
                  rootBox: 'mx-auto w-full',
                  card: 'bg-transparent shadow-none border-none w-full',
                  
                  // Header text - make it brighter and more readable
                  headerTitle: 'text-white text-2xl font-semibold mb-1',
                  headerSubtitle: 'text-white/80 text-sm',
                  
                  // Form fields - improve contrast and visibility
                  formButtonPrimary: 'bg-white text-black hover:bg-gray-100 font-semibold',
                  formFieldInput: 'bg-white/15 border-white/30 text-white placeholder:text-white/50 focus:border-white/60 focus:bg-white/20',
                  formFieldLabel: 'text-white/95 font-medium',
                  formFieldInputShowPasswordButton: 'text-white/80 hover:text-white',
                  
                  // Social buttons - improve visibility
                  socialButtonsBlockButton: 'bg-white/15 border-white/30 text-white hover:bg-white/25 hover:border-white/40',
                  socialButtonsIconButton: 'bg-white/15 border-white/30 hover:bg-white/25',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  
                  // Links - make them more visible
                  footerActionLink: 'text-white hover:text-white/80 underline',
                  identityPreviewEditButton: 'text-white/90 hover:text-white',
                  formFieldAction: 'text-white/90 hover:text-white',
                  
                  // Divider - make it more visible
                  dividerLine: 'bg-white/20',
                  dividerText: 'text-white/70 font-medium',
                },
                variables: {
                  colorPrimary: '#FFFFFF',
                  colorBackground: '#000000',
                  colorInputBackground: 'rgba(255, 255, 255, 0.15)',
                  colorInputText: '#FFFFFF',
                  colorText: 'rgba(255, 255, 255, 0.98)',
                  colorTextSecondary: 'rgba(255, 255, 255, 0.90)',
                  borderRadius: '0.5rem',
                },
              }}
            />
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}
