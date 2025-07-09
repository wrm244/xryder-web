import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

// 通知类型定义
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationConfig {
  type: NotificationType
  message: string
  description?: string
  duration?: number
  delay?: number
}

// 创建通用的通知 hook
export const useNotification = () => {
  const { t } = useTranslation()

  const showNotification = (config: NotificationConfig) => {
    const { type, message, description, duration = 4000, delay = 0 } = config

    const showToast = () => {
      switch (type) {
        case 'success':
          return toast.success(message, { description, duration })
        case 'error':
          return toast.error(message, { description, duration })
        case 'warning':
          return toast.warning(message, { description, duration })
        case 'info':
        default:
          return toast.info(message, { description, duration })
      }
    }

    if (delay > 0) {
      setTimeout(showToast, delay)
    } else {
      showToast()
    }
  }

  return { showNotification, t }
}

// 专门用于登录成功的 hook
export const useLoginSuccessNotification = () => {
  const { showNotification, t } = useNotification()

  const showLoginSuccess = (delay = 300) => {
    showNotification({
      type: 'success',
      message: t('login.notifications.loginSuccess'),
      delay,
    })
  }

  return { showLoginSuccess }
}

// 更通用的状态驱动通知 hook
export const useStateNotification = <T>(
  state: T,
  condition: (state: T) => boolean,
  config: NotificationConfig,
  onShown?: () => void
) => {
  const { showNotification } = useNotification()

  useEffect(() => {
    if (condition(state)) {
      showNotification(config)
      onShown?.()
    }
  }, [state, condition, config, onShown, showNotification])
}
