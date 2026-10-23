import type { ReactNode } from 'react'

interface CategoryCardProps {
  title: string
  description: string
  icon: ReactNode
}

export function CategoryCard({ title, description, icon }: CategoryCardProps) {
  return (
    <div className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  )
}
