/**
 * @license MIT
 * Created by: joetao
 * Created on: 2024/12/3
 * Project: xryder
 * Description: This is a rapid development template for middle and backend UI based on vite, react, tailwindcss and shadcn.
 */
import { create } from 'zustand'

import { API_URLS } from '@/constants/apiUrls'
import { parseQuery } from '@/utils'
import { extractErrorMessage } from '@/utils/errorHandler'

import api from '../axiosInstance'

interface Monitor {
  id?: number
  message?: string
  [key: string]: unknown
}

interface VisitParams {
  [key: string]: unknown
}

interface VisitorState {
  count: number
  monitors: Monitor[]
  thinking: boolean
  error: string | null
  visit: (params: VisitParams) => Promise<void>
  uv: () => Promise<void>
  chat: (question: string) => Promise<string | void>
}

/**
 * 埋点数据
 */
export const useVisitorStore = create<VisitorState>((set) => ({
  count: 0,
  monitors: [],
  thinking: false,
  error: null,
  visit: async (params: VisitParams) => {
    try {
      await api.post(API_URLS.VISITOR.VISIT, params)
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, '请求失败')
      set({ error: errorMessage })
    }
  },
  uv: async () => {
    const result = await api.get<number>(API_URLS.VISITOR.UV)
    set({ count: result.data })
  },
  chat: async (question: string) => {
    set({ thinking: true, error: null })
    try {
      const result = await api.get<{ message: string }>(
        API_URLS.MONITOR.CHAT + '?' + parseQuery({ question })
      )
      if (result) {
        if (result.data.message.length == 0) {
          set((state: VisitorState) => ({
            monitors: [...state.monitors, result.data],
            thinking: false,
          }))
        } else {
          set({ thinking: false })
          return result.data.message
        }
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, '服务器异常')
      set({ error: errorMessage, thinking: false })
    }
  },
}))
