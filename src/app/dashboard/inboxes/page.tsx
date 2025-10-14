import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import Link from "next/link";
import { InboxIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

// Helper function to create fresh Prisma client
async function withPrismaClient<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    return await operation(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'LIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'DELETED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
}

// Tags component
function TagsDisplay({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) {
    return <span className="text-gray-500 text-sm">No tags</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
        >
          {tag}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="text-gray-400 text-xs">+{tags.length - 3} more</span>
      )}
    </div>
  );
}

// Format date helper
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export default async function InboxesPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your inboxes.</p>
        </div>
      </div>
    );
  }

  let inboxes: Array<{
    id: string;
    email: string;
    personaName: string;
    espPlatform: string;
    status: string;
    tags: string[];
    businessName: string;
    forwardingDomain: string | null;
    createdAt: Date;
    order: {
      id: string;
      productType: string;
      quantity: number;
      status: string;
    };
  }> = [];
  let error: string | null = null;

  try {
    inboxes = await withPrismaClient(async (prisma) => {
      return await prisma.inbox.findMany({
        where: {
          order: {
            clerkUserId: userId
          }
        },
        include: {
          order: {
            select: {
              id: true,
              productType: true,
              quantity: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });
  } catch (err) {
    console.error('Error fetching inboxes:', err);
    error = 'Failed to load inboxes';
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-2">Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Buy Inboxes
          </Link>
        </div>
      </div>
    );
  }

  if (inboxes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <InboxIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">No inboxes yet</h2>
          <p className="text-gray-400 mb-6">
            Your inboxes will appear here after fulfillment. Complete the onboarding process to get started.
          </p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Buy Inboxes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Inboxes</h1>
          <p className="text-gray-400">Manage and monitor your email inboxes</p>
        </div>
        <div className="text-sm text-gray-400">
          {inboxes.length} inbox{inboxes.length !== 1 ? 'es' : ''}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Persona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ESP Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Forwarding Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {inboxes.map((inbox) => (
                <tr key={inbox.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{inbox.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{inbox.personaName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{inbox.espPlatform}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={inbox.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TagsDisplay tags={inbox.tags} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{inbox.businessName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {inbox.forwardingDomain || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatDate(inbox.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/dashboard/orders/${inbox.order.id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                    >
                      {inbox.order.id.slice(0, 8)}...
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
