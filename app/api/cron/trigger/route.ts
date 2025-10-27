import { NextResponse } from 'next/server'
import { triggerManualScraping } from '@/lib/scheduler/cron'

export async function POST() {
  try {
    console.log('🔧 Manual cron trigger requested')

    // Run scraping in background (don't wait)
    triggerManualScraping()

    return NextResponse.json({
      success: true,
      message: 'Scraping started in background',
    })
  } catch (error) {
    console.error('Cron trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger scraping' },
      { status: 500 }
    )
  }
}