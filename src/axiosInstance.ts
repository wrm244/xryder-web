/**
 * Axios 实例配置
 * 包含请求/响应拦截器、token刷新机制、错误处理等功能
 */
import axios, {
  AxiosError,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import qs from 'qs'

import useErrorStore from './store/errorStore'

// 需要忽略的错误消息
const IGNORE_MESSAGES = new Set(['无效的刷新令牌', '刷新令牌已过期'])

// 请求队列类型
type RequestCallback = () => void

// API响应类型
interface ApiResponse {
  code: number
  msg: string
  data?: unknown
}

// 错误响应类型
interface ErrorResponse {
  message?: string
}

let requestList: RequestCallback[] = []
// 是否正在刷新中
let isRefreshToken = false
// 刷新token的Promise，用于防止重复刷新
let refreshTokenPromise: Promise<AxiosResponse> | null = null
// 请求白名单，无须token的接口 - 使用Set优化查找性能
const WHITE_LIST = new Set(['/v1/token', '/v1/publicKey'])
// 登录相关的白名单路径，需要精确匹配
const LOGIN_WHITE_LIST = new Set(['/login'])

// 缓存token和refreshToken，减少localStorage访问
let cachedToken: string | null = null
let cachedRefreshToken: string | null = null

// 初始化缓存
const initTokenCache = () => {
  cachedToken = localStorage.getItem(CONFIG.TOKEN_KEY)
  cachedRefreshToken = localStorage.getItem(CONFIG.REFRESH_TOKEN_KEY)
}

// 更新token缓存
const updateTokenCache = (token: string) => {
  cachedToken = token
  localStorage.setItem(CONFIG.TOKEN_KEY, token)
}

// 更新refreshToken缓存
const updateRefreshTokenCache = (refreshToken: string) => {
  cachedRefreshToken = refreshToken
  localStorage.setItem(CONFIG.REFRESH_TOKEN_KEY, refreshToken)
}

// 清除token缓存
const clearTokenCache = () => {
  cachedToken = null
  cachedRefreshToken = null
  localStorage.removeItem(CONFIG.TOKEN_KEY)
  localStorage.removeItem(CONFIG.REFRESH_TOKEN_KEY)
}

// 监听localStorage变化，保持缓存同步
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG.TOKEN_KEY) {
      cachedToken = e.newValue
    } else if (e.key === CONFIG.REFRESH_TOKEN_KEY) {
      cachedRefreshToken = e.newValue
    }
  })
}

// 状态码常量
const STATUS_CODES = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOKEN_EXPIRED: 405,
  REFRESH_FAILED: 406,
  SERVER_ERROR: 500,
} as const

// 配置常量
const CONFIG = {
  BASE_URL: '/api',
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken',
  LOGIN_PATH: '/login',
  REFRESH_TOKEN_ENDPOINT: '/api/v1/refreshToken',
  REDIRECT_PARAM_KEY: 'redirect', // URL参数名，用于存储重定向路径
  HOME_PATH: '/', // 默认首页路径
} as const
// 所有通过api发送的请求，都会加上/api的前缀
const api = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: 10000, // 添加超时设置
})

// 初始化token缓存
initTokenCache()

// 缓存方法名，避免重复计算
const HTTP_METHODS = {
  POST: 'POST',
  GET: 'GET',
} as const

// request拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 是否需要设置 token
    let isToken = true
    // 检查当前请求的URL是否在白名单中
    if (config.url) {
      // 检查普通白名单（包含匹配）
      for (const url of WHITE_LIST) {
        if (config.url.includes(url)) {
          isToken = false
          break
        }
      }

      // 检查登录白名单（精确匹配）
      if (isToken) {
        for (const url of LOGIN_WHITE_LIST) {
          if (config.url === url) {
            isToken = false
            break
          }
        }
      }
    }

    // 如果缓存中没有token，尝试从localStorage重新获取
    if (!cachedToken) {
      cachedToken = localStorage.getItem(CONFIG.TOKEN_KEY)
    }

    // 使用缓存的token，避免频繁访问localStorage
    if (cachedToken && isToken) {
      config.headers.Authorization = 'Bearer ' + cachedToken
    }

    const params = config.params || {}
    const data = config.data || false
    const method = config.method?.toUpperCase()

    if (
      method === HTTP_METHODS.POST &&
      (config.headers as AxiosRequestHeaders)['Content-Type'] ===
        'application/x-www-form-urlencoded'
    ) {
      config.data = qs.stringify(data)
    }
    // get参数编码
    if (method === HTTP_METHODS.GET && params) {
      config.params = {}
      const paramsStr = qs.stringify(params, { allowDots: true })
      if (paramsStr) {
        config.url = config.url + '?' + paramsStr
      }
    }
    return config
  },
  (error: AxiosError) => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response 拦截器
api.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { data, status } = response
    if (status === STATUS_CODES.SERVER_ERROR) {
      await handleError()
      return Promise.reject('服务器异常！')
    }

    const config = response.config
    if (!data) {
      throw new Error()
    }

    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer'
    ) {
      if (response.data.type !== 'application/json') {
        return response
      }
      // 处理二进制响应中的JSON数据
      const jsonData = await new Response(response.data).json()
      response.data = jsonData
    }

    const code = data.code
    // 获取状态码描述信息
    const msg = data.msg

    if (IGNORE_MESSAGES.has(msg)) {
      // 如果是忽略的错误码，直接返回 msg 异常
      return Promise.reject(msg)
    }

    switch (code) {
      case STATUS_CODES.TOKEN_EXPIRED:
        return await handleTokenExpired(config)
      case STATUS_CODES.SERVER_ERROR:
        return handleError()
      case STATUS_CODES.FORBIDDEN:
        return handleForbidden()
      case STATUS_CODES.REFRESH_FAILED:
        return handleAuthorized()
      case STATUS_CODES.UNAUTHORIZED:
        return handleUnauthorized(data)
      default:
        return data
    }
  },
  (error: AxiosError) => {
    // HTTP 错误处理
    const setError = useErrorStore.getState().setError
    const message =
      (error.response?.data as ErrorResponse)?.message || '网络错误'
    setError(message)
    return Promise.reject(error)
  }
)

// 处理token过期的情况
const handleTokenExpired = async (config: InternalAxiosRequestConfig) => {
  // 如果未认证，并且未进行刷新令牌，说明可能是访问令牌过期了
  if (!isRefreshToken) {
    isRefreshToken = true
    // 1. 如果获取不到刷新令牌，则只能执行登出操作
    if (!cachedRefreshToken) {
      cachedRefreshToken = localStorage.getItem(CONFIG.REFRESH_TOKEN_KEY)
    }
    if (!cachedRefreshToken) {
      isRefreshToken = false
      return handleAuthorized()
    }
    // 2. 进行刷新访问令牌
    try {
      console.log('开始刷新 token...')
      // 如果已经有刷新请求在进行中，直接使用该Promise
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshToken()
      }
      const refreshTokenRes = await refreshTokenPromise
      console.log('刷新 token 响应:', refreshTokenRes)
      if (refreshTokenRes.data.code === STATUS_CODES.SUCCESS) {
        // 2.1 刷新成功，则回放队列的请求 + 当前请求
        console.log('Token 刷新成功，新 token:', refreshTokenRes.data.data)
        updateTokenCache(refreshTokenRes.data.data)
        config.headers!.Authorization = 'Bearer ' + cachedToken
        // 执行队列中的请求
        const pendingRequests = [...requestList]
        requestList = []
        pendingRequests.forEach((cb) => {
          cb()
        })
        return api(config)
      } else {
        return handleAuthorized()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
      // 2.2 刷新失败，只回放队列的请求
      const pendingRequests = [...requestList]
      requestList = []
      pendingRequests.forEach((cb) => {
        cb()
      })
      // 提示是否要登出。即不回放当前请求！不然会形成递归
      return handleAuthorized()
    } finally {
      isRefreshToken = false
      refreshTokenPromise = null // 清除Promise缓存
    }
  } else {
    // 添加到队列，等待刷新获取到新的令牌
    return new Promise((resolve) => {
      requestList.push(() => {
        config.headers!.Authorization = 'Bearer ' + cachedToken
        resolve(api(config))
      })
    })
  }
}

// 处理未授权情况
const handleUnauthorized = (data: ApiResponse) => {
  // 保存当前页面路径到URL参数中（除非已经在登录页）
  if (window.location.pathname !== CONFIG.LOGIN_PATH) {
    const currentPath =
      window.location.pathname + window.location.search + window.location.hash
    const loginUrl = `${CONFIG.LOGIN_PATH}?${CONFIG.REDIRECT_PARAM_KEY}=${encodeURIComponent(currentPath)}`
    window.location.href = loginUrl
  }
  clearTokenCache()
  return data
}

const refreshToken = async () => {
  // 直接使用axios而不是api实例，避免响应拦截器的处理
  return await axios.post(`${CONFIG.REFRESH_TOKEN_ENDPOINT}`, {
    refreshToken: cachedRefreshToken,
  })
}

const handleAuthorized = () => {
  // 如果已经到重新登录页面则不进行弹窗提示
  if (window.location.pathname === CONFIG.LOGIN_PATH) {
    return
  }
  // 保存当前页面路径到URL参数中（除非已经在登录页）
  const currentPath =
    window.location.pathname + window.location.search + window.location.hash
  const loginUrl = `${CONFIG.LOGIN_PATH}?${CONFIG.REDIRECT_PARAM_KEY}=${encodeURIComponent(currentPath)}`
  clearTokenCache()
  window.location.href = loginUrl
  return Promise.reject('认证失败')
}

const handleForbidden = () => {
  const setError = useErrorStore.getState().setError
  setError('未授权访问')
  return Promise.reject(new Error('未授权访问'))
}

const handleError = () => {
  const setError = useErrorStore.getState().setError
  setError('服务器异常')
  return Promise.reject(new Error('服务器异常'))
}

export default api

// 从URL参数中获取重定向路径的工具函数
const getRedirectUrlFromParams = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(CONFIG.REDIRECT_PARAM_KEY)
}

// 清除URL中的重定向参数
const clearRedirectParam = (): void => {
  const url = new URL(window.location.href)
  url.searchParams.delete(CONFIG.REDIRECT_PARAM_KEY)
  window.history.replaceState({}, '', url.toString())
}

// 检查token有效性的函数
export const checkTokenValidity = async (): Promise<boolean> => {
  try {
    // 如果没有token，直接返回false
    if (!cachedToken && !localStorage.getItem(CONFIG.TOKEN_KEY)) {
      return false
    }

    // 使用一个轻量级的接口来验证token，避免复杂的业务接口
    // 这里使用 /v1/users 接口，如果失败可以尝试其他接口
    const response = await api.get('/api/v1/account', {
      timeout: 3000, // 设置较短的超时时间
      // 避免在token验证时触发错误处理
      validateStatus: (status) => status < 500, // 只有5xx错误才认为是网络错误
    })

    return response && typeof response === 'object' && 'code' in response
      ? response.code === STATUS_CODES.SUCCESS
      : true // 如果响应格式不同，但没有抛出异常，认为token有效
  } catch (error) {
    // 如果请求失败，说明token无效
    console.log('Token validation failed:', error)
    return false
  }
}

// 登录页面自动跳转检查
export const autoRedirectIfLoggedIn = async (): Promise<boolean> => {
  // 只在登录页执行
  if (window.location.pathname !== CONFIG.LOGIN_PATH) {
    return false
  }

  try {
    // 静默检查token有效性，不显示错误信息
    const isTokenValid = await checkTokenValidity()
    if (isTokenValid) {
      // token有效，检查URL参数中是否有重定向路径
      const redirectUrl = getRedirectUrlFromParams()

      // 添加小延迟确保页面渲染完成
      setTimeout(() => {
        if (redirectUrl) {
          window.location.href = redirectUrl
        } else {
          window.location.href = CONFIG.HOME_PATH
        }
      }, 100)

      return true // 表示将发生重定向
    }
    return false // 表示没有重定向
  } catch (error) {
    console.log('Auto redirect check failed:', error)
    // 检查失败，清除可能无效的token，但不显示错误信息
    clearTokenCache()
    return false
  }
}

// 登录成功后的跳转处理
export const handleLoginSuccess = (
  token: string,
  refreshToken?: string
): void => {
  // 更新token缓存
  updateTokenCache(token)
  if (refreshToken) {
    updateRefreshTokenCache(refreshToken)
  }

  // 检查URL参数中是否有重定向路径
  const redirectUrl = getRedirectUrlFromParams()
  if (redirectUrl) {
    window.location.href = redirectUrl
  } else {
    // 没有重定向路径，跳转到首页
    window.location.href = CONFIG.HOME_PATH
  }
}

// 导出工具函数供外部使用
export const updateApiTokens = (token: string, refreshToken?: string) => {
  updateTokenCache(token)
  if (refreshToken) {
    updateRefreshTokenCache(refreshToken)
  }
}

export const clearApiTokens = () => {
  clearTokenCache()
}

// 导出URL参数工具函数供外部使用
export const getRedirectUrl = (): string | null => {
  return getRedirectUrlFromParams()
}

export const clearRedirectUrlParam = (): void => {
  clearRedirectParam()
}
