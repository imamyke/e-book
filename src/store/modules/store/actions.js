export const actions = {
  setHotSearchOffsetY: (state, hotSearchOffsetY) => {
    return state.commit('setHotSearchOffsetY', hotSearchOffsetY)
  },
  setFlapCardVisible: (state, flapCardVisible) => {
    return state.commit('setFlapCardVisible', flapCardVisible)
  },
  setIsEditMode: (state, isEditMode) => {
    return state.commit('setIsEditMode', isEditMode)
  },
  setShelfList: (state, list) => {
    return state.commit('setShelfList', list)
  },
  setShelfSelected: (state, selected) => {
    return state.commit('setShelfSelected', selected)
  },
  setShelfTitleVisible: (state, visible) => {
    return state.commit('setShelfTitleVisible', visible)
  },
  setShelfCategory: (state, category) => {
    return state.commit('setShelfCategory', category)
  },
  setCurrentType: (state, type) => {
    return state.commit('setCurrentType', type)
  }
}
