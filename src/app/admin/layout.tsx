import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const isAdmin = userId ? adminIds.includes(userId) : false;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-6 text-[var(--text-primary)]">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-secondary)] p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">403 - Admins Only</h1>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">You do not have access to the admin dashboard.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-[12px] border border-transparent bg-[var(--bg-white)] px-4 py-2 text-sm font-semibold text-[var(--text-dark)] hover:bg-[#e9e9e9]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Admin Dashboard</h1>
          <div className="flex gap-3 text-sm text-[var(--text-secondary)]">
            <Link href="/admin/orders" className="hover:text-[var(--text-primary)]">
              Orders
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--text-primary)]">
              User dashboard
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

