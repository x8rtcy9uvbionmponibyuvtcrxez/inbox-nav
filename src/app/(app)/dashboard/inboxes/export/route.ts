import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const inboxes = await prisma.inbox.findMany({
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

    if (!inboxes.length) {
      return new NextResponse("No inboxes to export", { status: 400 });
    }

    const rows = [
      [
        "email",
        "persona",
        "status",
        "tags",
        "business",
        "forwarding_domain",
        "password",
        "order_id",
        "order_status",
        "product_type",
        "created_at",
      ],
      ...inboxes.map((inbox) => [
        inbox.email,
        [inbox.firstName, inbox.lastName].filter(Boolean).join(' '),
        inbox.status,
        inbox.tags.join(";"),
        inbox.businessName ?? "",
        inbox.forwardingDomain ?? "",
        inbox.password ?? "",
        inbox.order?.id ?? "",
        inbox.order?.status ?? "",
        inbox.order?.productType ?? "",
        inbox.createdAt.toISOString(),
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="inboxes.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Inboxes Export] Failed to generate CSV", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
