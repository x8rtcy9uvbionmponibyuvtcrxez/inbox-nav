import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DebugUserIdPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const isAdmin = userId ? adminIds.includes(userId) : false;

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">User ID Debug Info</h1>
        
        <div className="rounded-lg border border-white/20 bg-white/5 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-2">Your Clerk User ID:</h2>
            <p className="text-lg font-mono text-white break-all">{userId || "Not authenticated"}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-2">Your Email:</h2>
            <p className="text-lg text-white">{user?.emailAddresses?.[0]?.emailAddress || "No email"}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-2">Configured Admin User IDs:</h2>
            <div className="space-y-2">
              {adminIds.length > 0 ? (
                adminIds.map((id, index) => (
                  <p key={index} className="text-sm font-mono text-white/80 break-all">
                    {id}
                  </p>
                ))
              ) : (
                <p className="text-sm text-white/60">No admin IDs configured</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-2">Admin Access Status:</h2>
            <p className={`text-lg font-semibold ${isAdmin ? "text-green-400" : "text-red-400"}`}>
              {isAdmin ? "✅ You ARE an admin" : "❌ You are NOT an admin"}
            </p>
          </div>

          <div className="pt-4 border-t border-white/20">
            <h2 className="text-sm font-semibold text-white/60 mb-2">To add yourself as admin:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-white/80">
              <li>Copy your User ID from above</li>
              <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
              <li>Find or create <code className="bg-white/10 px-1 rounded">ADMIN_USER_IDS</code></li>
              <li>Add your user ID (or comma-separate multiple IDs)</li>
              <li>Redeploy the application</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

