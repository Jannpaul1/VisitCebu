import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl">✦</div>
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-slate-600">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
