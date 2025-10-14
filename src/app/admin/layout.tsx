import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const isAdmin = userId ? adminIds.includes(userId) : false;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <h1 className="text-xl font-semibold text-white mb-2">403 - Admins Only</h1>
          <p className="text-gray-400 mb-4">You do not have access to the admin dashboard.</p>
          <Link href="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/admin/orders" className="text-gray-300 hover:text-white">Orders</Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white">User Dashboard</Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}


