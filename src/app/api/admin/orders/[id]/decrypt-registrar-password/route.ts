import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptPassword } from '@/lib/encryption';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Fetch the order with onboarding data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        onboardingData: true,
      },
    });

    if (!order || !order.onboardingData) {
      return NextResponse.json({ error: 'Order or onboarding data not found' }, { status: 404 });
    }

    const encryptedPassword = order.onboardingData.registrarPassword;
    
    if (!encryptedPassword) {
      return NextResponse.json({ error: 'No registrar password found' }, { status: 404 });
    }

    // Decrypt the password
    const decrypted = decryptPassword(encryptedPassword);

    return NextResponse.json({ password: decrypted });
  } catch (error) {
    console.error('Error decrypting registrar password:', error);
    return NextResponse.json(
      { error: 'Failed to decrypt password' },
      { status: 500 }
    );
  }
}

