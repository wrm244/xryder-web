import { create } from 'zustand'

import { API_URLS } from '@/constants/apiUrls'
import { parseQuery } from '@/utils'
import { extractErrorMessage } from '@/utils/errorHandler'

import api from '../axiosInstance'

export interface AccountState {
  nickname: string
  username: string
  departmentId: number
  position: string
  newMails: number
  email: string
  mobile: string
  avatar: string
  enabled: boolean
  loginData: string
  loginIp: string
  roles: unknown[]
  permissions: string[]
}

interface MailState {
  id: number
  title: string
  content: string
  hasRead: boolean
  createTime: string
}

interface QueryParams {
  [key: string]: string | number | boolean
}

interface MailParams {
  id: number
}

interface StoreState {
  account: AccountState
  mails: MailState[]
  changing?: boolean
  saving?: boolean
  deleting?: boolean
  isLoading: boolean
  uploadPercentage: number
  uploading: boolean
  error: string | null
  getAccount: () => Promise<unknown>
  updateAccount?: (params: QueryParams) => Promise<unknown>
  changePassword?: (params: QueryParams) => Promise<unknown>
  changeAvatar: (e: Event & { target: HTMLInputElement }) => Promise<void>
  getMails: (params: QueryParams) => Promise<void>
  readMail: (params: MailParams) => Promise<void>
  deleteMail: (params: MailParams) => Promise<unknown>
  keepAlive: () => Promise<void>
}

export const useAccountStore = create<StoreState>((set) => ({
  account: {
    nickname: '',
    username: '',
    departmentId: 0,
    position: '',
    newMails: 0,
    email: '',
    mobile: '',
    avatar: '',
    enabled: false,
    loginData: '',
    loginIp: '',
    roles: [],
    permissions: [],
  },
  mails: [],
  changing: false,
  saving: false,
  deleting: false,
  isLoading: false,
  uploadPercentage: 0,
  uploading: false,
  error: null,
  getAccount: async () => {
    set({ error: null })
    try {
      const data = await api.get(API_URLS.ACCOUNT.BASE)
      set({ account: data.data })
      return data.data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage })
    }
  },
  updateAccount: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.put(API_URLS.ACCOUNT.BASE, params)
      set({
        account: data.data,
        saving: false,
      })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  changePassword: async (params: QueryParams) => {
    set({ changing: true, error: null })
    try {
      const data = await api.put(API_URLS.ACCOUNT.PASSWORD, params)
      set({ changing: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, changing: false })
    }
  },
  changeAvatar: async (e: Event & { target: HTMLInputElement }) => {
    set({ uploadPercentage: 0, uploading: true, error: null })
    const formData = new FormData()
    const files = e.target.files
    if (!files || files.length === 0) {
      set({ error: '请选择文件', uploading: false })
      return
    }
    const file = files[0]
    formData.append('file', file)
    try {
      const data = await api.post(API_URLS.ACCOUNT.AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / total
          )
          set({ uploadPercentage: percentCompleted })
        },
      })
      set((state) => ({
        uploadPercentage: 100,
        uploading: false,
        account: { ...state.account, avatar: data.data.fileData },
      }))
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, '上传失败')
      set({ error: errorMessage, uploading: false })
    }
  },
  getMails: async (params: QueryParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(API_URLS.MAIL.BASE + '?' + parseQuery(params))
      set({
        mails: data.data,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
  readMail: async (params: MailParams) => {
    set({ error: null })
    try {
      const response = await api.put(API_URLS.MAIL.READ(params.id))
      const data = response.data as { code?: number }
      if (data.code == 200) {
        set((state) => ({
          mails: state.mails.map((m) =>
            m.id === params.id ? { ...m, hasRead: true } : m
          ),
          account: { ...state.account, newMails: state.account.newMails - 1 },
        }))
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage })
    }
  },
  deleteMail: async (params: MailParams) => {
    set({ error: null, deleting: true })
    try {
      const response = await api.delete(API_URLS.MAIL.BY_ID(params.id))
      const data = response.data as { code?: number }
      if (data.code == 200) {
        set((state) => ({
          mails: state.mails.filter((m) => m.id !== params.id),
          deleting: false,
        }))
      }
      return response
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, deleting: false })
    }
  },
  keepAlive: async () => {
    set({ error: null })
    try {
      const refreshTokenRes = await api.get(
        API_URLS.AUTH.TOKEN +
          '?refreshToken=' +
          localStorage.getItem('refreshToken')
      )
      if (refreshTokenRes.data.code == 200) {
        localStorage.setItem('token', refreshTokenRes.data.data)
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage })
    }
  },
}))
