import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltigt format' }, { status: 400 })
  }

  const { password } = body as { password?: string }
  const correctPassword = process.env.STATS_PASSWORD

  if (!correctPassword || password !== correctPassword) {
    return NextResponse.json({ error: 'Fel lösenord' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('stats_auth', correctPassword, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true })
}
