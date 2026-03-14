import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { queryClient } from '@/lib/queryClient'
import { router } from './app/router'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('root 엘리먼트를 찾을 수 없습니다.')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
