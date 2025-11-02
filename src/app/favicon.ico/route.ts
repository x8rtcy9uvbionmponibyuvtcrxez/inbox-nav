import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Serve the SVG favicon when favicon.ico is requested
export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), 'public', 'favicon.svg')
    const svgContent = fs.readFileSync(publicPath, 'utf-8')
    
    // Serve as SVG with proper headers - browsers will accept this
    // Use no-cache to prevent stale favicons
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    // Fallback - return 404 to let Next.js handle default favicon
    return new NextResponse(null, { status: 404 })
  }
}
