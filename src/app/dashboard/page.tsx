import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingCartIcon, UserIcon, InboxIcon, GlobeAltIcon, ClockIcon } from "@heroicons/react/24/outline";

// Removed unused LoadingSkeleton component

export default async function Dashboard() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  // Show loading skeleton while we fetch data
  console.log("🔄 Starting dashboard data fetch...");

  // Retry function for Prisma queries
  const retryQuery = async (queryFn: (prismaClient: typeof prisma) => Promise<unknown>, maxRetries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let tempPrisma = prisma;
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} - Fetching onboarding data for user:`, user.id);
        
        // Create a fresh Prisma client for this attempt
        const { PrismaClient } = await import('@prisma/client');
        tempPrisma = new PrismaClient();
        
        // Explicitly connect and wait for connection to be ready
        await tempPrisma.$connect();
        console.log(`✅ Prisma connected successfully (attempt ${attempt})`);
        
        // Add delay after connection to ensure engine is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`⏳ Waiting for engine to be ready...`);
        
        // Test the connection with a simple query first
        await tempPrisma.$queryRaw`SELECT 1`;
        console.log(`✅ Engine is ready (attempt ${attempt})`);
        
        const result = await queryFn(tempPrisma);
        console.log(`📊 Found onboarding data:`, Array.isArray(result) ? result.length : 'unknown', "records");
        
        // Clean up the temporary client
        await tempPrisma.$disconnect();
        return result;
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        console.error("Full error:", JSON.stringify(error, null, 2));
        console.error("Error type:", typeof error);
        console.error("Error name:", error instanceof Error ? error.name : 'Unknown');
        console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
        console.error("Error stack:", error instanceof Error ? error.stack : undefined);
        
        // Clean up the temporary client on error
        try {
          await tempPrisma.$disconnect();
        } catch (disconnectError) {
          console.error("⚠️ Error disconnecting temp Prisma client:", disconnectError);
        }
        
        if (attempt === maxRetries) {
          console.error(`💥 All ${maxRetries} attempts failed`);
          throw error;
        }
        
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  // Fetch user's onboarding data with retry logic
  let onboardingData: Array<{
    id: string;
    orderId: string;
    clerkUserId: string;
    productType: string | null;
    businessType: string | null;
    website: string | null;
    domainPreferences: unknown;
    personas: unknown;
    espProvider: string | null;
    specialRequirements: string | null;
    stepCompleted: number;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    order: {
      id: string;
      clerkUserId: string;
      productType: string;
      quantity: number;
      totalAmount: number;
      status: string;
      stripeSessionId: string | null;
      stripeCustomerId: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }> = [];
  let fetchError: unknown = null;
  
  try {
    onboardingData = await retryQuery(async (prismaClient) => {
      return await prismaClient.onboardingData.findMany({
        where: {
          clerkUserId: user.id,
        },
        include: {
          order: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }) as typeof onboardingData;
  } catch (error) {
    console.error("❌ All retry attempts failed:", error);
    fetchError = error;
    onboardingData = [];
  }

  if (onboardingData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <InboxIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {fetchError ? "Error Loading Data" : "No orders yet"}
          </h2>
          <p className="text-gray-400 mb-6">
            {fetchError 
              ? "There was an error loading your data. Please try refreshing the page."
              : "Complete the onboarding process to get started with your inbox setup."
            }
          </p>
          {fetchError ? (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-400 text-sm font-medium mb-2">Error Details:</p>
              <p className="text-red-300 text-xs font-mono break-all">
                {fetchError instanceof Error ? fetchError.message : 'Unknown error occurred'}
              </p>
            </div>
          ) : null}
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              Buy Inboxes
            </Link>
            {fetchError ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Refresh Page
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your inbox orders and track fulfillment status.</p>
      </div>

      <div className="grid gap-6">
        {onboardingData.map((data) => (
          <div key={data.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {data.businessType || data.website || "Untitled Order"}
                </h3>
                <p className="text-gray-400 text-sm">
                  Submitted {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <ClockIcon className="h-4 w-4" />
                Pending Fulfillment
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <InboxIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Inboxes</p>
                  <p className="font-medium text-white">{data.order?.quantity || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Personas</p>
                  <p className="font-medium text-white">
                    {Array.isArray(data.personas) ? data.personas.length : 0}
                  </p>
                </div>
              </div>
              
                  <div className="flex items-center gap-3">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Warmup Tool</p>
                      <p className="font-medium text-white">{data.espProvider || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">$</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Amount</p>
                      <p className="font-medium text-white">${data.order?.totalAmount ? (data.order.totalAmount / 100).toFixed(2) : "0.00"}</p>
                    </div>
                  </div>
            </div>

            {data.website && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-1">Primary URL</p>
                <p className="text-white font-mono text-sm break-all">{data.website}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
