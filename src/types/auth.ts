export interface RegisterRequest {
  email: string
  password: string
  nickname: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  nickname?: string
  createdAt?: string
  isAdmin: boolean
}

export interface MeResponse {
  id: number
  email: string
  nickname: string
  isAdmin: boolean
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
}
