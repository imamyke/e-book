export const state = {
  fileName: '',
  menuVisible: false,
  settingVisible: -1, // -1: 不顯示, 0: 字號, 1: 主題, 2: 進度, 3: 目錄
  defaultFontSize: 16,
  currentBook: null,
  defaultFontFamily: 'Default',
  fontFamilyVisible: false,
  defaultTheme: 'Default',
  bookAvailable: false, // 分頁完成
  progress: 0,
  section: 0,
  isPaginating: true,
  navigation: null,
  cover: null,
  metadata: null,
  paginate: '',
  pageList: null,
  offsetY: 0,
  isBookmark: null
}
