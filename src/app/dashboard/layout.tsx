import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import DashboardNav from "@/components/DashboardNav";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070707] via-[#0a0a0a] to-black text-white flex">
      <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col">
        <div className="px-6 pt-6 pb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-white/50">Inbox Navigator</p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6">
          <Button asChild variant="secondary" className="w-full gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-white hover:bg-white/20">
            <Link href="/dashboard/products">
              <ShoppingCartIcon className="h-5 w-5" />
              Create Inboxes
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex-1">
          <DashboardNav />
        </div>

        <div className="px-6 py-6 border-t border-white/5 text-xs text-white/40">
          © {new Date().getFullYear()} Inbox Navigator
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-4 pb-10">{children}</div>
      </main>
    </div>
  );
}
