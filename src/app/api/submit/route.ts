import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const INTEREST_LEVELS = ['mycket', 'ganska', 'lite', 'osaker']
const ACTIVITIES = ['yoga', 'pilates', 'dans', 'styrka', 'kampsport', 'rorlighet', 'barn', 'annat']
const VISIT_FREQUENCIES = ['dagligen', 'nagra_ganger', 'en_gang', 'sallan', 'vet_inte']

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltigt format' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  const name = (data.name as string | undefined)?.trim()
  const email = (data.email as string | undefined)?.trim().toLowerCase()
  const interestLevel = data.interestLevel as string | undefined
  const activities = data.activities as string[] | undefined
  const visitFrequency = data.visitFrequency as string | undefined
  const wantContact = Boolean(data.wantContact)
  const wantMembership = Boolean(data.wantMembership)
  const comments = (data.comments as string | undefined)?.trim() || ''

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Namn krävs' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Giltig e-postadress krävs' }, { status: 400 })
  }
  if (!interestLevel || !INTEREST_LEVELS.includes(interestLevel)) {
    return NextResponse.json({ error: 'Välj en intressenivå' }, { status: 400 })
  }
  if (!Array.isArray(activities) || activities.some(a => !ACTIVITIES.includes(a))) {
    return NextResponse.json({ error: 'Ogiltiga aktiviteter' }, { status: 400 })
  }
  if (!visitFrequency || !VISIT_FREQUENCIES.includes(visitFrequency)) {
    return NextResponse.json({ error: 'Välj en besöksfrekvens' }, { status: 400 })
  }

  try {
    const db = await getDb()
    await db.collection('submissions').insertOne({
      name,
      email,
      interestLevel,
      activities,
      visitFrequency,
      wantContact,
      wantMembership,
      comments,
      createdAt: new Date(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Databasfel, försök igen' }, { status: 500 })
  }
}
