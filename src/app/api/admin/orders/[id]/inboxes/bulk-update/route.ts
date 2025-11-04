import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { protectSecret } from '@/lib/encryption'
import { invalidateCache } from '@/lib/redis'

type CSVRow = {
  existingEmail: string
  newEmail?: string
  firstName?: string
  lastName?: string
  personaName?: string
  password?: string
  status?: string
  tags?: string
  businessName?: string
  forwardingDomain?: string
  espPlatform?: string
}

type UpdateResult = {
  success: number
  warnings: Array<{ email: string; message: string }>
  details: Array<{ email: string; updatedFields: string[] }>
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // 1. Authentication & Authorization
    const userId = await requireAdmin()

    const { rows } = await request.json() as { rows: CSVRow[] }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No rows provided' },
        { status: 400 }
      )
    }

    // 2. Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const result: UpdateResult = {
      success: 0,
      warnings: [],
      details: []
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // 3. Process each row
    for (const row of rows) {
      const existingEmail = row.existingEmail?.trim()

      if (!existingEmail) {
        result.warnings.push({
          email: 'unknown',
          message: 'Missing existingEmail field'
        })
        continue
      }

      // Find the inbox by existing email in this order
      const inbox = await prisma.inbox.findFirst({
        where: {
          orderId: resolvedParams.id,
          email: existingEmail
        }
      })

      if (!inbox) {
        result.warnings.push({
          email: existingEmail,
          message: 'Inbox not found in this order'
        })
        continue
      }

      // Prepare updates
      const inboxUpdates: Record<string, unknown> = {}
      const updatedFields: string[] = []

      // New email
      if (row.newEmail && row.newEmail.trim() !== existingEmail) {
        const newEmail = row.newEmail.trim()

        // Validate email format
        if (!emailRegex.test(newEmail)) {
          result.warnings.push({
            email: existingEmail,
            message: `Invalid email format: ${newEmail}`
          })
          continue
        }

        // Check if email already exists (for a different inbox)
        const emailExists = await prisma.inbox.findFirst({
          where: {
            email: newEmail,
            id: { not: inbox.id }
          }
        })

        if (emailExists) {
          result.warnings.push({
            email: existingEmail,
            message: `Email ${newEmail} already exists for another inbox`
          })
          continue
        }

        inboxUpdates.email = newEmail
        updatedFields.push('email')
      }

      // First name
      if (row.firstName !== undefined) {
        inboxUpdates.firstName = row.firstName.trim() || null
        updatedFields.push('firstName')
      }

      // Last name
      if (row.lastName !== undefined) {
        inboxUpdates.lastName = row.lastName.trim() || null
        updatedFields.push('lastName')
      }

      // Persona name
      if (row.personaName !== undefined) {
        inboxUpdates.personaName = row.personaName.trim() || null
        updatedFields.push('personaName')
      }

      // Password (encrypt if provided and not empty)
      if (row.password && row.password.trim() !== '') {
        inboxUpdates.password = protectSecret(row.password.trim())
        updatedFields.push('password')
      }

      // Status
      if (row.status !== undefined) {
        const status = row.status.trim().toUpperCase()
        const validStatuses = ['PENDING', 'LIVE', 'DELETED', 'CANCELLED']

        if (validStatuses.includes(status)) {
          inboxUpdates.status = status
          updatedFields.push('status')
        } else {
          result.warnings.push({
            email: existingEmail,
            message: `Invalid status: ${row.status}. Must be one of: ${validStatuses.join(', ')}`
          })
          continue
        }
      }

      // Tags (parse comma-separated)
      if (row.tags !== undefined) {
        const tags = row.tags.split(',').map(t => t.trim()).filter(Boolean)
        inboxUpdates.tags = tags
        updatedFields.push('tags')
      }

      // Business name
      if (row.businessName !== undefined) {
        inboxUpdates.businessName = row.businessName.trim() || null
        updatedFields.push('businessName')
      }

      // Forwarding domain
      if (row.forwardingDomain !== undefined) {
        inboxUpdates.forwardingDomain = row.forwardingDomain.trim() || null
        updatedFields.push('forwardingDomain')
      }

      // ESP platform
      if (row.espPlatform !== undefined) {
        inboxUpdates.espPlatform = row.espPlatform.trim() || inbox.espPlatform
        updatedFields.push('espPlatform')
      }

      // Update the inbox if there are changes
      if (Object.keys(inboxUpdates).length > 0) {
        await prisma.inbox.update({
          where: { id: inbox.id },
          data: inboxUpdates
        })

        result.success++
        result.details.push({
          email: existingEmail,
          updatedFields
        })
      } else {
        result.warnings.push({
          email: existingEmail,
          message: 'No fields to update'
        })
      }
    }

    // 4. Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'INBOXES_BULK_UPDATED',
        details: {
          orderId: resolvedParams.id,
          totalRows: rows.length,
          successCount: result.success,
          warningCount: result.warnings.length,
          timestamp: new Date().toISOString(),
        }
      }
    })

    console.log(`[Admin] Bulk inbox update for order ${resolvedParams.id} by ${userId}: ${result.success} success, ${result.warnings.length} warnings`)

    // 5. Invalidate cache
    if (order.clerkUserId) {
      await invalidateCache(`dashboard:${order.clerkUserId}`)
      await invalidateCache(`inboxes:${order.clerkUserId}`)
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${result.success} inbox(es) successfully${result.warnings.length > 0 ? ` with ${result.warnings.length} warning(s)` : ''}`,
      result
    })
  } catch (error) {
    console.error('[Admin] Bulk inbox update failed:', error)

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
      { error: 'Failed to bulk update inboxes' },
      { status: 500 }
    )
  }
}
