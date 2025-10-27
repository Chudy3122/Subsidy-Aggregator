import { NextRequest, NextResponse } from 'next/server'
import { scrapeBatch } from '@/lib/cron-helpers'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Batch 1: Sources 0-9 (10 sources)
  return await scrapeBatch(1, 0, 10)
}