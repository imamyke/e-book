export const mutations = {
  setFileName: (state, fileName) => {
    state.fileName = fileName
  },
  setMenuVisible: (state, menuVisible) => {
    state.menuVisible = menuVisible
  },
  setSettingVisible: (state, settingVisible) => {
    state.settingVisible = settingVisible
  },
  setDefaultFontSize: (state, defaultFontSize) => {
    state.defaultFontSize = defaultFontSize
  },
  setCurrentBook: (state, currentBook) => {
    state.currentBook = currentBook
  },
  setDefaultFontFamily: (state, defaultFontFamily) => {
    state.defaultFontFamily = defaultFontFamily
  },
  setFontFamilyVisible: (state, fontFamilyVisible) => {
    state.fontFamilyVisible = fontFamilyVisible
  },
  setDefaultTheme: (state, defaultTheme) => {
    state.defaultTheme = defaultTheme
  },
  setBookAvailable: (state, bookAvailable) => {
    state.bookAvailable = bookAvailable
  },
  setProgress: (state, progress) => {
    state.progress = progress
  },
  setSection: (state, section) => {
    state.section = section
  },
  setIsPaginating: (state, isPaginating) => {
    state.isPaginating = isPaginating
  },
  setNavigation: (state, navigation) => {
    state.navigation = navigation
  },
  setCover: (state, cover) => {
    state.cover = cover
  },
  setMetadata: (state, metadata) => {
    state.metadata = metadata
  },
  setPaginate: (state, paginate) => {
    state.paginate = paginate
  },
  setPageList: (state, pageList) => {
    state.pageList = pageList
  },
  setOffsetY: (state, offsetY) => {
    state.offsetY = offsetY
  },
  setIsBookmark: (state, isBookmark) => {
    state.isBookmark = isBookmark
  }
}
