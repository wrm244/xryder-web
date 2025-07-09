# Axios 实例优化使用指南

## 新增功能

### 1. 自动登录检查和跳转

在登录页面组件中使用 `autoRedirectIfLoggedIn` 函数：

```typescript
import { autoRedirectIfLoggedIn } from './axiosInstance'

// 在登录页面组件的 useEffect 中调用
useEffect(() => {
  autoRedirectIfLoggedIn()
}, [])
```

### 2. 登录成功后的智能跳转

在登录成功后使用 `handleLoginSuccess` 函数：

```typescript
import { handleLoginSuccess } from './axiosInstance'

// 登录成功后调用
const handleLogin = async (credentials) => {
  try {
    const response = await loginAPI(credentials)
    const { token, refreshToken } = response.data

    // 使用新的函数处理登录成功
    handleLoginSuccess(token, refreshToken)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

### 3. 手动检查 Token 有效性

```typescript
import { checkTokenValidity } from './axiosInstance'

// 在需要的地方检查token有效性
const isLoggedIn = await checkTokenValidity()
if (isLoggedIn) {
  // 用户已登录
} else {
  // 用户未登录或token无效
}
```

### 4. URL 参数处理工具

```typescript
import { getRedirectUrl, clearRedirectUrlParam } from './axiosInstance'

// 获取URL中的重定向参数
const redirectUrl = getRedirectUrl()

// 清除URL中的重定向参数（可选）
clearRedirectUrlParam()
```

## 功能特点

### 1. 登录页面优化
- 当用户访问登录页面时，自动检查是否已有有效的token
- 如果token有效，自动跳转到原来访问的页面或首页
- 避免用户重复登录

### 2. 基于URL参数的智能跳转 ⭐️
- **支持链接分享**：当用户在某个页面token过期时，系统会生成包含重定向信息的登录链接
- **例如**：用户在 `/dashboard/analytics` 页面token过期，会跳转到 `/login?redirect=%2Fdashboard%2Fanalytics`
- **分享友好**：可以直接复制这个登录链接给其他人，他们登录后也会跳转到相同页面
- **URL 清洁**：登录成功后会自动跳转，保持URL的整洁

### 3. 性能优化
- 使用内存缓存减少 localStorage 访问
- 使用 Set 数据结构优化白名单查找
- 防止重复的token刷新请求
- 添加请求超时控制

## 配置说明

可以在 `CONFIG` 常量中修改相关配置：

```typescript
const CONFIG = {
  BASE_URL: '/api',
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken',
  LOGIN_PATH: '/login',
  REFRESH_TOKEN_ENDPOINT: '/api/v1/refreshToken',
  REDIRECT_PARAM_KEY: 'redirect', // URL参数名
  HOME_PATH: '/', // 可以修改为你的首页路径
} as const
```

## 使用示例

### 典型的登录流程：

1. **用户访问受保护页面**（如 `/dashboard/analytics`）
2. **Token过期**，系统自动跳转到 `/login?redirect=%2Fdashboard%2Fanalytics`
3. **用户可以分享这个链接**给其他人
4. **登录成功后**，自动跳转回 `/dashboard/analytics`

### 登录页面组件示例：

```typescript
import React, { useEffect, useState } from 'react'
import { autoRedirectIfLoggedIn, handleLoginSuccess } from './axiosInstance'

const LoginPage = () => {
  const [isInitializing, setIsInitializing] = useState(true)
  const { getPublicKey } = useAuthStore()

  useEffect(() => {
    const initializeLogin = async () => {
      try {
        // 先检查是否已登录，如果已登录会自动跳转
        const didRedirect = await autoRedirectIfLoggedIn()

        // 如果没有重定向（即用户未登录），则获取公钥
        if (!didRedirect) {
          await getPublicKey()
        }
      } catch (error) {
        console.log('Login initialization error:', error)
        // 即使检查失败，也要获取公钥以便用户登录
        await getPublicKey()
      } finally {
        setIsInitializing(false)
      }
    }

    initializeLogin()
  }, [getPublicKey])

  // 显示加载界面
  if (isInitializing) {
    return <div>正在初始化...</div>
  }

  const handleSubmit = async (credentials) => {
    try {
      const response = await loginAPI(credentials)
      const { token, refreshToken } = response.data

      // 自动处理跳转逻辑
      handleLoginSuccess(token, refreshToken)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 登录表单 */}
    </form>
  )
}
```

## 注意事项

1. 确保 `/v1/user/info` 接口存在并且可以用于验证token有效性
2. 如果你的验证接口不同，请修改 `checkTokenValidity` 函数中的接口路径
3. 根据你的应用修改 `HOME_PATH` 配置
4. 确保在登录页面组件中调用 `autoRedirectIfLoggedIn()`
