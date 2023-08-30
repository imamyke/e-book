export const mutations = {
  setHotSearchOffsetY: (state, hotSearchOffsetY) => {
    state.hotSearchOffsetY = hotSearchOffsetY
  },
  setFlapCardVisible: (state, flapCardVisible) => {
    state.flapCardVisible = flapCardVisible
  },
  setIsEditMode: (state, isEditMode) => {
    state.isEditMode = isEditMode
  },
  setShelfList: (state, list) => {
    state.shelfList = list
  },
  setShelfSelected: (state, selected) => {
    state.shelfSelected = selected
  },
  setShelfTitleVisible: (state, visible) => {
    state.shelfTitleVisible = visible
  },
  setShelfCategory: (state, category) => {
    state.shelfCategory = category
  },
  setCurrentType: (state, type) => {
    state.currentType = type
  }
}
