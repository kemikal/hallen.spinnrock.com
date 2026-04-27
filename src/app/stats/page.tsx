export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { getDb } from '@/lib/mongodb'
import LoginForm from './LoginForm'
import EmailCopy from './EmailCopy'

interface BarItem { key: string; label: string; count: number }

const LABELS = {
  respondentType: { ungdom: 'Ungdom', vuxen: 'Vuxen', foralder: 'Förälder/vårdnadshavare', annat: 'Annat' },
  membershipInterest: {
    supersaker: 'Supersäker på att bli medlem',
    troligen: 'Skulle troligen bli medlem',
    kanske: 'Kanske, om det blir bra',
    nyfiken: 'Nyfiken men osäker',
    inte: 'Tror inte att jag blir medlem',
  },
  activities: {
    gym: 'Gym/styrketräning', klattring: 'Klättring', lek: 'Lek/rörelse för barn',
    parkour: 'Parkour', crossfit: 'Crossfit/funktionell träning', skejt: 'Skejt',
    rorlighet: 'Rörlighet/yoga/stretch', annat: 'Annat',
  },
  monthlyPrice: { '400': '400 kr', '300': '300 kr', '200': '200 kr', '100': '100 kr', 'avgörande': 'Priset avgörande', 'vet_inte': 'Vet inte' },
  householdInterest: { barn: 'Ja, barn/ungdomar', vuxna: 'Ja, vuxna', bada: 'Ja, båda', nej: 'Nej', vet_inte: 'Vet inte' },
  wantToHelp: { ja: 'Ja, gärna', kanske: 'Kanske, kontakta mig', inte_nu: 'Inte just nu' },
}

const ORDER: Record<keyof typeof LABELS, string[]> = {
  respondentType: ['ungdom', 'vuxen', 'foralder', 'annat'],
  membershipInterest: ['supersaker', 'troligen', 'kanske', 'nyfiken', 'inte'],
  activities: ['gym', 'klattring', 'lek', 'parkour', 'crossfit', 'skejt', 'rorlighet', 'annat'],
  monthlyPrice: ['400', '300', '200', '100', 'avgörande', 'vet_inte'],
  householdInterest: ['barn', 'vuxna', 'bada', 'nej', 'vet_inte'],
  wantToHelp: ['ja', 'kanske', 'inte_nu'],
}

type AggRow = { _id: string; count: number }

function toItems(agg: AggRow[], field: keyof typeof LABELS): BarItem[] {
  const map = Object.fromEntries(agg.map(r => [r._id, r.count]))
  return ORDER[field].map(key => ({
    key,
    label: (LABELS[field] as Record<string, string>)[key] ?? key,
    count: map[key] ?? 0,
  }))
}

function BarChart({ items, total }: { items: BarItem[]; total: number }) {
  if (total === 0) return <p className="text-stone-400 text-sm">Inga svar ännu.</p>
  const max = Math.max(...items.map(i => i.count), 1)
  return (
    <div className="space-y-2.5">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-3">
          <span className="w-48 text-sm text-stone-600 text-right shrink-0 leading-tight">{item.label}</span>
          <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-stone-700 rounded-full transition-all duration-500"
              style={{ width: `${(item.count / max) * 100}%` }}
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
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
  if (!auth || auth !== process.env.STATS_PASSWORD) return <LoginForm />

  const db = await getDb()
  const col = db.collection('submissions')

  const [
    total,
    respondentAggRaw,
    membershipAggRaw,
    activityAggRaw,
    priceAggRaw,
    householdAggRaw,
    helpAggRaw,
    likelyMembers,
    contactDocs,
  ] = await Promise.all([
    col.countDocuments(),
    col.aggregate([{ $group: { _id: '$respondentType', count: { $sum: 1 } } }]).toArray(),
    col.aggregate([{ $group: { _id: '$membershipInterest', count: { $sum: 1 } } }]).toArray(),
    col.aggregate([
      { $unwind: { path: '$activities', preserveNullAndEmpty: false } },
      { $group: { _id: '$activities', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    col.aggregate([{ $group: { _id: '$monthlyPrice', count: { $sum: 1 } } }]).toArray(),
    col.aggregate([{ $group: { _id: '$householdInterest', count: { $sum: 1 } } }]).toArray(),
    col.aggregate([{ $group: { _id: '$wantToHelp', count: { $sum: 1 } } }]).toArray(),
    col.countDocuments({ membershipInterest: { $in: ['supersaker', 'troligen'] } }),
    col
      .find(
        { membershipInterest: { $in: ['supersaker', 'troligen'] }, contactInfo: { $ne: '' } },
        { projection: { contactName: 1, contactInfo: 1, membershipInterest: 1 } }
      )
      .sort({ createdAt: -1 })
      .toArray(),
  ])

  const respondentAgg = respondentAggRaw as AggRow[]
  const membershipAgg = membershipAggRaw as AggRow[]
  const activityAgg = activityAggRaw as AggRow[]
  const priceAgg = priceAggRaw as AggRow[]
  const householdAgg = householdAggRaw as AggRow[]
  const helpAgg = helpAggRaw as AggRow[]

  const helpYes = helpAgg.find(r => r._id === 'ja')?.count ?? 0
  const helpMaybe = helpAgg.find(r => r._id === 'kanske')?.count ?? 0
  const contactInfoList = contactDocs.map(d => d.contactInfo as string)

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Statistik – Rum för rörelse</h1>
            <p className="text-stone-500 text-sm mt-0.5">Väveriet / Spinnrock</p>
          </div>
          <div className="bg-stone-800 text-white px-5 py-3 rounded-xl text-center">
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-stone-400 text-xs">svar</div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">{likelyMembers}</div>
            <div className="text-xs text-stone-500 mt-1 leading-tight">troliga/säkra<br />medlemmar</div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">{helpYes + helpMaybe}</div>
            <div className="text-xs text-stone-500 mt-1 leading-tight">vill hjälpa<br />till</div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">{contactDocs.length}</div>
            <div className="text-xs text-stone-500 mt-1 leading-tight">lämnade<br />kontaktinfo</div>
          </div>
        </div>

        <Card title="1. Vem svarar?">
          <BarChart items={toItems(respondentAgg, 'respondentType')} total={total} />
        </Card>

        <Card title="2. Intresse av att bli medlem">
          <BarChart items={toItems(membershipAgg, 'membershipInterest')} total={total} />
        </Card>

        <Card title="3. Önskade aktiviteter">
          <BarChart items={toItems(activityAgg, 'activities')} total={total} />
        </Card>

        <Card title="4. Betalningsvilja per månad">
          <BarChart items={toItems(priceAgg, 'monthlyPrice')} total={total} />
        </Card>

        <Card title="5. Fler i hushållet intresserade?">
          <BarChart items={toItems(householdAgg, 'householdInterest')} total={total} />
        </Card>

        <Card title="6. Vill hjälpa till?">
          <BarChart items={toItems(helpAgg, 'wantToHelp')} total={total} />
        </Card>

        <Card title={`Kontaktinfo – troliga/säkra medlemmar (${contactDocs.length} st)`}>
          {contactDocs.length === 0 ? (
            <p className="text-stone-400 text-sm">Inga lämnade kontaktinfo än.</p>
          ) : (
            <>
              <div className="bg-stone-50 rounded-xl border border-stone-200 divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {contactDocs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm gap-4">
                    <span className="text-stone-800 font-medium shrink-0">{(d.contactName as string) || '–'}</span>
                    <span className="text-stone-500 truncate">{d.contactInfo as string}</span>
                    <span className="text-xs text-stone-400 shrink-0">
                      {d.membershipInterest === 'supersaker' ? 'Supersäker' : 'Troligen'}
                    </span>
                  </div>
                ))}
              </div>
              <EmailCopy emails={contactInfoList} />
            </>
          )}
        </Card>

      </div>
    </main>
  )
}
