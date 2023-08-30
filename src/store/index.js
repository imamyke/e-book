import { createStore } from 'vuex'
import { getters } from './getters'
import book from './modules/book/book'
import store from './modules/store/store'

export default createStore({
  getters,
  modules: {
    book,
    store
  }
})
