import { ReactNode } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface LanguageAnimationWrapperProps {
  children: ReactNode
  className?: string
}

export function LanguageAnimationWrapper({
  children,
  className = '',
}: LanguageAnimationWrapperProps) {
  const { i18n } = useTranslation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={i18n.language} // 使用语言作为key，语言改变时会触发动画
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1.0], // 自定义缓动函数，更平滑
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// 专门用于文本内容的动画包装器
export function LanguageTextWrapper({
  children,
  className = '',
  delay = 0,
}: LanguageAnimationWrapperProps & { delay?: number }) {
  const { i18n } = useTranslation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={i18n.language}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{
          duration: 0.25,
          delay,
          ease: 'easeOut',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
