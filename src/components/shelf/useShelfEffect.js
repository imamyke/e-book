import { shelf } from '@/api/store'
import { appendAddToShelf } from '@/utils/store'
import {
  getBookShelf,
  saveBookShelf
} from '@/utils/localStorage'

export const useShelfEffect = (store) => {
  const getCategoryList = (title) => {
    getShelfList().then(() => {
      const categoryList = store.getters.shelfList.filter(book => book.type === 2 && book.title === title)[0]
      store.dispatch('setShelfCategory', categoryList)
    })
  }
  const getShelfList = () => {
    let shelfList = getBookShelf()
    if (!shelfList) {
      shelf().then(response => {
        if (response.status === 200 && response.data && response.data.bookList) {
          shelfList = appendAddToShelf(response.data.bookList) // 增加 type == 3 的 add page
          saveBookShelf(shelfList)
          return store.dispatch('setShelfList', shelfList)
        }
      })
    } else {
      return store.dispatch('setShelfList', shelfList)
    }
  }

  return {
    getCategoryList,
    getShelfList
  }
}
