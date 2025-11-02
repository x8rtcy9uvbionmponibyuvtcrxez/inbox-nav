"use client";

import { SignOutButton } from "@clerk/nextjs";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

export default function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <Button
        variant="secondary"
        size="sm"
        className="w-full justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        Sign out
      </Button>
    </SignOutButton>
  );
}

