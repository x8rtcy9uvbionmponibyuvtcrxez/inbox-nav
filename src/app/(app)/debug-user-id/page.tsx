import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";

export default async function DebugUserIdPage() {
  const admin = await isAdmin();
  if (!admin) notFound();

  const { userId } = await auth();
  const user = await currentUser();
  const adminIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">User ID Debug Info</h1>

        <div className="rounded-lg border border-white/20 bg-white/5 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-2">Your Clerk User ID:</h2>
            <p className="text-lg font-mono text-white break-all">{userId}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-2">Your Email:</h2>
            <p className="text-lg text-white">{user?.emailAddresses?.[0]?.emailAddress || "No email"}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-2">Configured Admin User IDs:</h2>
            <div className="space-y-2">
              {adminIds.map((id) => (
                <p key={id} className="text-sm font-mono text-white/80 break-all">
                  {id}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
