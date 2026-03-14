import { Link, useRouterState } from '@tanstack/react-router'
import { Layers, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'

export function Header() {
  const { isLoading, isAuthenticated, user, logout } = useAuth()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold text-[hsl(var(--foreground))]"
        >
          <Layers className="h-5 w-5 text-[hsl(var(--accent))]" />
          <span>AWS Board</span>
        </Link>

        {!isLoading && (
          <nav className="ml-auto flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                currentPath === '/'
                  ? 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
              )}
            >
              홈
            </Link>

            {isAuthenticated ? (
              <>
                <div className="ml-2 flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xs font-bold text-white">
                    {(user?.nickname ?? user?.email ?? '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {user?.nickname ?? user?.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="ml-1 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  search={{}}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    currentPath === '/login'
                      ? 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
                  )}
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="ml-1 rounded-md bg-[hsl(var(--accent))] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--accent)/0.9)]"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
