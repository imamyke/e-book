import { useProgressEffect } from '@/components/ebook/ebookMenu/EbookSettingProgress/useProgressEffect'

export const useEbookEffect = (store) => {
  const { refreshLocation } = useProgressEffect(store)
  const prevPage = () => { // 上一頁
    const rendition = store.getters.currentBook?.rendition
    if (rendition) {
      rendition.prev()
        .then(() => refreshLocation())
        .then(() => hideTitleAndMenu())
    }
  }
  const nextPage = () => { // 下一頁
    const rendition = store.getters.currentBook?.rendition
    if (rendition) {
      rendition.next()
        .then(() => refreshLocation())
        .then(() => hideTitleAndMenu())
    }
  }
  const toggleTitleAndMenu = () => { // 是否顯示標題欄/菜單欄
    if (store.getters.menuVisible) {
      store.dispatch('setSettingVisible', -1)
      store.dispatch('setFontFamilyVisible', false)
    }
    store.dispatch('setMenuVisible', !store.getters.menuVisible)
  }
  const hideTitleAndMenu = () => { // 隱藏標題欄/菜單欄
    store.dispatch('setMenuVisible', false)
    store.dispatch('setSettingVisible', -1)
    store.dispatch('setFontFamilyVisible', false)
  }
  const pullDown = (e) => {
    let offsetY = 0
    if (store.getters.firstOffsetY) {
      offsetY = e.changedTouches[0].clientY - store.getters.firstOffsetY
      store.dispatch('setOffsetY', offsetY)
    } else {
      store.getters.firstOffsetY = e.changedTouches[0].clientY
    }
    e.preventDefault()
    e.stopPropagation()
  }
  const pullDownEnd = () => {
    store.dispatch('setOffsetY', 0)
    store.getters.firstOffsetY = 0
  }
  return {
    prevPage,
    nextPage,
    toggleTitleAndMenu,
    hideTitleAndMenu,
    pullDown,
    pullDownEnd
  }
}
