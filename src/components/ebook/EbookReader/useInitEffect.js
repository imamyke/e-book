import { addCss, removeAllCss, flatten } from '@/utils/book'
import {
  getFontFamily,
  saveFontFamily,
  getFontSize,
  saveFontSize,
  getTheme,
  saveTheme
} from '@/utils/localStorage'
import { useProgressEffect } from '@/components/ebook/ebookMenu/EbookSettingProgress/useProgressEffect'
import { useEbookEffect } from './useEbookEffect'

export const useInitEffect = (store) => {
  const { refreshLocation } = useProgressEffect(store)
  const { hideTitleAndMenu } = useEbookEffect(store)
  const initFontFamily = () => {
    const fontFamily = getFontFamily(store.getters.fileName)
    if (!fontFamily) {
      saveFontFamily(store.getters.fileName, store.getters.defaultFontFamily)
    } else {
      store.getters.currentBook?.rendition.themes.font(fontFamily)
      store.dispatch('setDefaultFontFamily', fontFamily)
    }
  }
  const initFontSize = () => {
    const fontSize = getFontSize(store.getters.fileName)
    if (!fontSize) {
      saveFontSize(store.getters.fileName, store.getters.defaultFontSize)
    } else {
      store.getters.currentBook?.rendition.themes.fontSize(fontSize)
      store.dispatch('setDefaultFontSize', fontSize)
    }
  }
  const initTheme = (themes) => {
    let defaultTheme = getTheme(store.getters.fileName)
    if (!defaultTheme) {
      defaultTheme = themes.value[0].name
      saveTheme(store.getters.fileName, defaultTheme) // 保存主題
    }
    store.dispatch('setDefaultTheme', defaultTheme) // 設置 default 主題
    themes.value.forEach(theme => {
      store.getters.currentBook?.rendition.themes.register(theme.name, theme.style)
    })
    store.getters.currentBook?.rendition.themes.select(defaultTheme)
  }
  const initGlobalStyle = () => {
    removeAllCss()
    if (store.getters.defaultTheme === 'Eye') {
      addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
    } else if (store.getters.defaultTheme === 'Gold') {
      addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
    } else if (store.getters.defaultTheme === 'Night') {
      addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
    } else {
      addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
    }
  }
  const parseBook = () => {
    store.getters.currentBook?.loaded.cover.then(cover => {
      store.getters.currentBook?.archive.createUrl(cover)
        .then(url => {
          store.dispatch('setCover', url)
        })
    })
    store.getters.currentBook?.loaded.metadata.then(metadata => {
      store.dispatch('setMetadata', metadata)
    })
    store.getters.currentBook?.loaded.navigation.then(nav => {
      const navigation = flatten(nav.toc)
      const find = (item, level = 0) => {
        if (!item.parent) {
          return level
        } else {
          return find(navigation.filter(parentItem => parentItem.id === item.parent)[0], ++level)
        }
      }
      navigation.forEach(item => {
        item.level = find(item)
      })
      store.dispatch('setNavigation', navigation)
    })
  }
  const display = (target, cb) => {
    if (target) {
      store.getters.currentBook?.rendition.display(target)
        .then(() => {
          refreshLocation()
          if (cb) cb()
        })
    } else {
      store.getters.currentBook?.rendition.display()
        .then(() => {
          refreshLocation()
          if (cb) cb()
        })
    }
    hideTitleAndMenu()
  }

  return {
    initFontFamily,
    initFontSize,
    initTheme,
    initGlobalStyle,
    parseBook,
    display
  }
}
