import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import DashboardNav from "@/components/DashboardNav";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/Button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "User";

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <aside className="flex w-72 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="border-b border-[var(--border-subtle)] px-6 py-6">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">{userEmail}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6">
          <Button
            asChild
            variant="primary"
            size="sm"
            className="w-full justify-center gap-2"
          >
            <Link href="/dashboard/products">
              <ShoppingCartIcon className="h-5 w-5" />
              Create Inboxes
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex-1">
          <DashboardNav />
        </div>

        <div className="border-t border-[var(--border-subtle)] px-6 py-6 space-y-4">
          <LogoutButton />
          <p className="text-xs text-[var(--text-muted)] text-center" suppressHydrationWarning>
            © {new Date().getFullYear()} Inbox Navigator
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
        <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
