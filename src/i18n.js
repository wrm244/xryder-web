import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import zh from './locales/zh.json'

// 从localStorage获取保存的语言设置，默认为中文
const savedLanguage = localStorage.getItem('language') || 'zh'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: savedLanguage, // 使用保存的语言设置
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false, // 不需要为 React 转义
  },
})

export default i18n
