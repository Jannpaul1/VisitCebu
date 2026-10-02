import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function ForgotPasswordPage() {
  const { resetPassword } = useAppContext()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const result = await resetPassword(email)
      if (result.ok) setSent(true)
      else setError(result.message ?? 'Unable to send a reset link.')
    } catch {
      setError('Unable to send a reset link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md pb-12 pt-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Reset password</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Forgot password</h1>
        </div>

        {sent ? (
          <div role="status" className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">If an account exists for {email}, a password reset link will arrive by email.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="you@example.com" />
            </div>
            {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-slate-600"><Link to="/login" className="font-semibold text-emerald-700">Return to login</Link></div>
      </div>
    </div>
  )
}
