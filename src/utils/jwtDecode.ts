export function decodeJwtPayload(
  token: string,
): { sub: number; email: string; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    return JSON.parse(decoded) as { sub: number; email: string; exp: number }
  } catch {
    return null
  }
}
