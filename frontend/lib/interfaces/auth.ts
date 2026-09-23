export interface AuthResponse {
  status: number
  token?: string
  user?: User
  message?: string
}

export interface User {
  id: string
  username: string
  fullName: string
  roles_id: number[]
}
