import { useEffect } from 'react'

import { Outlet } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const MainLayout: React.FC = () => {
  const { t } = useTranslation()

  // 检查登录成功状态并显示提示
  useEffect(() => {
    const loginSuccess = sessionStorage.getItem('loginSuccess')
    if (loginSuccess === 'true') {
      console.log('Login success detected, showing toast')
      sessionStorage.removeItem('loginSuccess')
      try {
        setTimeout(() => {
          toast.success(t('login.notifications.loginSuccess'))
        }, 100)
      } catch (error) {
        console.error('Toast error:', error)
      }
    }
  }, [t])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout
