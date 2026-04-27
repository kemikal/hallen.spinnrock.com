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
    .find(
      { membershipInterest: { $in: ['supersaker', 'troligen'] }, contactInfo: { $ne: '' } },
      { projection: { contactName: 1, contactInfo: 1, membershipInterest: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .toArray()

  const interestLabel: Record<string, string> = {
    supersaker: 'Supersäker',
    troligen: 'Troligen',
  }

  const rows = [
    'Namn,Kontakt,Intresse,Datum',
    ...members.map(m => {
      const date = m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : ''
      const interest = interestLabel[m.membershipInterest as string] ?? m.membershipInterest
      return `"${m.contactName || ''}","${m.contactInfo}","${interest}","${date}"`
    }),
  ].join('\n')

  return new NextResponse(rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hallen-intresserade-medlemmar.csv"',
    },
  })
}
