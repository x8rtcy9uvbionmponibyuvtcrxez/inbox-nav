import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const map = (s: string) => {
    const u = s.toUpperCase();
    if (u.includes('FULFILLED')) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (u.includes('PAID')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (u.includes('PENDING')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map(status)}`}>{status}</span>;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams?: Promise<{ status?: string; q?: string }> }) {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!userId || !adminIds.includes(userId)) {
    return (
      <div className="text-center text-red-300">Unauthorized</div>
    );
  }

  const resolvedSearchParams = await searchParams;
  const prisma = new PrismaClient();
  await prisma.$connect();

  const where: Record<string, unknown> = {};
  if (resolvedSearchParams?.status && resolvedSearchParams.status !== 'ALL') where.status = resolvedSearchParams.status;
  // Note: we don't persist customer email; allow searching by clerkUserId for now
  if (resolvedSearchParams?.q) where.clerkUserId = { contains: resolvedSearchParams.q, mode: 'insensitive' };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      onboardingData: true,
    }
  });
  await prisma.$disconnect();

  const currentStatus = resolvedSearchParams?.status || 'ALL';
  const q = resolvedSearchParams?.q || '';

  const buildUrl = (s: string, qv: string) => {
    const params = new URLSearchParams();
    if (s) params.set('status', s);
    if (qv) params.set('q', qv);
    return `/admin/orders?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex items-center gap-2">
          <form method="GET" action="/admin/orders" className="flex items-center gap-2">
            <input
              name="q"
              placeholder="Search by clerkUserId"
              defaultValue={q}
              className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm"
            />
            <input type="hidden" name="status" value={currentStatus} />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-3 py-2 text-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {['ALL','PENDING','PENDING_DOMAIN_PURCHASE','PAID','FULFILLED'].map(s => (
          <Link
            key={s}
            href={buildUrl(s, q)}
            className={`px-3 py-1 rounded-md border ${currentStatus===s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-300'}`}
          >{s}</Link>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800 text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-gray-300">Order</th>
                <th className="px-4 py-2 text-left text-gray-300">Customer</th>
                <th className="px-4 py-2 text-left text-gray-300">Product</th>
                <th className="px-4 py-2 text-left text-gray-300">Qty</th>
                <th className="px-4 py-2 text-left text-gray-300">Status</th>
                <th className="px-4 py-2 text-left text-gray-300">Inboxes</th>
                <th className="px-4 py-2 text-left text-gray-300">Domains</th>
                <th className="px-4 py-2 text-left text-gray-300">Created</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-2 text-gray-200">{o.id.slice(0,8)}...</td>
                  <td className="px-4 py-2 text-gray-300">{o.clerkUserId}</td>
                  <td className="px-4 py-2 text-gray-300">{o.productType}</td>
                  <td className="px-4 py-2 text-gray-300">{o.quantity}</td>
                  <td className="px-4 py-2"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-2 text-gray-300">{(o as { _count?: { inboxes?: number; domains?: number } })._count?.inboxes ?? 0}</td>
                  <td className="px-4 py-2 text-gray-300">{(o as { _count?: { inboxes?: number; domains?: number } })._count?.domains ?? 0}</td>
                  <td className="px-4 py-2 text-gray-400">{new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(o.createdAt))}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-indigo-400 hover:text-indigo-300">View</Link>
                  </td>
                </tr>
              ))}
              {orders.length===0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


