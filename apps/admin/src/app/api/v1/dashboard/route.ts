import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.calyviawellness.co.ke/api/v1';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    
    // Proxy directly to live NestJS dashboard metrics endpoint
    const upstreamUrl = `${API_URL}/dashboard/metrics`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    const data = await upstreamRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstreamRes.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error proxying dashboard metrics', error: error?.message },
      { status: 502 }
    );
  }
}
