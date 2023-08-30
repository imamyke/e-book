<template>
  <div
    class="shelf-item"
    :class="{'shelf-item-shadow': data.type === 1 || data.type === 2}"
    @click="onItemClick">
    <component
      class="shelf-item-comp"
      :class="{'is-edit': isEditMode && data.type === 2}"
      :is="item"
      :data="data"
    />
    <div
      class="icon-selected"
      :class="{'is-selected': data.selected}"
      v-show="isEditMode && data.type === 1"
    />
  </div>
</template>

<script>
import { computed, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { gotoStoreHome } from '@/utils/store'
import { useStoreEffect } from '@/components/store/useStoreEffect'
import ShelfItemAdd from './ShelfItemAdd.vue'
import ShelfItemBook from './ShelfItemBook.vue'
import ShelfItemCategory from './ShelfItemCategory.vue'

export default {
  name: 'ShelfItem',
  props: ['data'],
  setup (props) {
    const router = useRouter()
    const { showBookDetail } = useStoreEffect(router)
    const { proxy } = getCurrentInstance()
    const { getters, dispatch } = useStore()
    const add = ShelfItemAdd
    const book = ShelfItemBook
    const category = ShelfItemCategory
    const item = computed(() => {
      return props.data.type === 1 ? book : (props.data.type === 2 ? category : add)
    })
    const isEditMode = computed(() => {
      return getters.isEditMode
    })
    const onItemClick = (e) => {
      if (isEditMode.value) { // 編輯模式
        // eslint-disable-next-line vue/no-mutating-props
        props.data.selected = !props.data.selected
        if (props.data.selected) { // 選中時將 data 放進 shelfSelected
          getters.shelfSelected.pushWithoutDuplicate(props.data)
        } else {
          dispatch('setShelfSelected', getters.shelfSelected.filter(item => item.id !== props.data.id))
        }
      } else {
        if (props.data.type === 1) {
          showBookDetail(props.data)
        } else if (props.data.type === 2) {
          router.push({
            path: '/store/category',
            query: {
              title: props.data.title
            }
          })
        } else {
          gotoStoreHome(proxy)
        }
      }
    }
    return {
      onItemClick,
      item,
      isEditMode,
      add,
      book,
      category
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/global.scss';
.shelf-item {
  position: relative;
  width: 100%;
  height: 100%;
  &.shelf-item-shadow {
    box-shadow: px2rem(2) px2rem(2) px2rem(6) px2rem(2) rgba(200, 200, 200, .3);
  }
  .shelf-item-comp {
    opacity: 1;
    &.is-edit {
      opacity: .5;
    }
  }
  .icon-selected {
    position: absolute;
    bottom: px2rem(2);
    right: px2rem(2);
    font-size: px2rem(18);
    color: rgba(0, 0, 0, .4);
    &.is-selected {
      color: $color-blue;
    }
  }
}
</style>
