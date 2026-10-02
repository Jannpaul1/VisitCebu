import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, logout } = useAppContext()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updatePassword(password)
      if (!result.ok) {
        setError(result.message ?? 'Unable to update your password.')
        return
      }
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setError('Unable to update your password. Request a new reset link and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md pb-12 pt-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Account security</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Choose a new password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-700">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
          </div>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            {isSubmitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600"><Link to="/login" className="font-semibold text-emerald-700">Return to login</Link></div>
      </div>
    </div>
  )
}