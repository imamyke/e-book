import Storage from 'web-storage-cache'

const localStorage = new Storage()

export const setLocalStorage = (key, value) => {
  return localStorage.set(key, value)
}

export const getLocalStorage = (key) => {
  return localStorage.get(key)
}

export const removeLocalStorage = (key) => {
  return localStorage.delete(key)
}

export const clearLocalStorage = () => {
  return localStorage.clear()
}

// 電子書
export const setBookObject = (fileName, key, value) => {
  let book = getLocalStorage(`${fileName}-info`)
  if (!book) {
    book = {}
  }
  book[key] = value
  setLocalStorage(`${fileName}-info`, book)
}

export const getBookObject = (fileName, key) => {
  const book = getLocalStorage(`${fileName}-info`)
  return book ? book[key] : null
}

// 書櫃
export const saveBookShelf = (shelf) => {
  return setLocalStorage('shelf', shelf)
}

export const getBookShelf = () => {
  return getLocalStorage('shelf')
}

// 獲取默認顯示的語言
export const getLocale = () => {
  return getLocalStorage('locale')
}

// 設定默認顯示的語言
export const saveLocale = (locale) => {
  return setLocalStorage('locale', locale)
}

// 獲取閱讀進度 Cfi
export const getLocation = (fileName) => {
  return getBookObject(fileName, 'location')
}

// 設定閱讀進度 Cfi
export const saveLocation = (fileName, location) => {
  setBookObject(fileName, 'location', location)
}

// 書籤
export const getBookmark = (fileName) => {
  return getBookObject(fileName, 'bookmark')
}

export const saveBookmark = (fileName, bookmark) => {
  setBookObject(fileName, 'bookmark', bookmark)
}

// 閱讀時間
export const getReadTime = (fileName) => {
  return getBookObject(fileName, 'time')
}

export const saveReadTime = (fileName, theme) => {
  setBookObject(fileName, 'time', theme)
}

// 閱讀進度
export const getProgress = (fileName) => {
  return getBookObject(fileName, 'progress')
}

export const saveProgress = (fileName, progress) => {
  setBookObject(fileName, 'progress', progress)
}

//
export const getNavigation = (fileName) => {
  return getBookObject(fileName, 'navigation')
}

export const saveNavigation = (fileName, navigation) => {
  setBookObject(fileName, 'navigation', navigation)
}

//
export const getMetadata = (fileName) => {
  return getBookObject(fileName, 'metadata')
}

export const saveMetadata = (fileName, metadata) => {
  setBookObject(fileName, 'metadata', metadata)
}

// 封面
export const getCover = (fileName) => {
  return getBookObject(fileName, 'cover')
}

export const saveCover = (fileName, cover) => {
  setBookObject(fileName, 'cover', cover)
}

// 字體
export const getFontFamily = (fileName) => {
  return getBookObject(fileName, 'fontFamily')
}

export const saveFontFamily = (fileName, font) => {
  return setBookObject(fileName, 'fontFamily', font)
}

// 字體大小
export const getFontSize = (fileName) => {
  return getBookObject(fileName, 'fontSize')
}

export const saveFontSize = (fileName, fontSize) => {
  setBookObject(fileName, 'fontSize', fontSize)
}

// 主題
export const getTheme = (fileName) => {
  return getBookObject(fileName, 'theme')
}

export const saveTheme = (fileName, theme) => {
  setBookObject(fileName, 'theme', theme)
}
