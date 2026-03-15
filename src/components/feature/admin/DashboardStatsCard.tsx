import type { ReactNode } from 'react'

interface DashboardStatsCardProps {
  label: string
  value: number
  icon: ReactNode
}

export function DashboardStatsCard({ label, value, icon }: DashboardStatsCardProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
        <div className="text-[hsl(var(--accent))]">{icon}</div>
      </div>
      <p className="mt-2 text-3xl font-bold text-[hsl(var(--foreground))]">
        {value.toLocaleString()}
      </p>
    </div>
  )
}
