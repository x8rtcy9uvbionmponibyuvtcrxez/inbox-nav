"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
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
          appearance={{
            elements: {
              // Main container styling
              rootBox: 'mx-auto w-full',
              card: 'bg-transparent shadow-none border-none w-full',
              
              // Header text - white per branding guide
              headerTitle: 'text-white text-2xl font-semibold mb-1',
              headerSubtitle: 'text-white/90 text-sm',
              
              // Form fields - white text on dark backgrounds
              formButtonPrimary: 'bg-white text-black hover:bg-gray-100 font-semibold shadow-sm',
              formFieldInput: 'bg-white/[0.08] border-white/[0.16] text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/[0.12]',
              formFieldLabel: 'text-white font-medium mb-1',
              formFieldInputShowPasswordButton: 'text-white/90 hover:text-white',
              
              // Social buttons - white text
              socialButtonsBlockButton: 'bg-white/[0.08] border-white/[0.16] text-white hover:bg-white/[0.12] hover:border-white/30',
              socialButtonsIconButton: 'bg-white/[0.08] border-white/[0.16] hover:bg-white/[0.12]',
              socialButtonsBlockButtonText: 'text-white font-medium',
              
              // Links and actions - white text
              footerActionLink: 'text-white hover:text-white/80 underline',
              footerActionText: 'text-white/80',
              identityPreviewEditButton: 'text-white hover:text-white/80',
              formFieldAction: 'text-white hover:text-white/80',
              
              // Divider - subtle white
              dividerLine: 'bg-white/[0.08]',
              dividerText: 'text-white/80',
              
              // Other text elements
              formHeaderTitle: 'text-white',
              formHeaderSubtitle: 'text-white/80',
              otpCodeFieldInput: 'bg-white/[0.08] border-white/[0.16] text-white',
            },
            variables: {
              // Primary colors - white on black per branding guide
              colorPrimary: '#FFFFFF',
              colorBackground: '#000000',
              colorInputBackground: 'rgba(255, 255, 255, 0.08)',
              colorInputText: 'rgba(255, 255, 255, 0.96)',
              
              // Text colors - white per branding guide
              colorText: 'rgba(255, 255, 255, 0.96)',
              colorTextSecondary: 'rgba(255, 255, 255, 0.86)',
              colorTextOnPrimaryBackground: 'rgba(255, 255, 255, 0.96)',
              
              // Borders - subtle per branding guide
              colorShimmer: 'rgba(255, 255, 255, 0.08)',
              
              borderRadius: '0.5rem',
            },
          }}
        />
      </div>
    </div>
  );
}
