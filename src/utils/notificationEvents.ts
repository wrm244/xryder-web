// 事件驱动的通知系统
export class NotificationEventManager {
  private static instance: NotificationEventManager
  private eventTarget: EventTarget

  private constructor() {
    this.eventTarget = new EventTarget()
  }

  static getInstance(): NotificationEventManager {
    if (!NotificationEventManager.instance) {
      NotificationEventManager.instance = new NotificationEventManager()
    }
    return NotificationEventManager.instance
  }

  // 发送通知事件
  emit(type: string, config: any) {
    const event = new CustomEvent(type, { detail: config })
    this.eventTarget.dispatchEvent(event)
  }

  // 监听通知事件
  on(type: string, callback: (event: CustomEvent) => void) {
    this.eventTarget.addEventListener(type, callback as EventListener)
  }

  // 移除监听
  off(type: string, callback: (event: CustomEvent) => void) {
    this.eventTarget.removeEventListener(type, callback as EventListener)
  }
}

// 预定义的事件类型
export const NOTIFICATION_EVENTS = {
  LOGIN_SUCCESS: 'notification:login-success',
  LOGOUT: 'notification:logout',
  ERROR: 'notification:error',
} as const

// Hook 使用事件系统
export const useNotificationEvents = () => {
  const manager = NotificationEventManager.getInstance()

  const emitLoginSuccess = () => {
    manager.emit(NOTIFICATION_EVENTS.LOGIN_SUCCESS, {
      type: 'success',
      message: 'login.notifications.loginSuccess',
      delay: 300,
    })
  }

  return { emitLoginSuccess }
}
