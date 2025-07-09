import { AnimatePresence, motion } from 'framer-motion'
import { Check, Globe, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'zh', name: '中文', short: 'ZH' },
  { code: 'en', name: 'English', short: 'EN' },
]

interface LanguageToggleProps {
  variant?: 'icon' | 'text' | 'full'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function LanguageToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
}: LanguageToggleProps) {
  const { i18n } = useTranslation()

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0]

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    localStorage.setItem('language', languageCode)
  }

  const buttonSizes = {
    sm: 'h-8',
    md: 'h-9',
    lg: 'h-10',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const renderTriggerContent = () => {
    switch (variant) {
      case 'text':
        return (
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Languages
              className={cn(iconSizes[size], 'text-muted-foreground')}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={currentLanguage.short}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(textSizes[size], 'font-medium')}
              >
                {currentLanguage.short}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )
      case 'full':
        return (
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-primary/10',
                size === 'sm'
                  ? 'w-6 h-6'
                  : size === 'md'
                    ? 'w-7 h-7'
                    : 'w-8 h-8'
              )}
            >
              <Languages className={cn(iconSizes[size], 'text-primary')} />
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentLanguage.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(textSizes[size], 'font-medium')}
              >
                {currentLanguage.name}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )
      default: // icon
        return (
          <motion.div
            className="flex items-center gap-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20',
                size === 'sm'
                  ? 'w-6 h-6'
                  : size === 'md'
                    ? 'w-7 h-7'
                    : 'w-8 h-8'
              )}
            >
              <Globe
                className={cn(
                  iconSizes[size],
                  'text-blue-600 dark:text-blue-400'
                )}
              />
            </div>
            {showLabel && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentLanguage.short}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs font-semibold text-muted-foreground ml-1"
                >
                  {currentLanguage.short}
                </motion.span>
              </AnimatePresence>
            )}
          </motion.div>
        )
    }
  }

  const buttonWidth =
    variant === 'icon' && !showLabel ? 'w-auto' : 'w-auto px-3'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            buttonWidth,
            buttonSizes[size],
            'relative transition-all duration-300 hover:bg-accent/80 hover:text-accent-foreground',
            'border border-transparent hover:border-border/30 hover:shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'rounded-lg'
          )}
        >
          {renderTriggerContent()}
          <span className="sr-only">切换语言 / Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] p-2 border border-border/50 shadow-lg"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {languages.map((language, index) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={cn(
                'cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-md mb-1 last:mb-0',
                'transition-all duration-200',
                'hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm',
                i18n.language === language.code &&
                  'bg-primary/10 text-primary border border-primary/20'
              )}
            >
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full w-6 h-6',
                    i18n.language === language.code
                      ? 'bg-primary/20'
                      : 'bg-muted/50'
                  )}
                >
                  <Languages
                    className={cn(
                      'h-3 w-3',
                      i18n.language === language.code
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{language.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {language.short}
                  </span>
                </div>
              </motion.div>
              <AnimatePresence>
                {i18n.language === language.code && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </DropdownMenuItem>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
