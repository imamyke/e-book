<template>
  <transition name="fade">
    <div
      class="shelf-title"
      :class="{'hide-shadow': ifHideShadow}"
      v-show="shelfTitleVisible"
    >
      <div class="shelf-title-text-wrapper">
        <span class="shelf-title-text">{{title}}</span>
        <span
          class="shelf-title-sub-text"
          v-show="isEditMode"
        >{{selectedText}}</span>
      </div>
      <div
        class="shelf-title-btn-wrapper shelf-title-left"
        v-if="showClear"
      >
        <span
          class="shelf-title-btn-text"
          @click="clearCache"
        >{{$t('shelf.clearCache')}}</span>
      </div>
      <div
        class="shelf-title-btn-wrapper shelf-title-right"
        v-if="showEdit"
      >
        <span
          class="shelf-title-btn-text"
          @click="onEditClick"
        >{{isEditMode ? $t('shelf.cancel') : $t('shelf.edit')}}</span>
      </div>
      <div
        class="shelf-title-btn-wrapper shelf-title-left"
        v-if="showBack"
      >
        <span class="icon-back" @click="back"></span>
      </div>
      <div
        class="shelf-title-btn-wrapper"
        :class="{'shelf-title-left': changeGroupLeft, 'shelf-title-right': changeGroupRight}"
        @click="changeGroup"
        v-if="showChangeGroup"
      >
        <span class="shelf-title-btn-text">{{$t('shelf.editGroup')}}</span>
      </div>
    </div>
  </transition>
</template>

<script>
import { computed, ref, watch, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { clearLocalStorage } from '@/utils/localStorage'
import { clearLocalForage } from '@/utils/localForage'
import { useShelfEffect } from '@/components/shelf/useShelfEffect'

export default {
  name: 'ShelfTitle',
  props: ['title'],
  emits: [
    'toastShow',
    'hidePopup',
    'popupShow',
    'dialogShow'
  ],
  setup (props, { emit }) {
    const store = useStore()
    const { getters, dispatch } = store
    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const ifHideShadow = ref(true)
    const { getShelfList } = useShelfEffect(store)
    const isEditMode = computed(() => {
      return getters.isEditMode
    })
    const shelfTitleVisible = computed(() => {
      return getters.shelfTitleVisible
    })
    const emptyCategory = computed(() => {
      return !getters.shelfCategory || !getters.shelfCategory.itemList || getters.shelfCategory.itemList.length === 0
    })
    const showEdit = computed(() => {
      return getters.currentType === 1 || !emptyCategory.value
    })
    const showClear = computed(() => {
      return getters.currentType === 1
    })
    const showBack = computed(() => {
      return getters.currentType === 2 && !isEditMode.value
    })
    const showChangeGroup = computed(() => {
      return getters.currentType === 2 && (isEditMode.value || emptyCategory.value)
    })
    const changeGroupLeft = computed(() => {
      return !emptyCategory.value
    })
    const changeGroupRight = computed(() => {
      return emptyCategory.value
    })
    const selectedText = computed(() => {
      const selectedNumber = getters.shelfSelected ? getters.shelfSelected.length : 0
      return selectedNumber <= 0 ? proxy.$t('shelf.selectBook') : (selectedNumber === 1 ? proxy.$t('shelf.haveSelectedBook').replace('$1', selectedNumber) : proxy.$t('shelf.haveSelectedBooks').replace('$1', selectedNumber))
    })
    const popupCancelBtn = computed(() => {
      return createPopupBtn(proxy.$t('shelf.cancel'), () => hidePopup())
    })
    const onEditClick = () => {
      dispatch('setIsEditMode', !isEditMode.value)
      if (!isEditMode.value) {
        dispatch('setShelfSelected', []) // 選中書櫃清空
        getters.shelfList.forEach(item => { // 選中的書 selected 屬性設為 false
          item.selected = false
          if (item.itemList) {
            item.itemList.forEach(subItem => {
              subItem.selected = false
            })
          }
        })
      }
    }
    const hidePopup = () => {
      emit('hidePopup', 'hidePopup')
    }
    const toastShow = (text) => {
      emit('toastShow', text)
    }
    const popupShow = (text) => {
      emit('popupShow', text)
    }
    const createPopupBtn = (text, onClick, type = 'normal') => {
      return {
        text: text,
        type: type,
        click: onClick
      }
    }
    const changeGroup = () => {
      popupShow({
        btn: [
          createPopupBtn(proxy.$t('shelf.editGroupName'), 'changeGroupName'),
          createPopupBtn(proxy.$t('shelf.deleteGroup'), 'showDeleteGroup', 'danger'),
          popupCancelBtn.value
        ]
      })
    }
    const back = () => {
      router.go(-1)
      dispatch('setIsEditMode', false)
    }
    const clearCache = () => {
      clearLocalStorage()
      clearLocalForage()
      dispatch('setShelfList', [])
      dispatch('setShelfSelected', [])
      getShelfList()
      toastShow(proxy.$t('shelf.clearCacheSuccess'))
    }
    watch(() => getters.offsetY, (newOffsetY) => {
      if (newOffsetY > 0) {
        ifHideShadow.value = false
      } else {
        ifHideShadow.value = true
      }
    })
    return {
      back,
      onEditClick,
      changeGroup,
      createPopupBtn,
      clearCache,
      shelfTitleVisible,
      ifHideShadow,
      showEdit,
      showClear,
      showBack,
      showChangeGroup,
      changeGroupLeft,
      changeGroupRight,
      selectedText,
      popupCancelBtn,
      isEditMode
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/styles/global.scss';

.shelf-title {
  position: relative;
  z-index: 130;
  width: 100%;
  height: px2rem(42);
  background: white;
  box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, .1);
  &.hide-shadow {
    box-shadow: none;
  }
  .shelf-title-text-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: px2rem(42);
    @include columnCenter;
    .shelf-title-text {
      font-size: px2rem(16);
      line-height: px2rem(20);
      font-weight: bold;
      color: #333;
    }
    .shelf-title-sub-text {
      font-size: px2rem(10);
      color: #333;
    }
  }
  .shelf-title-btn-wrapper {
    position: absolute;
    top: 0;
    box-sizing: border-box;
    height: 100%;
    @include center;
    .shelf-title-btn-text {
      font-size: px2rem(14);
      color: #666;
    }
    .icon-back {
      font-size: px2rem(20);
      color: #666;
    }
    &.shelf-title-left {
      left: 0;
      padding-left: px2rem(15);
    }
    &.shelf-title-right {
      right: 0;
      padding-right: px2rem(15);
    }
  }
}
</style>
