import { createI18n } from 'vue-i18n'
import en from './en'
import cn from './cn'
import { getLocale, saveLocale } from '@/utils/localStorage'

let locale = getLocale()
if (!locale) {
  locale = 'cn'
  saveLocale(locale)
}

const messages = {
  en,
  cn
}

const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale,
  messages
})

export default i18n
