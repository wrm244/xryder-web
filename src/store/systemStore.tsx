import { create } from 'zustand'

import { API_URLS } from '@/constants/apiUrls'
import { parseQuery } from '@/utils'
import { extractErrorMessage } from '@/utils/errorHandler'

import api from '../axiosInstance'

interface LoginLogState {
  id: number
  username: string
  nickname: string
  loginDate: string
  success: boolean
}

interface OperationLogState {
  id: number
  content: string
  methodName: string
  requestParams: string
  operator: string
  operationTime: string
  timeTaken: number
}

export interface PositionState {
  id: number
  name: string
  description: string
  deptId: number
  deptName: string
}

export interface NotificationState {
  id: number
  title: string
  content: string
  createTime: string
}

interface User {
  username: string
  enabled: boolean
  [key: string]: unknown
}

interface UserInfo {
  username?: string
  [key: string]: unknown
}

interface QueryParams {
  [key: string]: string | number | boolean
}

interface Department {
  id: string
  name: string
  children: unknown[]
}

interface SystemState {
  userInfo: UserInfo
  users: User[]
  roles: unknown[]
  allRoles: unknown[]
  permissions: unknown[]
  notifications: NotificationState[]
  department: Department
  loginLogs: LoginLogState[]
  operationLogs: OperationLogState[]
  positions: PositionState[]
  total: number
  page?: number
  rows?: number
  userInfoQuerying?: boolean
  isLoading: boolean
  positionLoading: boolean
  saving: boolean
  deleting: boolean
  updating: boolean
  error?: string | null
  addUser: (params: QueryParams) => Promise<unknown>
  setupUser: (params: QueryParams) => Promise<unknown>
  queryUsers: (params: QueryParams) => Promise<unknown>
  queryUserById: (id: string) => Promise<unknown>
  deleteUserById: (id: string) => Promise<unknown>
  addRole: (params: QueryParams) => Promise<unknown>
  queryRoles: (params: QueryParams) => Promise<unknown>
  updateRole: (params: QueryParams) => Promise<unknown>
  queryAllRoles: () => Promise<unknown>
  distributeRole: (params: QueryParams) => Promise<unknown>
  queryPermissions: () => Promise<unknown>
  deleteRoleById: (id: number) => Promise<unknown>
  queryDepartment: (params: QueryParams) => Promise<unknown>
  addDepartment?: (params: QueryParams) => Promise<unknown>
  deleteDepartment: (id: string) => Promise<unknown>
  updateDepartment: (params: {
    id: string
    body: QueryParams
  }) => Promise<unknown>
  toggleEnabled: (params: string) => Promise<unknown>
  resetPwd: (params: string) => Promise<unknown>
  queryLoginLogs: (params: QueryParams) => Promise<unknown>
  queryOperationLogs: (params: QueryParams) => Promise<unknown>
  queryPositions: (params: QueryParams) => Promise<unknown>
  addPosition: (params: QueryParams) => Promise<unknown>
  updatingPosition?: (params: QueryParams) => Promise<unknown>
  deletePosition?: (id: number) => Promise<unknown>
  queryNotifications: (params: QueryParams) => Promise<unknown>
  sendNotification: (params: QueryParams) => Promise<unknown>
}

export const useSystemStore = create<SystemState>((set, get) => ({
  userInfo: {},
  users: [],
  roles: [],
  allRoles: [],
  permissions: [],
  notifications: [],
  department: {
    id: '0',
    name: '',
    children: [],
  },
  loginLogs: [],
  operationLogs: [],
  positions: [],
  total: 0,
  page: 1,
  rows: 0,
  userInfoQuerying: false,
  isLoading: false,
  positionLoading: false,
  saving: false,
  deleting: false,
  updating: false,
  error: null,
  addUser: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.post(API_URLS.USER.BASE, params)
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  setupUser: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.put(API_URLS.USER.SETTING, params)
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  queryUsers: async (params: QueryParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(API_URLS.USER.BASE + '?' + parseQuery(params))
      set({
        users: data.data.data,
        total: data.data.total,
        page: data.data.page,
        rows: data.data.rows,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
  queryUserById: async (id: string) => {
    set({ userInfoQuerying: true, error: null })
    try {
      const data = await api.get(API_URLS.USER.BY_ID(id))
      set({
        userInfo: data.data,
        userInfoQuerying: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, userInfoQuerying: false })
    }
  },
  deleteUserById: async (id: string) => {
    set({ deleting: true, error: null })
    try {
      const data = await api.delete(API_URLS.USER.BY_ID(id))
      set({ deleting: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, deleting: false })
    }
  },
  addRole: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.post(API_URLS.ROLE.BASE, params)
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  updateRole: async (params: QueryParams) => {
    set({ updating: true, error: null })
    try {
      const data = await api.put(API_URLS.ROLE.BASE, params)
      set({ updating: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, updating: false })
    }
  },
  queryRoles: async (params: QueryParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(
        API_URLS.ROLE.PAGEABLE + '?' + parseQuery(params)
      )
      set({
        roles: data.data.data,
        total: data.data.total,
        page: data.data.page,
        rows: data.data.rows,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
  queryAllRoles: async () => {
    try {
      const data = await api.get(API_URLS.ROLE.BASE)
      set({ allRoles: data.data })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage })
    }
  },
  distributeRole: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.post(API_URLS.USER.ROLES, {
        ...params,
        username: get().userInfo.username,
      })
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  queryPermissions: async () => {
    set({ error: null })
    try {
      const data = await api.get(API_URLS.ROLE.PERMISSIONS)
      set({ permissions: data.data })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
  deleteRoleById: async (id: number) => {
    set({ deleting: true, error: null })
    try {
      const data = await api.delete(API_URLS.ROLE.BY_ID(id))
      set({ deleting: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, deleting: false })
    }
  },
  queryDepartment: async (params: QueryParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(
        API_URLS.DEPARTMENT.BASE + '?' + parseQuery(params)
      )
      set({
        department: data.data,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
  addDepartment: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.post(API_URLS.DEPARTMENT.BASE, params)
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  deleteDepartment: async (id: string) => {
    set({ deleting: true, error: null })
    try {
      const data = await api.delete(API_URLS.DEPARTMENT.BY_ID(id))
      set({ deleting: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, deleting: false })
    }
  },
  updateDepartment: async (params: { id: string; body: QueryParams }) => {
    set({ updating: true, error: null })
    try {
      const data = await api.put(
        API_URLS.DEPARTMENT.BY_ID(params.id),
        params.body
      )
      set({ updating: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, updating: false })
    }
  },
  // 启用/禁用用户
  toggleEnabled: async (username: string) => {
    set({ updating: true, error: null })
    try {
      const response = await api.put(API_URLS.USER.STATUS(username))
      const data = response.data as { code?: number }
      if (data.code == 200) {
        set((state) => ({
          users: state.users.map((user) =>
            user.username === username
              ? { ...user, enabled: !user.enabled }
              : user
          ),
          updating: false,
        }))
      } else {
        set({ updating: false })
      }
      return response
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, updating: false })
    }
  },
  resetPwd: async (username: string) => {
    set({ updating: true, error: null })
    try {
      const data = await api.put(API_URLS.USER.RESET_PASSWORD(username))
      set({ updating: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, updating: false })
    }
  },
  queryLoginLogs: async (params: QueryParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(API_URLS.LOG.LOGIN + '?' + parseQuery(params))
      set({
        loginLogs: data.data.data,
        total: data.data.total,
        page: data.data.page,
        rows: data.data.rows,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
  queryOperationLogs: async (params: QueryParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(
        API_URLS.LOG.OPERATION + '?' + parseQuery(params)
      )
      set({
        operationLogs: data.data.data,
        total: data.data.total,
        page: data.data.page,
        rows: data.data.rows,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
  queryPositions: async (params: QueryParams) => {
    set({ positionLoading: true, error: null })
    try {
      const data = await api.get(
        API_URLS.POSITION.BASE + '?' + parseQuery(params)
      )
      set({
        positions: data.data.data,
        total: data.data.total,
        page: data.data.page,
        rows: data.data.rows,
        positionLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, positionLoading: false })
    }
  },
  addPosition: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.post(API_URLS.POSITION.BASE, params)
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  updatingPosition: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.put(API_URLS.POSITION.BASE, params)
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  deletePosition: async (id: number) => {
    set({ deleting: true, error: null })
    try {
      const data = await api.delete(API_URLS.POSITION.BY_ID(id))
      set({ deleting: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, deleting: false })
    }
  },
  sendNotification: async (params: QueryParams) => {
    set({ saving: true, error: null })
    try {
      const data = await api.post(API_URLS.NOTIFICATION.BASE, params)
      set({ saving: false })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, saving: false })
    }
  },
  queryNotifications: async (params: QueryParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(
        API_URLS.NOTIFICATION.BASE + '?' + parseQuery(params)
      )
      set({
        notifications: data.data.data,
        total: data.data.total,
        page: data.data.page,
        rows: data.data.rows,
        isLoading: false,
      })
      return data
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      set({ error: errorMessage, isLoading: false })
    }
  },
}))

export default useSystemStore
