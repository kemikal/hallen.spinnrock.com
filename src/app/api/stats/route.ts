import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '@/lib/mongodb'

function requireAuth(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const auth = cookieStore.get('stats_auth')?.value
  return auth && auth === process.env.STATS_PASSWORD
}

export async function GET() {
  const cookieStore = await cookies()
  if (!requireAuth(cookieStore)) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  const db = await getDb()
  const col = db.collection('submissions')

  const [
    total,
    interestAgg,
    activitiesAgg,
    frequencyAgg,
    contactCount,
    memberCount,
  ] = await Promise.all([
    col.countDocuments(),
    col.aggregate([{ $group: { _id: '$interestLevel', count: { $sum: 1 } } }]).toArray(),
    col.aggregate([
      { $unwind: '$activities' },
      { $group: { _id: '$activities', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    col.aggregate([{ $group: { _id: '$visitFrequency', count: { $sum: 1 } } }]).toArray(),
    col.countDocuments({ wantContact: true }),
    col.countDocuments({ wantMembership: true }),
  ])

  const interestLabels: Record<string, string> = {
    mycket: 'Mycket intresserad',
    ganska: 'Ganska intresserad',
    lite: 'Lite / mest nyfiken',
    osaker: 'Vet inte än',
  }
  const activityLabels: Record<string, string> = {
    yoga: 'Yoga & meditation',
    pilates: 'Pilates',
    dans: 'Dans',
    styrka: 'Styrketräning',
    kampsport: 'Kampsport / boxning',
    rorlighet: 'Rörlighet & stretching',
    barn: 'Barnaktiviteter',
    annat: 'Annat',
  }
  const frequencyLabels: Record<string, string> = {
    dagligen: 'Dagligen',
    nagra_ganger: 'Några gånger/vecka',
    en_gang: 'En gång/vecka',
    sallan: 'Mer sällan',
    vet_inte: 'Vet inte',
  }

  return NextResponse.json({
    total,
    interestLevels: interestAgg.map(r => ({
      key: r._id,
      label: interestLabels[r._id] ?? r._id,
      count: r.count,
    })),
    activities: activitiesAgg.map(r => ({
      key: r._id,
      label: activityLabels[r._id] ?? r._id,
      count: r.count,
    })),
    visitFrequencies: frequencyAgg.map(r => ({
      key: r._id,
      label: frequencyLabels[r._id] ?? r._id,
      count: r.count,
    })),
    contactCount,
    memberCount,
  })
}
