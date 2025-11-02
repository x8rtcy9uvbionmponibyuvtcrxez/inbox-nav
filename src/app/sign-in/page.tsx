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
      </div>
    </div>
  );
}
