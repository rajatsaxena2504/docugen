import client from './client'
import type { User, AuthResponse, RegisterRequest, LoginRequest } from '@/types'

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await client.post<User>('/auth/register', data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)

    const response = await client.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await client.get<User>('/auth/me')
    return response.data
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/refresh')
    return response.data
  },
}
