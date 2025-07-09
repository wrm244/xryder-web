import { KeyboardEvent, useCallback, useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Sparkles, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { LanguageTextWrapper } from '@/components/LanguageAnimationWrapper'
import { LanguageToggle } from '@/components/LanguageToggle'
import DotPattern from '@/components/magicui/dot-pattern'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { encryptPassword, logoImg } from '@/utils'

import { autoRedirectIfLoggedIn, handleLoginSuccess } from './axiosInstance'

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
  const { t } = useTranslation()
  const { login, isLoading, getPublicKey, publicKey } = useAuthStore()

  // 添加初始化状态
  const [isInitializing, setIsInitializing] = useState(true)

  const [formState, setFormState] = useState<FormState>({
    username: '',
    password: '',
    showPassword: false,
    errors: {},
  })

  // 检查登录状态并获取公钥的组合逻辑
  useEffect(() => {
    const initializeLogin = async () => {
      try {
        // 先检查是否已登录，如果已登录会自动跳转
        const didRedirect = await autoRedirectIfLoggedIn()

        // 如果发生重定向，延迟一下再结束初始化，避免闪烁
        if (didRedirect) {
          // 给重定向一些时间，然后结束初始化状态
          setTimeout(() => {
            setIsInitializing(false)
          }, 500)
          return
        }

        // 如果没有重定向（即用户未登录），则获取公钥
        await getPublicKey()
      } catch (error) {
        console.log('Login initialization error:', error)
        // 即使检查失败，也要获取公钥以便用户登录
        try {
          await getPublicKey()
        } catch (keyError) {
          console.error('Failed to get public key:', keyError)
        }
      } finally {
        // 初始化完成
        setIsInitializing(false)
      }
    }

    initializeLogin()
  }, [getPublicKey])

  // 验证表单
  const validateForm = useCallback((): boolean => {
    const errors: FormState['errors'] = {}

    if (!formState.username.trim()) {
      errors.username = t('login.errors.usernameRequired')
    }

    if (!formState.password.trim()) {
      errors.password = t('login.errors.passwordRequired')
    } else if (formState.password.length < 6) {
      errors.password = t('login.errors.passwordMinLength')
    }

    setFormState((prev) => ({ ...prev, errors }))
    return Object.keys(errors).length === 0
  }, [formState.username, formState.password, t])

  // 处理登录
  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    try {
      const encryptedPassword = encryptPassword(formState.password, publicKey)
      if (!encryptedPassword) {
        toast.error(t('login.notifications.loginFailed'), {
          description: t('login.notifications.encryptionFailed'),
        })
        return
      }

      const encodedPassword = encodeURIComponent(encryptedPassword)
      const response = await login(formState.username, encodedPassword)

      if (response.code === 401) {
        toast.error(t('login.notifications.loginFailed'), {
          description: t('login.notifications.usernameOrPasswordError'),
        })
      } else if (response.code === 200) {
        toast.success(t('login.notifications.loginSuccess'))
        // 使用新的登录成功处理函数，自动处理重定向
        handleLoginSuccess(response.data.token, response.data.refreshToken)
      } else {
        toast.error(t('login.notifications.loginFailed'), {
          description: t('login.notifications.unknownError'),
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(t('login.notifications.loginFailed'), {
        description: t('login.notifications.networkError'),
      })
    }
  }, [
    formState.username,
    formState.password,
    publicKey,
    login,
    validateForm,
    t,
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

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  }

  // 如果正在初始化，显示加载界面
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('login.initializing', 'Initializing...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
      {/* 语言切换按钮 */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle variant="icon" size="md" showLabel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-2xl" />
        {/* DotPattern背景 */}
        <DotPattern
          width={25}
          height={25}
          cx={1}
          cy={1}
          cr={1}
          className={cn(
            'absolute inset-0 z-0 opacity-30 fill-neutral-600/40 dark:fill-neutral-400/30',
            '[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]'
          )}
        />
        {/* 左侧介绍区域 */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="hidden lg:flex flex-col justify-center items-center p-12 relative overflow-hidden"
        >
          <motion.div
            variants={itemVariants}
            className="relative z-10 text-center max-w-md"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <LanguageTextWrapper>
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('login.title')}
                </h1>
              </LanguageTextWrapper>
            </motion.div>
            <motion.div variants={itemVariants}>
              <LanguageTextWrapper delay={0.1}>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {t('login.subtitle')}
                </p>
              </LanguageTextWrapper>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4"
            >
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-600">99.9%</div>
                <LanguageTextWrapper delay={0.2}>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('login.stability')}
                  </div>
                </LanguageTextWrapper>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <LanguageTextWrapper delay={0.3}>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('login.support')}
                  </div>
                </LanguageTextWrapper>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-indigo-600">1000+</div>
                <LanguageTextWrapper delay={0.4}>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('login.users')}
                  </div>
                </LanguageTextWrapper>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 右侧登录区域 */}
        <div className="relative flex justify-center items-center min-h-screen p-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative w-full max-w-md z-10"
          >
            <Card className="w-full shadow-xl border border-white/20 dark:border-gray-800/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
              <CardHeader className="text-center space-y-6 pt-8 pb-2">
                <motion.div
                  variants={logoVariants}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-md opacity-50" />
                    <img
                      src={logoImg}
                      alt="X.Ryder Logo"
                      className="relative w-16 h-16 rounded-2xl shadow-lg"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <LanguageTextWrapper>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {t('login.loginAccount')}
                    </CardTitle>
                  </LanguageTextWrapper>
                  <LanguageTextWrapper delay={0.1}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {t('login.welcomeBack')}
                    </p>
                  </LanguageTextWrapper>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-6 pb-8 px-8">
                <motion.div variants={containerVariants} className="space-y-5">
                  {/* 账号输入 */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <LanguageTextWrapper>
                      <Label
                        htmlFor="username"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        {t('login.username')}
                      </Label>
                    </LanguageTextWrapper>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder={t('login.usernamePlaceholder')}
                        value={formState.username}
                        onChange={(e) =>
                          updateFormField('username', e.target.value)
                        }
                        className={cn(
                          'h-12 pl-4 pr-4 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200',
                          formState.errors.username &&
                            'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                        )}
                        disabled={isLoading}
                      />
                    </div>
                    {formState.errors.username && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        {formState.errors.username}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* 密码输入 */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <LanguageTextWrapper>
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-purple-500" />
                        {t('login.password')}
                      </Label>
                    </LanguageTextWrapper>
                    <div className="relative">
                      <Input
                        id="password"
                        type={formState.showPassword ? 'text' : 'password'}
                        placeholder={t('login.passwordPlaceholder')}
                        value={formState.password}
                        onChange={(e) =>
                          updateFormField('password', e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        className={cn(
                          'h-12 pl-4 pr-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200',
                          formState.errors.password &&
                            'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                        )}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                      >
                        {formState.showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    {formState.errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        {formState.errors.password}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>

                {/* 登录按钮 */}
                <motion.div variants={itemVariants} className="space-y-4 pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
                    onClick={handleLogin}
                    disabled={isLoading || !publicKey}
                  >
                    <LanguageTextWrapper className="flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t('login.loggingIn')}
                        </>
                      ) : (
                        <>
                          {t('login.loginButton')}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </LanguageTextWrapper>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <LanguageTextWrapper className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
                        {t('login.or')}
                      </span>
                    </LanguageTextWrapper>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
                    disabled={isLoading}
                  >
                    <LanguageTextWrapper className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-gray-500" />
                      {t('login.thirdPartyLogin')}
                    </LanguageTextWrapper>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            {/* 底部装饰 */}
            <motion.div variants={itemVariants} className="mt-8 text-center">
              <LanguageTextWrapper>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('login.copyright', { year: currentYear })}
                </p>
              </LanguageTextWrapper>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
