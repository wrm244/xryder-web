/**
 * @license MIT
 * Created by: joetao
 * Created on: 2025/1/6
 * Project: xryder
 * Description: This is a rapid development template for middle and backend UI based on vite, react, tailwindcss and shadcn.
 */
import { Moon, Sun } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { RiTranslate } from 'react-icons/ri'

import { LanguageToggle } from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

const PersonalSetting = () => {
  const { t } = useTranslation()

  return (
    <div>
      <Helmet>
        <title>{t('personal.title')}</title>
      </Helmet>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">{t('personal.home')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                {t('personal.title')}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container grid gap-2 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('personal.title')}</CardTitle>
            <CardDescription>{t('personal.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={
                'flex justify-between hover:bg-muted/50 p-4 rounded-md'
              }
            >
              <div className={'relative flex items-center gap-4'}>
                <div className="relative h-[1.2rem] w-[1.2rem]">
                  <Sun className="absolute inset-0 h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute inset-0 h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </div>
                <div>
                  <p>{t('personal.darkMode')}</p>
                  <p className={'text-muted-foreground text-sm'}>
                    {t('personal.darkModeDesc')}
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <div
              className={
                'flex justify-between hover:bg-muted/50 p-4 rounded-md'
              }
            >
              <div className={'flex items-center gap-4'}>
                <RiTranslate />
                <div>
                  <p>{t('personal.languageSwitch')}</p>
                  <p className={'text-muted-foreground text-sm'}>
                    {t('personal.languageSwitchDesc')}
                  </p>
                </div>
              </div>
              <LanguageToggle variant="full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PersonalSetting
