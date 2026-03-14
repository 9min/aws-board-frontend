import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link to="/" className="text-lg font-semibold">
          AWS Board
        </Link>
        <nav className="ml-auto flex gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            홈
          </Link>
        </nav>
      </div>
    </header>
  )
}
