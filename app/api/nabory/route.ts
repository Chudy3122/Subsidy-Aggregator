import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const region = searchParams.get('region')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    // Filtrowanie po regionie
    if (region && region !== 'all') {
      where.source = {
        region: region,
      }
    }

    // Filtrowanie po statusie
    if (status && status !== 'all') {
      where.status = status
    }

    // Wyszukiwanie full-text
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [nabory, total] = await Promise.all([
      prisma.nabor.findMany({
        where,
        include: {
          source: {
            select: {
              name: true,
              region: true,
              type: true,
            },
          },
        },
        orderBy: {
          scrapedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.nabor.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: nabory,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching nabory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}