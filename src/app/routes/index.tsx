import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h1 className="text-4xl font-bold">AWS Board</h1>
      <p className="text-muted-foreground">게시판 서비스에 오신 것을 환영합니다.</p>
    </div>
  )
}
