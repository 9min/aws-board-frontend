import { Link } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { isLoading, isAuthenticated, user, logout } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link to="/" className="text-lg font-semibold">
          AWS Board
        </Link>
        {!isLoading && (
          <nav className="ml-auto flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              홈
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium">{user?.nickname ?? user?.email}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  search={{}}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-muted-foreground hover:text-foreground"
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
