import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { protectSecret } from '@/lib/encryption'
import { invalidateCache } from '@/lib/redis'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; inboxId: string } }
) {
  try {
    // 1. Authentication
    const { userId } = await auth()
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // 2. Find the inbox
    const inbox = await prisma.inbox.findUnique({
      where: { id: params.inboxId },
      include: { order: true }
    })

    if (!inbox) {
      return NextResponse.json({ error: 'Inbox not found' }, { status: 404 })
    }

    if (inbox.orderId !== params.id) {
      return NextResponse.json(
        { error: 'Inbox does not belong to this order' },
        { status: 400 }
      )
    }

    // 3. Prepare updates
    const inboxUpdates: Record<string, unknown> = {}

    // Email address
    if (updates.email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Check if email already exists (for a different inbox)
      const existing = await prisma.inbox.findFirst({
        where: {
          email: updates.email,
          id: { not: params.inboxId }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Email already exists for another inbox' },
          { status: 400 }
        )
      }

      inboxUpdates.email = updates.email
    }

    // Password (only update if new password provided)
    if (updates.password !== undefined && updates.password !== '') {
      inboxUpdates.password = protectSecret(updates.password)
    }

    // Persona name
    if (updates.personaName !== undefined) {
      inboxUpdates.personaName = updates.personaName
    }

    // First and last name
    if (updates.firstName !== undefined) {
      inboxUpdates.firstName = updates.firstName
    }

    if (updates.lastName !== undefined) {
      inboxUpdates.lastName = updates.lastName
    }

    // ESP Platform
    if (updates.espPlatform !== undefined) {
      inboxUpdates.espPlatform = updates.espPlatform
    }

    // Tags
    if (updates.tags !== undefined) {
      if (!Array.isArray(updates.tags)) {
        return NextResponse.json(
          { error: 'Tags must be an array' },
          { status: 400 }
        )
      }
      inboxUpdates.tags = updates.tags
    }

    // Business name override
    if (updates.businessName !== undefined) {
      inboxUpdates.businessName = updates.businessName
    }

    // Forwarding domain
    if (updates.forwardingDomain !== undefined) {
      inboxUpdates.forwardingDomain = updates.forwardingDomain
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
      inboxUpdates.status = updates.status
    }

    // 4. Update database
    const updatedInbox = await prisma.inbox.update({
      where: { id: params.inboxId },
      data: inboxUpdates
    })

    // 5. Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'INBOX_UPDATED',
        details: {
          inboxId: params.inboxId,
          orderId: params.id,
          updatedFields: Object.keys(inboxUpdates).filter(
            key => !['password'].includes(key) // Don't log sensitive field names
          ),
          oldEmail: inbox.email,
          newEmail: updatedInbox.email,
          timestamp: new Date().toISOString(),
        }
      }
    })

    console.log(`[Admin] Inbox ${params.inboxId} updated by ${userId}`)

    // 6. Invalidate cache
    if (inbox.order.clerkUserId) {
      await invalidateCache(`dashboard:${inbox.order.clerkUserId}`)
      await invalidateCache(`inboxes:${inbox.order.clerkUserId}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Inbox updated successfully',
      inbox: updatedInbox
    })
  } catch (error) {
    console.error('[Admin] Inbox update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update inbox' },
      { status: 500 }
    )
  }
}
