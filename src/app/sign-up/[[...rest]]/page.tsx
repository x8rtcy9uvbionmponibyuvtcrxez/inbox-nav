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
                  // Main container styling
                  rootBox: 'mx-auto w-full',
                  card: 'bg-transparent shadow-none border-none w-full',
                  
                  // Header text - white on black (branding: --text-primary)
                  headerTitle: 'text-white text-2xl font-semibold mb-1',
                  headerSubtitle: 'text-white text-sm',
                  
                  // Form fields - white text on dark inputs (branding: --text-primary)
                  formButtonPrimary: 'bg-white text-black hover:bg-gray-100 font-semibold',
                  formFieldInput: 'bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/15',
                  formFieldLabel: 'text-white font-medium',
                  formFieldInputShowPasswordButton: 'text-white hover:text-white',
                  
                  // Social buttons - white text (branding: --text-secondary)
                  socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30',
                  socialButtonsIconButton: 'bg-white/10 border-white/20 hover:bg-white/20',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  
                  // Links - white text (branding: --text-secondary)
                  footerActionLink: 'text-white hover:text-white/90 underline',
                  identityPreviewEditButton: 'text-white hover:text-white',
                  formFieldAction: 'text-white hover:text-white',
                  
                  // Divider - white (branding: --text-muted)
                  dividerLine: 'bg-white/20',
                  dividerText: 'text-white font-medium',
                  
                  // Footer text - white
                  footerActionText: 'text-white',
                },
                variables: {
                  // Branding guide colors
                  colorPrimary: '#FFFFFF', // --accent-primary
                  colorBackground: '#000000',
                  colorInputBackground: 'rgba(255, 255, 255, 0.1)',
                  colorInputText: 'rgba(255, 255, 255, 0.96)', // --text-primary
                  colorText: 'rgba(255, 255, 255, 0.96)', // --text-primary
                  colorTextSecondary: 'rgba(228, 233, 255, 0.86)', // --text-secondary
                  colorDanger: '#FB7185', // --danger
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
