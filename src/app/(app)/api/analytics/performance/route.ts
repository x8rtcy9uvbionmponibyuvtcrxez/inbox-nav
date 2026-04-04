import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json();
    
    // Performance metrics received (in production, send to analytics service)

    // Here you could send to external services like:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics database
    // - DataDog
    // - New Relic

    // Optional forwarding to external endpoint if configured
    const forwardUrl = process.env.ANALYTICS_FORWARD_URL;
    if (forwardUrl) {
      // Fire-and-forget with short timeout to avoid delaying responses
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        // Use fetch; do not await strictly for completion after timeout guard
        await fetch(forwardUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ts: Date.now(),
            source: 'inbox-nav/performance',
            metrics,
          }),
          signal: controller.signal,
        });
      } catch (e) {
        // Swallow errors; do not fail the API on forwarding issues
        if (process.env.ANALYTICS_LOG === 'true') {
          console.warn('Analytics forwarding failed:', e);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } else if (process.env.ANALYTICS_LOG === 'true') {
      console.log('Performance metrics:', metrics);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    );
  }
}
