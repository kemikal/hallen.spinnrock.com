'use client'

import { useState } from 'react'

interface Props {
  emails: string[]
}

export default function EmailCopy({ emails }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyEmails() {
    await navigator.clipboard.writeText(emails.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-3 flex gap-2 flex-wrap">
      <button
        onClick={copyEmails}
        className="text-sm bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-4 py-2 rounded-lg transition"
      >
        {copied ? '✓ Kopierade!' : 'Kopiera alla e-postadresser'}
      </button>
      <a
        href="/api/emails"
        download
        className="text-sm bg-stone-800 hover:bg-stone-700 text-white font-medium px-4 py-2 rounded-lg transition"
      >
        Ladda ner CSV
      </a>
    </div>
  )
}
