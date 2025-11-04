import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/redis'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; domainId: string }> }
) {
  const resolvedParams = await params;
  try {
    // 1. Authentication & Authorization
    const userId = await requireAdmin()

    const updates = await request.json()

    // 2. Find the domain
    const domain = await prisma.domain.findUnique({
      where: { id: resolvedParams.domainId },
      include: {
        order: true,
      }
    })

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    if (domain.orderId !== resolvedParams.id) {
      return NextResponse.json(
        { error: 'Domain does not belong to this order' },
        { status: 400 }
      )
    }

    // 3. Prepare updates
    const domainUpdates: Record<string, unknown> = {}
    let inboxUpdateCount = 0
    const oldDomainName = domain.domain

    // Domain name (with cascading update to inboxes)
    if (updates.domain !== undefined && updates.domain !== oldDomainName) {
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/
      if (!domainRegex.test(updates.domain)) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        )
      }

      // Check if domain already exists
      const existing = await prisma.domain.findFirst({
        where: {
          domain: updates.domain,
          id: { not: resolvedParams.domainId }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Domain already exists in the system' },
          { status: 400 }
        )
      }

      domainUpdates.domain = updates.domain

      // Cascade update: Update all inboxes that reference this domain
      const inboxUpdateResult = await prisma.inbox.updateMany({
        where: {
          orderId: resolvedParams.id,
          forwardingDomain: oldDomainName
        },
        data: {
          forwardingDomain: updates.domain
        }
      })

      inboxUpdateCount = inboxUpdateResult.count
    }

    // Forwarding URL
    if (updates.forwardingUrl !== undefined) {
      // Validate URL format if provided and not empty
      if (updates.forwardingUrl && updates.forwardingUrl.trim() !== '') {
        try {
          new URL(updates.forwardingUrl)
        } catch {
          return NextResponse.json(
            { error: 'Invalid forwarding URL format' },
            { status: 400 }
          )
        }
      }
      domainUpdates.forwardingUrl = updates.forwardingUrl
    }

    // Business name
    if (updates.businessName !== undefined) {
      domainUpdates.businessName = updates.businessName
    }

    // Status
    if (updates.status !== undefined) {
      const validStatuses = ['PENDING', 'LIVE', 'DELETED', 'CANCELLED']
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      domainUpdates.status = updates.status
    }

    // Tags
    if (updates.tags !== undefined) {
      if (!Array.isArray(updates.tags)) {
        return NextResponse.json(
          { error: 'Tags must be an array' },
          { status: 400 }
        )
      }
      domainUpdates.tags = updates.tags
    }

    // 4. Update database
    const updatedDomain = await prisma.domain.update({
      where: { id: resolvedParams.domainId },
      data: domainUpdates
    })

    // 5. Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'DOMAIN_UPDATED',
        details: {
          domainId: resolvedParams.domainId,
          orderId: resolvedParams.id,
          updatedFields: Object.keys(domainUpdates),
          oldDomain: oldDomainName,
          newDomain: updatedDomain.domain,
          cascadedInboxes: inboxUpdateCount,
          timestamp: new Date().toISOString(),
        }
      }
    })

    console.log(`[Admin] Domain ${resolvedParams.domainId} updated by ${userId}${inboxUpdateCount > 0 ? ` (cascaded to ${inboxUpdateCount} inboxes)` : ''}`)

    // 6. Invalidate cache
    if (domain.order.clerkUserId) {
      await invalidateCache(`dashboard:${domain.order.clerkUserId}`)
      await invalidateCache(`inboxes:${domain.order.clerkUserId}`)
    }

    return NextResponse.json({
      success: true,
      message: inboxUpdateCount > 0
        ? `Domain updated successfully. ${inboxUpdateCount} inbox(es) updated to reference new domain.`
        : 'Domain updated successfully',
      domain: updatedDomain,
      cascadedInboxes: inboxUpdateCount
    })
  } catch (error) {
    console.error('[Admin] Domain update failed:', error)

    // Handle auth/authorization errors
    if (error instanceof Error) {
      if (error.message === 'Authentication required' || error.message === 'Admin access required') {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    )
  }
}
