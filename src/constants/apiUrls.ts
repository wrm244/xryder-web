/**
 * API 路径常量
 * 统一管理所有 API 接口路径
 */

// 用户相关 API
export const USER_APIS = {
  BASE: '/v1/users',
  SETTING: '/v1/users/setting',
  BY_ID: (id: string) => `/v1/users/${id}`,
  STATUS: (username: string) => `/v1/users/${username}/status`,
  RESET_PASSWORD: (username: string) => `/v1/users/${username}/pwd/reset`,
  ROLES: '/v1/users/roles',
} as const

// 角色相关 API
export const ROLE_APIS = {
  BASE: '/v1/roles',
  PAGEABLE: '/v1/roles/pageable',
  PERMISSIONS: '/v1/roles/permissions',
  BY_ID: (id: number) => `/v1/roles/${id}`,
} as const

// 部门相关 API
export const DEPARTMENT_APIS = {
  BASE: '/v1/departments',
  BY_ID: (id: string) => `/v1/departments/${id}`,
} as const

// 日志相关 API
export const LOG_APIS = {
  LOGIN: '/v1/logs/login',
  OPERATION: '/v1/logs/operation',
} as const

// 职位相关 API
export const POSITION_APIS = {
  BASE: '/v1/positions',
  BY_ID: (id: number) => `/v1/positions/${id}`,
} as const

// 通知相关 API
export const NOTIFICATION_APIS = {
  BASE: '/v1/notifications',
} as const

// 认证相关 API
export const AUTH_APIS = {
  LOGIN: '/login',
  PUBLIC_KEY: '/v1/publicKey',
  TOKEN: '/v1/token',
} as const

// 账户相关 API
export const ACCOUNT_APIS = {
  BASE: '/v1/account',
  PASSWORD: '/v1/account/password',
  AVATAR: '/v1/account/avatar',
} as const

// 邮件相关 API
export const MAIL_APIS = {
  BASE: '/v1/mails',
  READ: (id: number) => `/v1/mails/${id}/read`,
  BY_ID: (id: number) => `/v1/mails/${id}`,
} as const

// 访客相关 API
export const VISITOR_APIS = {
  VISIT: '/v1/visitor/visit',
  UV: '/v1/visitor/uv',
} as const

// 监控相关 API
export const MONITOR_APIS = {
  CHAT: '/v1/monitor/chat',
} as const

// 合并所有 API 常量
export const API_URLS = {
  USER: USER_APIS,
  ROLE: ROLE_APIS,
  DEPARTMENT: DEPARTMENT_APIS,
  LOG: LOG_APIS,
  POSITION: POSITION_APIS,
  NOTIFICATION: NOTIFICATION_APIS,
  AUTH: AUTH_APIS,
  ACCOUNT: ACCOUNT_APIS,
  MAIL: MAIL_APIS,
  VISITOR: VISITOR_APIS,
  MONITOR: MONITOR_APIS,
} as const
