import { NextRequest, NextResponse } from 'next/server'
import { computeSafeScore } from '@/lib/safe-score'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = computeSafeScore(body)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
