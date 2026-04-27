import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('stats_auth')?.value
  if (!auth || auth !== process.env.STATS_PASSWORD) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  const db = await getDb()
  const members = await db
    .collection('submissions')
    .find({ wantMembership: true }, { projection: { name: 1, email: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .toArray()

  const rows = [
    'Namn,E-postadress,Datum',
    ...members.map(m => {
      const date = m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : ''
      return `"${m.name}","${m.email}","${date}"`
    }),
  ].join('\n')

  return new NextResponse(rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hallen-potentiella-medlemmar.csv"',
    },
  })
}
