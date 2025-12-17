// HOTS Classification Engine - Temporarily disabled for deployment
// TODO: Fix TypeScript errors and re-enable

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'HOTS Classification Engine temporarily disabled for deployment',
    note: 'Please fix TypeScript errors in src/app/api/adaptive/hots-classifier/route.ts'
  }, { status: 503 })
}