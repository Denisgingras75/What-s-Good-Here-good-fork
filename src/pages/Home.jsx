import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/30 mb-6">
          <span className="text-4xl">🍽️</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-neutral-900 font-serif text-center leading-tight">
          What's Good Here
        </h1>

        {/* Tagline */}
        <p className="text-lg text-neutral-600 mt-3 text-center max-w-xs">
          Find the best dishes on Martha's Vineyard. Skip the rest.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mt-10 w-full max-w-xs">
          <Link
            to="/browse"
            className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl text-center shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Browse by Food
          </Link>
          <Link
            to="/restaurants"
            className="w-full py-4 px-6 bg-white text-neutral-900 font-semibold rounded-xl text-center border-2 border-neutral-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
          >
            Browse by Restaurant
          </Link>
        </div>

        {/* Stats or social proof could go here */}
        <p className="text-sm text-neutral-400 mt-12">
          Powered by locals who know what's good
        </p>
      </div>
    </div>
  )
}
