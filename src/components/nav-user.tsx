'use client'

import { Dialog } from '@radix-ui/react-dialog'

import { useCallback, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  BadgeInfo,
  ChevronsUpDown,
  Headset,
  LogOut,
  UserCog,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useDialog } from '@/components/use-dialog'
import { logoImg } from '@/utils'

interface User {
  username: string
  nickname: string
  avatar: string
}

interface NavUserProps {
  user: User
  logout: () => void
}

export function NavUser({ user, logout }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const aboutDialog = useDialog()
  const navigate = useNavigate()

  const supportDialog = useDialog()

  const handleLogout = useCallback(async () => {
    try {
      // 立即关闭下拉菜单
      setIsOpen(false)

      // 使用双重动画帧确保UI完全更新
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          logout()
        })
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [logout])
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={'data:image/png;base64,' + user.avatar}
                  alt={user.nickname}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.nickname}</span>
                <span className="truncate text-xs">{user.username}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={'data:image/png;base64,' + user.avatar}
                    alt={user.nickname}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.nickname}
                  </span>
                  <span className="truncate text-xs">{user.username}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/account')}>
                <UserCog className={'size-4 mr-2'} />
                {t('nav.user.accountSettings')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/personal')}>
                <UserCog className={'size-4 mr-2'} />
                {t('nav.user.personalSettings')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem {...supportDialog.triggerProps}>
                <Headset className={'size-4 mr-2'} />
                {t('nav.user.techSupport')}
              </DropdownMenuItem>
              <DropdownMenuItem {...aboutDialog.triggerProps}>
                <BadgeInfo className={'size-4 mr-2'} />
                {t('nav.user.about')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className={'size-4 mr-2'} />
              {t('nav.user.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <Dialog {...aboutDialog.dialogProps}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <BadgeInfo className={'text-sky-500 inline mr-2 mb-1'} />
              {t('nav.user.aboutTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('nav.user.aboutDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="container mx-auto text-center">
            <img
              src={logoImg}
              alt={'logo'}
              className="mx-auto mb-4 w-20 h-auto"
            />
            <p className="text-sm">
              {t('nav.user.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog {...supportDialog.dialogProps}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Headset className={'text-sky-500 inline mr-2 mb-1'} />
              {t('nav.user.supportTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('nav.user.supportDescription')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  )
}
