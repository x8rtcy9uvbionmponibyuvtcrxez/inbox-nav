import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const domains = await prisma.domain.findMany({
      where: {
        order: {
          clerkUserId: userId,
        },
      },
      include: {
        order: {
          select: {
            id: true,
            productType: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = [
      [
        "domain",
        "status",
        "inbox_count",
        "forwarding_url",
        "tags",
        "business_name",
        "order_id",
        "order_status",
        "product_type",
        "created_at",
      ],
      ...domains.map((domain) => [
        domain.domain,
        domain.status,
        domain.inboxCount,
        domain.forwardingUrl ?? "",
        domain.tags.join(";"),
        domain.businessName ?? "",
        domain.order?.id ?? "",
        domain.order?.status ?? "",
        domain.order?.productType ?? "",
        domain.createdAt.toISOString(),
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="domains.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Domains Export] Failed to generate CSV", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
