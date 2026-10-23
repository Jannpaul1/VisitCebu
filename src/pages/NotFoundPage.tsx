import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pb-10">
      <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-4 text-6xl">🌴</div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">This page is not on the map.</h1>
        <p className="mt-4 text-slate-600">The destination you’re looking for may have moved, or the route does not exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to home
        </Link>
      </div>
    </div>
  )
}
