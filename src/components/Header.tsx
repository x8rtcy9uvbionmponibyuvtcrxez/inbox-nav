"use client";

import { SignInButton, SignUpButton, SignedOut, SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import IntercomLauncher from "@/components/IntercomLauncher";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-end gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-6 backdrop-blur-sm">
      <SignedOut>
        <div className="flex items-center gap-4">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="primary" size="sm">
              Sign up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-4">
          <IntercomLauncher>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Support
            </Button>
          </IntercomLauncher>
        </div>
      </SignedIn>
    </header>
  );
}
