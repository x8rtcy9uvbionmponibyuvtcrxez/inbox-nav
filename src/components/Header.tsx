"use client";

import { SignInButton, SignUpButton, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-end gap-3 border-b border-white/10 bg-[rgba(3,6,22,0.78)] px-6 backdrop-blur-xl">
      <SignedOut>
        <div className="flex items-center gap-3">
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
    </header>
  );
}
