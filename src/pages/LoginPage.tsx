import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAppContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const result = await login(email, password)
      if (!result.ok) {
        setError(result.message ?? 'Unable to sign in.')
        return
      }
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(from || '/profile', { replace: true })
    } catch {
      setError('Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md pb-12 pt-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Log in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="••••••••" />
          </div>

            {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <Link to="/forgot-password" className="text-emerald-700 hover:text-emerald-800">Forgot password?</Link>
          <Link to="/signup" className="text-emerald-700 hover:text-emerald-800">Create account</Link>
        </div>
      </div>
    </div>
  )
}
