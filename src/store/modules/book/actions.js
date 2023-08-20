export const actions = {
  setFileName: (state, fileName) => {
    return state.commit('setFileName', fileName)
  },
  setMenuVisible: (state, menuVisible) => {
    return state.commit('setMenuVisible', menuVisible)
  },
  setSettingVisible: (state, settingVisible) => {
    return state.commit('setSettingVisible', settingVisible)
  },
  setDefaultFontSize: (state, defaultFontSize) => {
    return state.commit('setDefaultFontSize', defaultFontSize)
  },
  setCurrentBook: (state, currentBook) => {
    return state.commit('setCurrentBook', currentBook)
  },
  setDefaultFontFamily: (state, defaultFontFamily) => {
    return state.commit('setDefaultFontFamily', defaultFontFamily)
  },
  setFontFamilyVisible: (state, fontFamilyVisible) => {
    return state.commit('setFontFamilyVisible', fontFamilyVisible)
  },
  setDefaultTheme: (state, defaultTheme) => {
    return state.commit('setDefaultTheme', defaultTheme)
  },
  setBookAvailable: (state, bookAvailable) => {
    return state.commit('setBookAvailable', bookAvailable)
  },
  setProgress: (state, progress) => {
    return state.commit('setProgress', progress)
  },
  setSection: (state, section) => {
    return state.commit('setSection', section)
  },
  setIsPaginating: (state, isPaginating) => {
    return state.commit('setIsPaginating', isPaginating)
  },
  setNavigation: (state, navigation) => {
    return state.commit('setNavigation', navigation)
  },
  setCover: (state, cover) => {
    return state.commit('setCover', cover)
  },
  setMetadata: (state, metadata) => {
    return state.commit('setMetadata', metadata)
  },
  setPaginate: (state, paginate) => {
    return state.commit('setPaginate', paginate)
  },
  setPageList: (state, pageList) => {
    return state.commit('setPageList', pageList)
  },
  setOffsetY: (state, offsetY) => {
    return state.commit('setOffsetY', offsetY)
  },
  setIsBookmark: (state, isBookmark) => {
    return state.commit('setIsBookmark', isBookmark)
  }
}
