export const getters = {
  fileName: (state) => {
    return state.book.fileName
  },
  menuVisible: (state) => {
    return state.book.menuVisible
  },
  settingVisible: (state) => {
    return state.book.settingVisible
  },
  defaultFontSize: (state) => {
    return state.book.defaultFontSize
  },
  currentBook: (state) => {
    return state.book.currentBook
  },
  defaultFontFamily: (state) => {
    return state.book.defaultFontFamily
  },
  fontFamilyVisible: (state) => {
    return state.book.fontFamilyVisible
  },
  defaultTheme: (state) => {
    return state.book.defaultTheme
  },
  bookAvailable: (state) => {
    return state.book.bookAvailable
  },
  progress: (state) => {
    return state.book.progress
  },
  section: (state) => {
    return state.book.section
  },
  isPaginating: (state) => {
    return state.book.isPaginating
  },
  navigation: (state) => {
    return state.book.navigation
  },
  cover: (state) => {
    return state.book.cover
  },
  metadata: (state) => {
    return state.book.metadata
  },
  paginate: (state) => {
    return state.book.paginate
  },
  pageList: (state) => {
    return state.book.pageList
  },
  offsetY: (state) => {
    return state.book.offsetY
  },
  isBookmark: (state) => {
    return state.book.isBookmark
  }
}
