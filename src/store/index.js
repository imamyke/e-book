import { createStore } from 'vuex'
import book from './modules/book/book'
import { getters } from './getters'

export default createStore({
  state: {
  },
  getters,
  mutations: {
  },
  modules: {
    book
  }
})
