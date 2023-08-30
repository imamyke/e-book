<template>
  <div class="store-shelf">
    <shelf-title
      :title="shelfCategory?.title"
      @hidePopup="hidePopup"
      @popupShow="popupShow"
      @dialogShow="dialogShow"
      @toastShow="toastShow"
      ></shelf-title>
    <scroll
      v-if="ifShowList"
      ref="scroll"
      class="store-shelf-scroll-wrapper"
      :top="0"
      :bottom="scrollBottom"
      @onScroll="onScroll"
    >
      <shelf-list
        :top="42"
        :data="shelfCategory.itemList"
      />
    </scroll>
    <!-- 分类列表数据为空时展示内容 -->
    <div v-else class="store-shelf-empty-view">
      {{$t('shelf.groupNone')}}
    </div>
    <shelf-footer
      :isEditMode ="isEditMode"
      :isSelected ="isSelected"
      :isPrivate ="isPrivate"
      :isDownload ="isDownload"
      @dialogClick="dialogShow"
      @popupShow="popupShow"
    />
    <popup
      ref="popup"
      :title="popupTitle"
      :btn="popupBtn"
      @setPrivate="onSetPrivate"
      @setDownload="onSetDownload"
      @setRemoveSelected="onRemoveSelected"
      @setChangeGroupName="onChangeGroupName"
      @setShowDeleteGroup="popupShow"
      @setDeleteGroup="onDeleteGroup"
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
import ShelfFooter from '@/components/shelf/ShelfFooter.vue'
import { saveBookShelf, removeLocalStorage } from '@/utils/localStorage'
import { removeLocalForage } from '@/utils/localForage'
import { useShelfEffect } from '@/components/shelf/useShelfEffect'
import { download } from '@/api/store'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { removeAddFromShelf, appendAddToShelf, computeId } from '@/utils/store'
import {
  ref,
  watch,
  nextTick,
  computed,
  onMounted,
  getCurrentInstance
} from 'vue'

export default {
  name: 'StoreCategory',
  components: {
    ShelfTitle,
    ShelfList,
    ShelfFooter,
    Scroll,
    GroupDialog,
    Toast,
    Popup
  },
  setup () {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const { getCategoryList } = useShelfEffect(store)
    const { getters, dispatch } = store
    const { ctx, proxy } = getCurrentInstance()
    const scrollBottom = ref(0)
    const toastText = ref('')
    const popupTitle = ref('')
    const popupBtn = ref([])
    const showNewGroup = ref(false)
    const groupName = ref('')
    const shelfCategory = computed(() => {
      return getters.shelfCategory
    })
    const shelfList = computed(() => {
      return getters.shelfList
    })
    const emptyCategory = computed(() => {
      return !shelfCategory.value || !shelfCategory.value.itemList || shelfCategory.value.itemList.length === 0
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
    const ifShowList = computed(() => { // 分类列表展示的条件
      return getters.shelfCategory.itemList &&
        getters.shelfCategory.itemList.length > 0
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
    const moveOutOfGroup = () => {
      dispatch('setShelfList', getters.shelfList.map(book => {
        if (book.type === 2 && book.itemList) {
          book.itemList = book.itemList.filter(subBook => !subBook.selected)
        } return book
      }))
        .then(() => {
          const list = computeId(appendAddToShelf([].concat(
            removeAddFromShelf(shelfList.value), ...getters.shelfSelected)))
          store.dispatch('setShelfList', list)
            .then(() => {
              toastShow(proxy.$t('shelf.moveBookOutSuccess'))
              dispatch('setShelfList', shelfList.value.filter(book => book.id !== shelfCategory.value.id))
              onComplete()
              router.go(-1)
            })
        })
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
    const onChangeGroupName = (text) => {
      hidePopup()
      dialogShow(text)
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
    const onDeleteGroup = () => {
      console.log(emptyCategory.value)
      if (!emptyCategory.value) {
        dispatch('setShelfSelected', shelfCategory.value.itemList)
        moveOutOfGroup(onComplete)
      } else {
        onComplete()
      }
    }
    watch(() => getters.isEditMode, (isEditMode) => {
      scrollBottom.value = isEditMode ? 48 : 0
      nextTick(() => {
        ctx.$refs.scroll?.refresh()
      })
    })
    onMounted(() => {
      getCategoryList(route.query.title) // 获取分类列表数据
      dispatch('setCurrentType', 2) // 标记currentType为2，对于不同的currentType，ShelfTitle将呈现不同状态
    })
    return {
      shelfList,
      toastText,
      scrollBottom,
      showNewGroup,
      groupName,
      isEditMode,
      isSelected,
      isPrivate,
      ifShowList,
      isDownload,
      shelfCategory,
      popupTitle,
      popupBtn,
      onScroll,
      popupShow,
      hidePopup,
      dialogShow,
      toastShow,
      onSetPrivate,
      onSetDownload,
      onChangeGroupName,
      onRemoveSelected,
      onDeleteGroup
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
  .store-shelf-empty-view {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 100%;
    font-size: px2rem(14);
    color: #333;
    @include center;
  }
}
</style>
