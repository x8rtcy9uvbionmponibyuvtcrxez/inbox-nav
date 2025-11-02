"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignIn 
        routing="path" 
        path="/sign-in" 
        signUpUrl="/sign-up"
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
    </div>
  );
}
