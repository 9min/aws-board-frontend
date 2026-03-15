import { Link, useRouterState } from '@tanstack/react-router'
import { BarChart3, MessageSquare, Newspaper, Users } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/admin/dashboard', label: '대시보드', icon: BarChart3 },
  { to: '/admin/users', label: '회원 관리', icon: Users },
  { to: '/admin/posts', label: '게시글 관리', icon: Newspaper },
  { to: '/admin/comments', label: '댓글 관리', icon: MessageSquare },
] as const

export function AdminSidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <aside className="flex w-56 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="border-b border-[hsl(var(--border))] px-4 py-4">
        <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          관리자 패널
        </h2>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-0.5',
              currentPath === to || (to !== '/admin/dashboard' && currentPath.startsWith(to))
                ? 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
