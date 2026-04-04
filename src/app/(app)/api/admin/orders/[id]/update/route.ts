import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { protectSecret } from '@/lib/encryption'
import { invalidateCache } from '@/lib/redis'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // 1. Authentication & Authorization
    const userId = await requireAdmin()

    const updates = await request.json()

    // 2. Validate - don't allow risky fields that affect billing
    const forbiddenFields = ['quantity', 'productType', 'totalAmount', 'domainSource', 'status']
    const attemptedForbiddenFields = forbiddenFields.filter(field => field in updates)

    if (attemptedForbiddenFields.length > 0) {
      return NextResponse.json(
        { error: `Cannot edit the following fields: ${attemptedForbiddenFields.join(', ')}` },
        { status: 400 }
      )
    }

    // 3. Find the order and its onboarding data
    const order = await prisma.order.findUnique({
      where: { id: resolvedParams.id },
      include: { onboardingData: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.onboardingData) {
      return NextResponse.json({ error: 'Order has no onboarding data' }, { status: 404 })
    }

    // 4. Prepare updates (encrypt sensitive fields)
    const onboardingUpdates: Record<string, unknown> = {}

    // Business information
    if (updates.businessName !== undefined) {
      onboardingUpdates.businessType = updates.businessName
    }

    if (updates.website !== undefined) {
      // Validate URL format if provided
      if (updates.website && updates.website.trim() !== '') {
        try {
          new URL(updates.website)
        } catch {
          return NextResponse.json(
            { error: 'Invalid website URL format' },
            { status: 400 }
          )
        }
      }
      onboardingUpdates.website = updates.website
    }

    if (updates.specialRequirements !== undefined) {
      onboardingUpdates.specialRequirements = updates.specialRequirements
    }

    if (updates.espProvider !== undefined) {
      onboardingUpdates.espProvider = updates.espProvider
    }

    // Personas
    if (updates.personas !== undefined) {
      // Validate personas structure
      if (!Array.isArray(updates.personas)) {
        return NextResponse.json(
          { error: 'Personas must be an array' },
          { status: 400 }
        )
      }

      // Validate each persona has firstName and lastName
      for (let i = 0; i < updates.personas.length; i++) {
        const persona = updates.personas[i]
        if (!persona.firstName || !persona.lastName) {
          return NextResponse.json(
            { error: `Persona ${i + 1} must have firstName and lastName` },
            { status: 400 }
          )
        }
      }

      onboardingUpdates.personas = updates.personas
    }

    // ESP Credentials (stored in domainPreferences JSON)
    if (updates.espCredentials !== undefined) {
      const currentPrefs = (order.onboardingData.domainPreferences as Record<string, unknown>) || {}
      const currentEspCreds = (currentPrefs.espCredentials as { accountId?: string; password?: string; apiKey?: string } | undefined) || {}

      onboardingUpdates.domainPreferences = {
        ...currentPrefs,
        espCredentials: {
          accountId: updates.espCredentials.accountId !== undefined
            ? updates.espCredentials.accountId
            : currentEspCreds.accountId,
          password: updates.espCredentials.password && updates.espCredentials.password !== ''
            ? protectSecret(updates.espCredentials.password)
            : currentEspCreds.password,
          apiKey: updates.espCredentials.apiKey && updates.espCredentials.apiKey !== ''
            ? protectSecret(updates.espCredentials.apiKey)
            : currentEspCreds.apiKey,
        }
      }
    }

    // Registrar credentials
    if (updates.domainRegistrar !== undefined) {
      onboardingUpdates.domainRegistrar = updates.domainRegistrar
    }

    if (updates.registrarUsername !== undefined) {
      onboardingUpdates.registrarUsername = updates.registrarUsername
    }

    // Only update password if a new one is provided
    if (updates.registrarPassword !== undefined && updates.registrarPassword !== '') {
      onboardingUpdates.registrarPassword = protectSecret(updates.registrarPassword)
    }

    // 5. Update database
    await prisma.onboardingData.update({
      where: { id: order.onboardingData.id },
      data: onboardingUpdates
    })

    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'ORDER_UPDATED',
        details: {
          orderId: resolvedParams.id,
          updatedFields: Object.keys(onboardingUpdates).filter(
            key => !['registrarPassword'].includes(key) // Don't log sensitive field names
          ),
          timestamp: new Date().toISOString(),
        }
      }
    })

    console.log(`[Admin] Order ${resolvedParams.id} updated by ${userId}`)

    // 7. Invalidate cache
    if (order.clerkUserId) {
      await invalidateCache(`dashboard:${order.clerkUserId}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Order details updated successfully'
    })
  } catch (error) {
    console.error('[Admin] Order update failed:', error)

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
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
