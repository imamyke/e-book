import { saveLocation, getReadTime, getBookmark } from '@/utils/localStorage'

export const useProgressEffect = (store) => {
  // 更新此章節的進度百分比
  const refreshLocation = () => {
    const currentLocation = store.getters.currentBook?.rendition.currentLocation()
    const startCfi = currentLocation?.start?.cfi
    if (currentLocation && startCfi) {
      const progress = store.getters.currentBook?.locations.percentageFromCfi(startCfi)
      store.dispatch('setProgress', Math.floor(progress * 100)) // 利用 startCfi 獲取當前進度 => 改變 state: progress
      store.dispatch('setSection', currentLocation.start.index) // 利用 index 獲取目前的章節 => 改變 state: section
      saveLocation(store.getters.fileName, startCfi)
      const bookmark = getBookmark(store.getters.fileName)
      if (bookmark) {
        bookmark.some(item => item.cfi === startCfi)
          ? store.dispatch('setIsBookmark', true)
          : store.dispatch('setIsBookmark', false)
      } else {
        store.dispatch('setIsBookmark', false)
      }
    }
  }
  // 獲取閱讀時間
  const getReadTimeByMinute = () => {
    const readTime = getReadTime(store.getters.fileName)
    if (!readTime) {
      return 0
    } else {
      return Math.ceil(readTime / 60)
    }
  }

  const getReadTimeText = (proxy) => {
    return proxy.$t('book.haveRead').replace('$1', getReadTimeByMinute(store))
  }
  return {
    refreshLocation,
    getReadTimeByMinute,
    getReadTimeText
  }
}
