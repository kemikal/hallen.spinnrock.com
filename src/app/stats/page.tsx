export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { getDb } from '@/lib/mongodb'
import LoginForm from './LoginForm'
import EmailCopy from './EmailCopy'

interface BarItem {
  key: string
  label: string
  count: number
}

function BarChart({ items, total }: { items: BarItem[]; total: number }) {
  if (items.length === 0) return <p className="text-stone-400 text-sm">Inga svar ännu.</p>

  const max = Math.max(...items.map(i => i.count))

  return (
    <div className="space-y-2.5">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-3">
          <span className="w-44 text-sm text-stone-600 text-right shrink-0 leading-tight">{item.label}</span>
          <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-stone-700 rounded-full transition-all duration-500"
              style={{ width: max > 0 ? `${(item.count / max) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-sm text-stone-500 w-16">
            {item.count} ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="text-base font-semibold text-stone-800 mb-5">{title}</h2>
      {children}
    </section>
  )
}

export default async function StatsPage() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('stats_auth')?.value

  if (!auth || auth !== process.env.STATS_PASSWORD) {
    return <LoginForm />
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
    memberDocs,
  ] = await Promise.all([
    col.countDocuments(),
    col.aggregate([{ $group: { _id: '$interestLevel', count: { $sum: 1 } } }]).toArray(),
    col.aggregate([
      { $unwind: { path: '$activities', preserveNullAndEmpty: false } },
      { $group: { _id: '$activities', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    col.aggregate([{ $group: { _id: '$visitFrequency', count: { $sum: 1 } } }]).toArray(),
    col.countDocuments({ wantContact: true }),
    col.countDocuments({ wantMembership: true }),
    col
      .find({ wantMembership: true }, { projection: { name: 1, email: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray(),
  ])

  const interestOrder = ['mycket', 'ganska', 'lite', 'osaker']
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
  const frequencyOrder = ['dagligen', 'nagra_ganger', 'en_gang', 'sallan', 'vet_inte']
  const frequencyLabels: Record<string, string> = {
    dagligen: 'Dagligen',
    nagra_ganger: 'Några gånger/vecka',
    en_gang: 'En gång/vecka',
    sallan: 'Mer sällan',
    vet_inte: 'Vet inte',
  }

  const interestMap = Object.fromEntries(interestAgg.map(r => [r._id, r.count]))
  const interestItems: BarItem[] = interestOrder.map(key => ({
    key,
    label: interestLabels[key] ?? key,
    count: interestMap[key] ?? 0,
  }))

  const activityItems: BarItem[] = activitiesAgg.map(r => ({
    key: r._id,
    label: activityLabels[r._id] ?? r._id,
    count: r.count,
  }))

  const freqMap = Object.fromEntries(frequencyAgg.map(r => [r._id, r.count]))
  const freqItems: BarItem[] = frequencyOrder.map(key => ({
    key,
    label: frequencyLabels[key] ?? key,
    count: freqMap[key] ?? 0,
  }))

  const memberEmails = memberDocs.map(m => m.email as string)

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Statistik – Hallen</h1>
            <p className="text-stone-500 text-sm mt-0.5">Intresseanmälningar för rörelselokal på Väveriet</p>
          </div>
          <div className="bg-stone-800 text-white text-3xl font-bold px-5 py-3 rounded-xl">
            {total}
            <span className="text-stone-400 text-sm font-normal ml-1">svar</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center">
            <div className="text-3xl font-bold text-stone-800">{memberCount}</div>
            <div className="text-sm text-stone-500 mt-1">vill bli MEDLEMMAR</div>
            <div className="text-xs text-stone-400 mt-0.5">
              ({total > 0 ? Math.round((memberCount / total) * 100) : 0}% av alla)
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center">
            <div className="text-3xl font-bold text-stone-800">{contactCount}</div>
            <div className="text-sm text-stone-500 mt-1">vill bli kontaktade</div>
            <div className="text-xs text-stone-400 mt-0.5">
              ({total > 0 ? Math.round((contactCount / total) * 100) : 0}% av alla)
            </div>
          </div>
        </div>

        {/* Interest level chart */}
        <StatCard title="Intressenivå">
          <BarChart items={interestItems} total={total} />
        </StatCard>

        {/* Activities chart */}
        <StatCard title="Efterfrågade aktiviteter">
          <BarChart items={activityItems} total={total} />
        </StatCard>

        {/* Visit frequency chart */}
        <StatCard title="Besöksfrekvens">
          <BarChart items={freqItems} total={total} />
        </StatCard>

        {/* Member emails */}
        <StatCard title={`Potentiella medlemmar (${memberCount} st)`}>
          {memberDocs.length === 0 ? (
            <p className="text-stone-400 text-sm">Ingen har angett att de vill bli medlem ännu.</p>
          ) : (
            <>
              <div className="bg-stone-50 rounded-xl border border-stone-200 divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {memberDocs.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-stone-800 font-medium">{m.name as string}</span>
                    <span className="text-stone-500">{m.email as string}</span>
                  </div>
                ))}
              </div>
              <EmailCopy emails={memberEmails} />
            </>
          )}
        </StatCard>

      </div>
    </main>
  )
}
