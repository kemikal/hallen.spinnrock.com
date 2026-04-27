'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ACTIVITIES = [
  { key: 'yoga', label: 'Yoga & meditation' },
  { key: 'pilates', label: 'Pilates' },
  { key: 'dans', label: 'Dans' },
  { key: 'styrka', label: 'Styrketräning' },
  { key: 'kampsport', label: 'Kampsport / boxning' },
  { key: 'rorlighet', label: 'Rörlighet & stretching' },
  { key: 'barn', label: 'Barnaktiviteter' },
  { key: 'annat', label: 'Annat' },
]

const INTEREST_LEVELS = [
  { key: 'mycket', label: 'Mycket intresserad' },
  { key: 'ganska', label: 'Ganska intresserad' },
  { key: 'lite', label: 'Lite intresserad / mest nyfiken' },
  { key: 'osaker', label: 'Vet inte riktigt än' },
]

const VISIT_FREQUENCIES = [
  { key: 'dagligen', label: 'Dagligen' },
  { key: 'nagra_ganger', label: 'Några gånger i veckan' },
  { key: 'en_gang', label: 'En gång i veckan' },
  { key: 'sallan', label: 'Mer sällan' },
  { key: 'vet_inte', label: 'Vet inte' },
]

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interestLevel, setInterestLevel] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [visitFrequency, setVisitFrequency] = useState('')
  const [wantContact, setWantContact] = useState(false)
  const [wantMembership, setWantMembership] = useState(false)
  const [comments, setComments] = useState('')
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

    if (!name.trim() || name.trim().length < 2) {
      setError('Fyll i ditt namn.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ange en giltig e-postadress.')
      return
    }
    if (!interestLevel) {
      setError('Välj din intressenivå.')
      return
    }
    if (!visitFrequency) {
      setError('Välj hur ofta du tror att du skulle besöka.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          interestLevel,
          activities,
          visitFrequency,
          wantContact,
          wantMembership,
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
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block bg-stone-800 text-stone-100 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Spinnrock / Väveriet
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">
            Hallen – ny rörelselokal
          </h1>
          <p className="text-stone-600 text-base leading-relaxed">
            Vi undersöker intresset för att öppna en rörelselokal i Hallen på Väveriet.
            Fyll i formuläret och hjälp oss förstå vad du behöver – det tar bara 2 minuter!
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                Namn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ditt namn"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                E-postadress <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition"
              />
            </div>

            {/* Interest level */}
            <div>
              <p className="text-sm font-semibold text-stone-800 mb-3">
                Hur intresserad är du av en rörelselokal på Väveriet? <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {INTEREST_LEVELS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="interestLevel"
                      value={key}
                      checked={interestLevel === key}
                      onChange={() => setInterestLevel(key)}
                      className="w-4 h-4 text-stone-800 border-stone-400 focus:ring-stone-700 cursor-pointer"
                    />
                    <span className="text-stone-700 group-hover:text-stone-900 transition">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <p className="text-sm font-semibold text-stone-800 mb-1">
                Vilka aktiviteter skulle du vilja se?
              </p>
              <p className="text-xs text-stone-500 mb-3">Välj alla som stämmer</p>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITIES.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
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
            </div>

            {/* Visit frequency */}
            <div>
              <p className="text-sm font-semibold text-stone-800 mb-3">
                Hur ofta tror du att du skulle besöka? <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {VISIT_FREQUENCIES.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="visitFrequency"
                      value={key}
                      checked={visitFrequency === key}
                      onChange={() => setVisitFrequency(key)}
                      className="w-4 h-4 text-stone-800 border-stone-400 focus:ring-stone-700 cursor-pointer"
                    />
                    <span className="text-stone-700 group-hover:text-stone-900 transition">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Membership & contact */}
            <div className="space-y-3 border border-stone-200 rounded-xl p-5 bg-stone-50">
              <p className="text-sm font-semibold text-stone-800 mb-1">Framtida intresse</p>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={wantMembership}
                  onChange={e => setWantMembership(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-stone-800 border-stone-400 focus:ring-stone-700 cursor-pointer"
                />
                <div>
                  <span className="text-stone-800 font-medium text-sm">Ja, jag vill bli MEDLEM i framtiden</span>
                  <p className="text-xs text-stone-500 mt-0.5">Vi kontaktar dig när det är dags att teckna medlemskap</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={wantContact}
                  onChange={e => setWantContact(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-stone-800 border-stone-400 focus:ring-stone-700 cursor-pointer"
                />
                <div>
                  <span className="text-stone-800 font-medium text-sm">Kontakta mig när det finns mer info</span>
                  <p className="text-xs text-stone-500 mt-0.5">Vi håller dig uppdaterad om hur det går</p>
                </div>
              </label>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                Övriga tankar eller önskemål
                <span className="text-stone-400 font-normal ml-1">(valfritt)</span>
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={3}
                placeholder="Berätta gärna mer om vad du drömmer om..."
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit */}
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
          Dina svar används enbart för att planera Hallen och delas inte med tredje part.
        </p>
      </div>
    </main>
  )
}
