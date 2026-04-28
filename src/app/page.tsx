'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const RESPONDENT_TYPES = [
  { key: 'ungdom', label: 'Ungdom' },
  { key: 'vuxen', label: 'Vuxen' },
  { key: 'foralder', label: 'Förälder/vårdnadshavare' },
  { key: 'annat', label: 'Annat' },
]

const MEMBERSHIP_INTERESTS = [
  { key: 'supersaker', label: 'Jag är supersäker på att jag skulle bli medlem' },
  { key: 'troligen', label: 'Jag skulle troligen bli medlem' },
  { key: 'kanske', label: 'Jag kanske skulle bli medlem, om det blir bra' },
  { key: 'nyfiken', label: 'Jag är nyfiken men osäker' },
  { key: 'inte', label: 'Jag tror inte att jag skulle bli medlem' },
]

const ACTIVITIES = [
  { key: 'gym', label: 'Gym/styrketräning' },
  { key: 'klattring', label: 'Klättring' },
  { key: 'lek', label: 'Lek/rörelse för barn' },
  { key: 'parkour', label: 'Parkour' },
  { key: 'crossfit', label: 'Crossfit/funktionell träning' },
  { key: 'skejt', label: 'Skejt' },
  { key: 'rorlighet', label: 'Rörlighet/yoga/stretch' },
  { key: 'annat', label: 'Annat' },
]

const MONTHLY_PRICES = [
  { key: '400', label: '400 kr' },
  { key: '300', label: '300 kr' },
  { key: '200', label: '200 kr' },
  { key: '100', label: '100 kr' },
  { key: 'avgörande', label: 'Jag är intresserad, men priset är avgörande' },
  { key: 'vet_inte', label: 'Jag vet inte' },
]

const HOUSEHOLD_INTERESTS = [
  { key: 'barn', label: 'Ja, barn/ungdomar' },
  { key: 'vuxna', label: 'Ja, vuxna' },
  { key: 'bada', label: 'Ja, både barn/ungdomar och vuxna' },
  { key: 'nej', label: 'Nej' },
  { key: 'vet_inte', label: 'Vet inte' },
]

const WANT_TO_HELP = [
  { key: 'ja', label: 'Ja, gärna' },
  { key: 'kanske', label: 'Kanske, kontakta mig' },
  { key: 'inte_nu', label: 'Inte just nu' },
]

function BakgrundModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition text-2xl leading-none"
          aria-label="Stäng"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Bakgrund till projektet</h2>
        <div className="text-stone-600 text-sm leading-relaxed space-y-4">
          <p>Under våren 2026 genomfördes en förstudie finansierad av Leader Sjuhärad för att undersöka förutsättningarna för en kombinerad klätter- &amp; skejthall i Väveriet. Slutsatsen drogs att en sådan kombo blev svår att genomföra som man hade tänkt sig men att intresse verkade finnas för en lokal med utrymme för blandad fysisk aktivitet för stora som små – en sorts "rörelserum".</p>
          <p>Bifogade bilder är skissförslag från arkitekten Moa Rundlöf som var inkopplad i förstudien. Moa har även ritat Bröt och Uddebo Lerverkstad och är väl insatt i Väveriets lokaler och vision.</p>
          <p>Söndag 26 april hölls ett öppet möte i Väveriet där förstudien och skissförslaget presenterades samt idéer på hur en sådan här lokal skulle kunna drivas och finansiera sin hyra. Olika idéer på justeringar av skissförslaget dök också upp.</p>
          <p>Nu är förstudiens planerade träffar slut men för att fånga upp tankarna beslutades att ett sådant här intresseformulär skickas ut.</p>
          <p className="font-medium text-stone-800">Finns det ett nog stort intresse så kanske detta är något att ta vidare!</p>
        </div>
      </div>
    </div>
  )
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: { key: string; label: string }[]
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div className="space-y-2">
      {options.map(({ key, label }) => (
        <label key={key} className="flex items-start gap-3 cursor-pointer group">
          <input
            type="radio"
            name={name}
            value={key}
            checked={value === key}
            onChange={() => onChange(key)}
            className="w-4 h-4 mt-0.5 shrink-0 text-stone-800 border-stone-400 focus:ring-stone-700 cursor-pointer"
          />
          <span className="text-stone-700 group-hover:text-stone-900 transition leading-snug">{label}</span>
        </label>
      ))}
    </div>
  )
}

function QuestionLabel({ n, text, required }: { n: number; text: string; required?: boolean }) {
  return (
    <p className="text-sm font-semibold text-stone-800 mb-3">
      <span className="text-stone-400 font-normal mr-1">{n}.</span>
      {text}
      {required && <span className="text-red-500 ml-1">*</span>}
    </p>
  )
}

export default function HomePage() {
  const router = useRouter()

  const [respondentType, setRespondentType] = useState('')
  const [membershipInterest, setMembershipInterest] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [activitiesOther, setActivitiesOther] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [householdInterest, setHouseholdInterest] = useState('')
  const [wantToHelp, setWantToHelp] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [comments, setComments] = useState('')

  const [bakgrundOpen, setBakgrundOpen] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function toggleActivity(key: string) {
    setActivities(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!respondentType) { setError('Besvara fråga 1: Vem svarar du som?'); return }
    if (!membershipInterest) { setError('Besvara fråga 2: Hur intresserad är du?'); return }
    if (!monthlyPrice) { setError('Besvara fråga 4: Vad kan du tänka dig att betala?'); return }
    if (!householdInterest) { setError('Besvara fråga 5: Fler i hushållet?'); return }
    if (!wantToHelp) { setError('Besvara fråga 6: Vill du hjälpa till?'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentType,
          membershipInterest,
          activities,
          activitiesOther: activitiesOther.trim(),
          monthlyPrice,
          householdInterest,
          wantToHelp,
          contactName: contactName.trim(),
          contactInfo: contactInfo.trim(),
          comments: comments.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Något gick fel. Försök igen.')
        return
      }
      router.push('/tack')
    } catch {
      setError('Nätverksfel. Kontrollera din anslutning och försök igen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4">
      {bakgrundOpen && <BakgrundModal onClose={() => setBakgrundOpen(false)} />}
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-stone-800 text-stone-100 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Spinnrock / Väveriet
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">
            Rum för rörelse i Väveriet
          </h1>
          <div className="text-stone-600 text-base leading-relaxed space-y-3">
            <p>Vi undersöker möjligheten att skapa ett gemensamt rum för rörelse i Väveriet – en flexibel hall där både barn, unga och vuxna kan träna, leka och röra sig på olika sätt.</p>
            <p>Tanken är att rummet skulle kunna rymma sådant som gym, klättring, parkour, lek, crossfit, rörlighetsträning, skejt eller andra fysiska aktiviteter – beroende på vad det finns behov av och vad vi tillsammans kan få till.</p>
            <p>För att veta om idén är möjlig behöver vi nu undersöka hur stort intresset är i byn. Skulle du kunna tänka dig att bli medlem och betala en månadsavgift för att få tillgång till ett sådant rum?</p>
            <p>Dina svar hjälper oss att förstå vilket upplägg, vilken prisnivå och vilken typ av verksamhet som skulle kunna fungera.</p>
          </div>
          <button
            onClick={() => setBakgrundOpen(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-stone-700 border border-stone-300 rounded-lg px-4 py-2 hover:bg-stone-100 transition"
          >
            <span>📖</span>
            Bakgrund till projektet – Läs mer!
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-10">

            {/* Q1 */}
            <div>
              <QuestionLabel n={1} text="Jag svarar som:" required />
              <RadioGroup
                name="respondentType"
                options={RESPONDENT_TYPES}
                value={respondentType}
                onChange={setRespondentType}
              />
            </div>

            {/* Q2 */}
            <div>
              <QuestionLabel n={2} text="Hur intresserad är du av att bli medlem?" required />
              <RadioGroup
                name="membershipInterest"
                options={MEMBERSHIP_INTERESTS}
                value={membershipInterest}
                onChange={setMembershipInterest}
              />
            </div>

            {/* Q3 */}
            <div>
              <QuestionLabel n={3} text="Vad skulle du främst vilja använda rummet till?" />
              <p className="text-xs text-stone-500 mb-3">Välj alla som stämmer</p>
              <div className="space-y-2">
                {ACTIVITIES.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activities.includes(key)}
                      onChange={() => toggleActivity(key)}
                      className="w-4 h-4 rounded text-stone-800 border-stone-400 focus:ring-stone-700 cursor-pointer"
                    />
                    <span className="text-stone-700 text-sm group-hover:text-stone-900 transition">{label}</span>
                  </label>
                ))}
              </div>
              {activities.includes('annat') && (
                <input
                  type="text"
                  value={activitiesOther}
                  onChange={e => setActivitiesOther(e.target.value)}
                  placeholder="Beskriv gärna vad..."
                  className="mt-3 w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition text-sm"
                />
              )}
            </div>

            {/* Q4 */}
            <div>
              <QuestionLabel n={4} text="Hur mycket skulle du kunna tänka dig att betala per månad?" required />
              <RadioGroup
                name="monthlyPrice"
                options={MONTHLY_PRICES}
                value={monthlyPrice}
                onChange={setMonthlyPrice}
              />
            </div>

            {/* Q5 */}
            <div>
              <QuestionLabel n={5} text="Skulle fler i ditt hushåll kunna vara intresserade?" required />
              <RadioGroup
                name="householdInterest"
                options={HOUSEHOLD_INTERESTS}
                value={householdInterest}
                onChange={setHouseholdInterest}
              />
            </div>

            {/* Q6 */}
            <div>
              <QuestionLabel n={6} text="Vill du vara med och hjälpa till redan innan rummet finns?" required />
              <p className="text-xs text-stone-500 mb-3">
                Till exempel med att bilda förening, driva frågan ideellt, söka stöd, bygga, planera eller organisera.
              </p>
              <RadioGroup
                name="wantToHelp"
                options={WANT_TO_HELP}
                value={wantToHelp}
                onChange={setWantToHelp}
              />
            </div>

            {/* Q7 */}
            <div className="border border-stone-200 rounded-xl p-5 bg-stone-50 space-y-4">
              <div>
                <p className="text-sm font-semibold text-stone-800 mb-1">
                  <span className="text-stone-400 font-normal mr-1">7.</span>
                  Kontaktuppgifter
                  <span className="text-stone-400 font-normal ml-1.5">(frivilligt)</span>
                </p>
                <p className="text-xs text-stone-500 mb-3">Lämna din kontaktinfo om du vill att vi hör av oss.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Namn</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Ditt namn"
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">E-post eller telefon</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  placeholder="din@epost.se eller 070-000 00 00"
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            {/* Q8 */}
            <div>
              <p className="text-sm font-semibold text-stone-800 mb-1">
                <span className="text-stone-400 font-normal mr-1">8.</span>
                Övriga tankar eller idéer
                <span className="text-stone-400 font-normal ml-1.5">(valfritt)</span>
              </p>
              <p className="text-xs text-stone-500 mb-3">Vad skulle göra att du verkligen ville använda rummet?</p>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={3}
                placeholder="Skriv gärna..."
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition resize-none text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-stone-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-stone-700 active:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition text-base"
            >
              {submitting ? 'Skickar...' : 'Skicka in mitt svar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Dina svar används enbart för att planera verksamheten och delas inte med tredje part.
        </p>
      </div>
    </main>
  )
}
