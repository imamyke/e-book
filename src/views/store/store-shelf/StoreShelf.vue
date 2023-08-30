<template>
  <div class="store-shelf">
    <shelf-title
      :title="$t('shelf.title')"
      @hidePopup="hidePopup"
      @popupShow="popupShow"
      @dialogShow="dialogShow"
      @toastShow="toastShow"
    ></shelf-title>
    <scroll
      class="store-shelf-scroll-wrapper"
      :top="0"
      :bottom="scrollBottom"
      @onScroll="onScroll"
      ref="scroll"
    >
      <shelf-search></shelf-search>
      <shelf-list :data="shelfList"></shelf-list>
    </scroll>
    <shelf-footer
      :isEditMode ="isEditMode"
      :isSelected ="isSelected"
      :isPrivate ="isPrivate"
      :isDownload ="isDownload"
      @dialogShow="dialogShow"
      @popupShow="popupShow"
    ></shelf-footer>
    <popup
      ref="popup"
      :title="popupTitle"
      :btn="popupBtn"
      @setPrivate="onSetPrivate"
      @setDownload="onSetDownload"
      @setRemoveSelected="onRemoveSelected"
    ></popup>
    <group-dialog
      ref="dialog"
      :showNewGroup="showNewGroup"
      :groupName="groupName"
      @toastShow="toastShow"
    />
  </div>
  <toast
    ref="toast"
    :text="toastText"
  ></toast>
</template>

<script>
import Scroll from '@/components/common/Scroll.vue'
import Toast from '@/components/common/Toast.vue'
import Popup from '@/components/common/Popup.vue'
import GroupDialog from '@/components/shelf/ShelfGroupDialog.vue'
import ShelfTitle from '@/components/shelf/ShelfTitle.vue'
import ShelfList from '@/components/shelf/ShelfList.vue'
import ShelfSearch from '@/components/shelf/ShelfSearch.vue'
import ShelfFooter from '@/components/shelf/ShelfFooter.vue'
import { ref, watch, onMounted, nextTick, getCurrentInstance, computed } from 'vue'
import { useStore } from 'vuex'
import { useShelfEffect } from '@/components/shelf/useShelfEffect'
import { download } from '@/api/store'
import { saveBookShelf, removeLocalStorage } from '@/utils/localStorage'
import { removeLocalForage } from '@/utils/localForage'
export default {
  name: 'StoreShelf',
  components: {
    Scroll,
    ShelfList,
    ShelfSearch,
    ShelfFooter,
    ShelfTitle,
    GroupDialog,
    Toast,
    Popup
  },
  setup () {
    const store = useStore()
    const { dispatch, getters } = store
    const { ctx, proxy } = getCurrentInstance()
    const { getShelfList } = useShelfEffect(store)
    const scrollBottom = ref(0)
    const toastText = ref('')
    const popupTitle = ref('')
    const popupBtn = ref([])
    const showNewGroup = ref(false)
    const groupName = ref('')
    const shelfList = computed(() => {
      return getters.shelfList
    })
    const isEditMode = computed(() => {
      return getters.isEditMode
    })
    const isSelected = computed(() => {
      return getters.shelfSelected && getters.shelfSelected.length > 0
    })
    const isPrivate = computed(() => {
      if (!isSelected.value) {
        return false
      } else {
        return getters.shelfSelected.every(item => item.private)
      }
    })
    const isDownload = computed(() => {
      if (!isSelected.value) {
        return false
      } else {
        return getters.shelfSelected.every(item => item.cache)
      }
    })

    const onScroll = (offsetY) => {
      dispatch('setOffsetY', offsetY)
    }
    const hidePopup = () => {
      ctx.$refs.popup.hide()
    }
    const toastShow = (text) => {
      toastText.value = text
      ctx.$refs.toast.show()
    }
    const continueShow = (text) => {
      toastText.value = text
      ctx.$refs.toast.continueShow()
    }
    const popupShow = (text) => {
      popupTitle.value = text.title
      popupBtn.value = text.btn
      ctx.$refs.popup.show()
    }
    const dialogShow = (text) => {
      showNewGroup.value = text.showNewGroup
      groupName.value = text.groupName
      ctx.$refs.dialog.show()
    }
    const onComplete = () => {
      hidePopup()
      dispatch('setIsEditMode', false)
      saveBookShelf(getters.shelfList)
    }
    const onSetPrivate = () => {
      let isPrivateValue
      if (isPrivate.value) {
        isPrivateValue = false
      } else {
        isPrivateValue = true
      }
      getters.shelfSelected.forEach(book => {
        book.private = isPrivateValue
      })
      if (isPrivate.value) {
        toastShow(proxy.$t('shelf.setPrivateSuccess'))
      } else {
        dispatch('setShelfSelected', []) // 選中書櫃清空
        toastShow(proxy.$t('shelf.closePrivateSuccess'))
      }
      onComplete()
    }
    const downloadBook = (book) => { // 待修改
      let text = ''
      continueShow(text)
      return new Promise((resolve, reject) => {
        download(book, book => {
          ctx.$refs.toast.hide()
          resolve(book)
        }, reject, progressEvent => {
          const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
          text = proxy.$t('shelf.progressDownload').replace('$1', `${book.fileName}.epub(${progress})`)
          toastText.value = text
        })
      })
    }
    const downloadSelectedBook = async () => {
      for (let i = 0; i < getters.shelfSelected.length; i++) {
        await downloadBook(getters.shelfSelected[i])
          .then(book => {
            book.cache = true
          })
      }
    }
    const removeBook = (book) => {
      return new Promise((resolve, reject) => {
        removeLocalStorage(`${book.categoryText}/${book.fileName}-info`)
        removeLocalForage(`${book.fileName}`)
        resolve(book)
      })
    }
    const removeSelectedBook = () => {
      Promise.all(getters.shelfSelected.map(book => removeBook(book)))
        .then(books => {
          // eslint-disable-next-line array-callback-return
          books.map(book => {
            book.cache = false
          })
          saveBookShelf(getters.shelfList)
          toastShow(proxy.$t('shelf.removeDownloadSuccess'))
        })
    }
    const onRemoveSelected = () => {
      getters.shelfSelected.forEach(selected => {
        dispatch('setShelfList', getters.shelfList.filter(book => book !== selected))
      })
      dispatch('setShelfSelected', [])
      onComplete()
    }
    const onSetDownload = async () => {
      onComplete()
      if (isDownload.value) {
        removeSelectedBook()
      } else {
        await downloadSelectedBook()
        saveBookShelf(getters.shelfList)
        toastShow(proxy.$t('shelf.setDownloadSuccess'))
      }
    }
    watch(() => getters.isEditMode, (isEditMode) => {
      scrollBottom.value = isEditMode ? 48 : 0
      nextTick(() => {
        ctx.$refs.scroll.refresh()
      })
    })
    onMounted(() => {
      getShelfList()
      dispatch('setShelfCategory', [])
      dispatch('setCurrentType', 1)
    })
    return {
      onScroll,
      hidePopup,
      dialogShow,
      toastShow,
      popupShow,
      onSetPrivate,
      onSetDownload,
      onRemoveSelected,
      isEditMode,
      isSelected,
      isPrivate,
      isDownload,
      shelfList,
      toastText,
      popupTitle,
      popupBtn,
      scrollBottom,
      showNewGroup,
      groupName
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/global.scss';
.store-shelf {
  position: relative;
  z-index: 100;
  width: 100%;
  height: 100%;
  background: white;
  .store-shelf-scroll-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 101;
  }
}
</style>
