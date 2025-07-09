import { KeyboardEvent, useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import BoxReveal from '@/components/magicui/box-reveal'
import DotPattern from '@/components/magicui/dot-pattern'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { encryptPassword, logoImg } from '@/utils'

// 定义表单验证状态
interface FormState {
  username: string
  password: string
  showPassword: boolean
  errors: {
    username?: string
    password?: string
  }
}

function Login() {
  const navigate = useNavigate()
  const { login, isLoading, getPublicKey, publicKey } = useAuthStore()

  const [formState, setFormState] = useState<FormState>({
    username: '',
    password: '',
    showPassword: false,
    errors: {},
  })

  // 获取公钥
  useEffect(() => {
    getPublicKey()
  }, [getPublicKey])

  // 验证表单
  const validateForm = useCallback((): boolean => {
    const errors: FormState['errors'] = {}

    if (!formState.username.trim()) {
      errors.username = '请输入账号'
    }

    if (!formState.password.trim()) {
      errors.password = '请输入密码'
    } else if (formState.password.length < 6) {
      errors.password = '密码至少需要6位'
    }

    setFormState((prev) => ({ ...prev, errors }))
    return Object.keys(errors).length === 0
  }, [formState.username, formState.password])

  // 处理登录
  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    try {
      const encryptedPassword = encryptPassword(formState.password, publicKey)
      if (!encryptedPassword) {
        toast.error('密码加密失败，请重试')
        return
      }

      const encodedPassword = encodeURIComponent(encryptedPassword)
      const response = await login(formState.username, encodedPassword)

      if (response.code === 401) {
        toast.error('登录失败！', {
          description: '用户名或密码错误',
        })
      } else if (response.code === 200) {
        toast.success('登录成功！')
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        navigate('/')
      } else {
        toast.error('登录失败！', {
          description: '未知错误，请重试',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('登录失败！', {
        description: '网络错误，请检查网络连接',
      })
    }
  }, [
    formState.username,
    formState.password,
    publicKey,
    login,
    navigate,
    validateForm,
  ])

  // 切换密码显示状态
  const togglePasswordVisibility = useCallback(() => {
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
  }, [])

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleLogin()
      }
    },
    [handleLogin]
  )

  // 更新表单状态
  const updateFormField = useCallback(
    (field: keyof Pick<FormState, 'username' | 'password'>, value: string) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
        errors: { ...prev.errors, [field]: undefined }, // 清除当前字段的错误
      }))
    },
    []
  )

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:ml-8">
        {/* 左侧介绍区域 */}
        <div className="hidden lg:flex justify-center items-center h-[calc(100vh_-_theme(spacing.8))]">
          <DotPattern
            width={18}
            height={18}
            cx={2}
            cy={2}
            cr={1}
            className={cn(
              '[mask-image:radial-gradient(900px_circle_at_left,white,transparent)]'
            )}
          />
          <div className="relative z-10 max-w-lg">
            <BoxReveal boxColor={'#0EA5E9'} duration={0.5}>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  X.Ryder
                </span>
              </h1>
            </BoxReveal>

            <BoxReveal boxColor={'#0EA5E9'} duration={0.5}>
              <h2 className="text-xl font-semibold text-muted-foreground mb-6">
                为{' '}
                <span className="text-[#0EA5E9]">
                  全栈开发工程师、前端及后端工程师
                </span>{' '}
                准备，开箱即用！
              </h2>
            </BoxReveal>

            <BoxReveal boxColor={'#0EA5E9'} duration={0.5}>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  • 前端基于
                  <span className="font-semibold text-[#0EA5E9]"> React</span>、
                  <span className="font-semibold text-[#0EA5E9]"> Vite</span>、
                  <span className="font-semibold text-[#0EA5E9]">
                    {' '}
                    TypeScript
                  </span>
                  、
                  <span className="font-semibold text-[#0EA5E9]">
                    {' '}
                    Tailwind CSS{' '}
                  </span>
                  等现代技术栈构建
                </p>
                <p>
                  • 后端基于
                  <span className="font-semibold text-[#0EA5E9]"> Java 21</span>
                  、
                  <span className="font-semibold text-[#0EA5E9]">
                    {' '}
                    Spring Boot
                  </span>
                  、
                  <span className="font-semibold text-[#0EA5E9]"> MySQL </span>
                  开发的企业级后台程序
                </p>
                <p>
                  • 可作为
                  <span className="font-semibold text-[#0EA5E9]">
                    {' '}
                    业务系统{' '}
                  </span>
                  和
                  <span className="font-semibold text-[#0EA5E9]">
                    {' '}
                    后台管理系统{' '}
                  </span>
                  的开发框架
                </p>
                <p>
                  • 集成
                  <span className="font-semibold text-[#0EA5E9]"> AI </span>
                  能力，提供智能化解决方案
                </p>
              </div>
            </BoxReveal>
          </div>
        </div>

        {/* 右侧登录区域 */}
        <div className="flex justify-center items-center min-h-screen lg:h-[calc(100vh_-_theme(spacing.8))] p-4">
          <div className="relative w-full max-w-sm">
            <Card className="w-full shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pt-8">
                <div className="flex justify-center">
                  <img
                    src={logoImg}
                    alt="X.Ryder Logo"
                    className="w-16 h-16 rounded-2xl shadow-lg"
                  />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  X.Ryder
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  欢迎回来，请登录您的账户
                </p>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                <div className="space-y-4">
                  {/* 账号输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      账号
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="请输入您的账号"
                      value={formState.username}
                      onChange={(e) =>
                        updateFormField('username', e.target.value)
                      }
                      className={cn(
                        'h-11 transition-colors',
                        formState.errors.username &&
                          'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                    {formState.errors.username && (
                      <p className="text-xs text-destructive">
                        {formState.errors.username}
                      </p>
                    )}
                  </div>

                  {/* 密码输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      密码
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={formState.showPassword ? 'text' : 'password'}
                        placeholder="请输入您的密码"
                        value={formState.password}
                        onChange={(e) =>
                          updateFormField('password', e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        className={cn(
                          'h-11 pr-10 transition-colors',
                          formState.errors.password &&
                            'border-destructive focus-visible:ring-destructive'
                        )}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                      >
                        {formState.showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {formState.errors.password}
                      </p>
                    )}
                  </div>
                </div>

                {/* 登录按钮 */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    onClick={handleLogin}
                    disabled={isLoading || !publicKey}
                  >
                    {isLoading ? '正在登录...' : '登录'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-11 transition-colors hover:bg-muted"
                    disabled={isLoading}
                  >
                    使用第三方账号登录
                  </Button>
                </div>
              </CardContent>
            </Card>

            <DotPattern
              width={16}
              height={16}
              cx={12}
              cy={12}
              cr={1}
              className={cn(
                'absolute inset-0 -z-10',
                '[mask-image:radial-gradient(900px_circle_at_right,white,transparent)]'
              )}
            />
          </div>
        </div>
      </div>

      <footer className="text-center text-muted-foreground text-xs py-4">
        <p>&copy; {currentYear} X.Ryder. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Login
