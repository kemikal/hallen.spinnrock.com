import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const RESPONDENT_TYPES = ['ungdom', 'vuxen', 'foralder', 'annat']
const MEMBERSHIP_INTERESTS = ['supersaker', 'troligen', 'kanske', 'nyfiken', 'inte']
const ACTIVITIES = ['gym', 'klattring', 'lek', 'parkour', 'crossfit', 'skejt', 'rorlighet', 'grupptraning', 'annat']
const MONTHLY_PRICES = ['400', '300', '200', '100', 'avgörande', 'vet_inte']
const HOUSEHOLD_INTERESTS = ['barn', 'vuxna', 'bada', 'nej', 'vet_inte']
const WANT_TO_HELP = ['ja', 'kanske', 'inte_nu']
const LOCATIONS = ['uddebo', 'tranemo', 'langre_bort']

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltigt format' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  const respondentType = data.respondentType as string | undefined
  const membershipInterest = data.membershipInterest as string | undefined
  const activities = data.activities as string[] | undefined
  const activitiesOther = (data.activitiesOther as string | undefined)?.trim() || ''
  const monthlyPrice = data.monthlyPrice as string | undefined
  const householdInterest = data.householdInterest as string | undefined
  const wantToHelp = data.wantToHelp as string | undefined
  const location = data.location as string | undefined
  const contactName = (data.contactName as string | undefined)?.trim() || ''
  const contactEmail = (data.contactEmail as string | undefined)?.trim() || ''
  const contactPhone = (data.contactPhone as string | undefined)?.trim() || ''
  const comments = (data.comments as string | undefined)?.trim() || ''

  if (!respondentType || !RESPONDENT_TYPES.includes(respondentType)) {
    return NextResponse.json({ error: 'Besvara fråga 1' }, { status: 400 })
  }
  if (!membershipInterest || !MEMBERSHIP_INTERESTS.includes(membershipInterest)) {
    return NextResponse.json({ error: 'Besvara fråga 2' }, { status: 400 })
  }
  if (!Array.isArray(activities) || activities.some(a => !ACTIVITIES.includes(a))) {
    return NextResponse.json({ error: 'Ogiltiga aktiviteter' }, { status: 400 })
  }
  if (!monthlyPrice || !MONTHLY_PRICES.includes(monthlyPrice)) {
    return NextResponse.json({ error: 'Besvara fråga 4' }, { status: 400 })
  }
  if (!householdInterest || !HOUSEHOLD_INTERESTS.includes(householdInterest)) {
    return NextResponse.json({ error: 'Besvara fråga 5' }, { status: 400 })
  }
  if (!wantToHelp || !WANT_TO_HELP.includes(wantToHelp)) {
    return NextResponse.json({ error: 'Besvara fråga 6' }, { status: 400 })
  }
  if (!location || !LOCATIONS.includes(location)) {
    return NextResponse.json({ error: 'Besvara fråga 7' }, { status: 400 })
  }

  try {
    const db = await getDb()
    await db.collection('submissions').insertOne({
      respondentType,
      membershipInterest,
      activities,
      activitiesOther,
      monthlyPrice,
      householdInterest,
      wantToHelp,
      location,
      contactName,
      contactEmail,
      contactPhone,
      comments,
      createdAt: new Date(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Databasfel, försök igen' }, { status: 500 })
  }
}
