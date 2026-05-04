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
  const col = db.collection('submissions')

  const [total, respondentAgg, membershipAgg, activityAgg, priceAgg, householdAgg, helpAgg, wantContactCount] =
    await Promise.all([
      col.countDocuments(),
      col.aggregate([{ $group: { _id: '$respondentType', count: { $sum: 1 } } }]).toArray(),
      col.aggregate([{ $group: { _id: '$membershipInterest', count: { $sum: 1 } } }]).toArray(),
      col
        .aggregate([
          { $unwind: { path: '$activities', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$activities', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      col.aggregate([{ $group: { _id: '$monthlyPrice', count: { $sum: 1 } } }]).toArray(),
      col.aggregate([{ $group: { _id: '$householdInterest', count: { $sum: 1 } } }]).toArray(),
      col.aggregate([{ $group: { _id: '$wantToHelp', count: { $sum: 1 } } }]).toArray(),
      col.countDocuments({ wantToHelp: 'ja' }),
    ])

  return NextResponse.json({ total, respondentAgg, membershipAgg, activityAgg, priceAgg, householdAgg, helpAgg, wantContactCount })
}
