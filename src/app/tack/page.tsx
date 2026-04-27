import Link from 'next/link'

export default function TackPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">🙏</div>
        <h1 className="text-2xl font-bold text-stone-900 mb-3">Tack för ditt svar!</h1>
        <p className="text-stone-600 leading-relaxed mb-8">
          Vi har tagit emot ditt svar och är glada för ditt intresse för Hallen på Väveriet.
          Håll utkik i din inkorg – vi hör av oss när det finns mer att berätta!
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-stone-500 hover:text-stone-800 underline underline-offset-2 transition"
        >
          Tillbaka till formuläret
        </Link>
      </div>
    </main>
  )
}
