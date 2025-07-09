import { create } from 'zustand'

// 引入 Axios 实例
import { parseQuery } from '@/utils'

import api from '../axiosInstance'

// 定义登录响应数据类型
interface LoginResponse {
  code: number
  data: {
    nickname: string
    permissions: string[]
    token: string
    refreshToken: string
  }
  message?: string
}

// 定义 Store 状态类型
interface AuthState {
  name: string
  permissions: string[]
  token: string
  refreshToken: string
  publicKey: string
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<LoginResponse>
  getPublicKey: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  name: '',
  permissions: [],
  token: '',
  refreshToken: '',
  publicKey: '',
  isLoading: false,
  error: null,
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = (await api.post(
        '/login?' + parseQuery({ username, password })
      )) as LoginResponse
      if (data.code === 200) {
        set({
          name: data.data.nickname,
          permissions: data.data.permissions,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
          isLoading: false,
        })
      } else {
        set({
          isLoading: false,
        })
      }
      return data
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },
  getPublicKey: async () => {
    try {
      const response = (await api.get('/v1/publicKey')) as { data: string }
      set({
        publicKey: response.data,
      })
    } catch (error: unknown) {
      console.error('获取公钥失败:', error)
    }
  },
  logout: () => {
    set({ token: '', refreshToken: '', name: '' })
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  },
}))
