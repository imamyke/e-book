<template>
  <ebook-dialog
    :title="title"
    ref="dialog"
  >
    <div
      class="dialog-list-wrapper"
      v-if="!ifNewGroup"
    >
    <template
      v-for="(item, index) in categoryList"
      :key="index"
    >
      <div
        class="dialog-list-item"
        :class="{'is-add': item.edit ? item.edit === 1 : false}"
        @click="onGroupClick(item)"
        v-show="(item.edit === 2 && isInGroup) || item.edit !== 2 || !item.edit"
      >
        <div class="dialog-list-item-text">{{item.title}}</div>
        <div
          class="dialog-list-icon-wrapper"
          v-if="isInGroup && shelfCategory?.id === item.id"
        >
          <span class="icon-check"></span>
        </div>
      </div>
    </template>
    </div>
    <div class="dialog-new-group-wrapper" v-else>
      <div class="dialog-input-title-wrapper">
        <span class="dialog-input-title">{{$t('shelf.groupName')}}</span>
      </div>
      <div class="dialog-input-wrapper">
        <div class="dialog-input-inner-wrapper">
          <input
            type="text"
            class="dialog-input"
            v-model="newGroupName"
            ref="dialogInput"
          >
          <div
            class="dialog-input-clear-wrapper"
            @click="clear"
            v-show="newGroupName && newGroupName.length > 0"
          >
            <span class="icon-close-circle-fill"></span>
          </div>
        </div>
      </div>
    </div>
    <template #btn>
      <div class="group-dialog-btn-wrapper">
        <div
          class="dialog-btn"
          @click="hide"
        >{{$t('shelf.cancel')}}</div>
        <div
          class="dialog-btn"
          @click="createNewGroup"
          :class="{'is-empty': newGroupName && newGroupName.length === 0}"
          v-if="ifNewGroup"
        >{{$t('shelf.confirm')}}
        </div>
      </div>
    </template>
  </ebook-dialog>
</template>

<script>
import EbookDialog from '../common/Dialog'
import { removeAddFromShelf, appendAddToShelf, computeId } from '@/utils/store'
import { saveBookShelf } from '@/utils/localStorage'
import { computed, ref, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
export default {
  name: 'group-dialog',
  components: {
    EbookDialog
  },
  emits: ['toastShow'],
  props: {
    showNewGroup: {
      type: Boolean,
      default: false
    },
    groupName: String
  },
  setup (props, { emit }) {
    const store = useStore()
    const { getters, dispatch } = store
    const { proxy, ctx } = getCurrentInstance()
    const ifNewGroup = ref(false)
    const newGroupName = ref('')
    const shelfCategory = computed(() => {
      return getters.shelfCategory
    })
    const isInGroup = computed(() => {
      return getters.currentType === 2
    })
    const defaultCategory = computed(() => {
      return [
        {
          title: proxy.$t('shelf.newGroup'),
          edit: 1
        },
        {
          title: proxy.$t('shelf.groupOut'),
          edit: 2
        }
      ]
    })
    const category = computed(() => {
      return getters.shelfList.filter(item => item.type === 2)
    })
    const categoryList = computed(() => {
      return [...defaultCategory.value, ...category.value]
    })
    const title = computed(() => {
      return !ifNewGroup.value ? proxy.$t('shelf.moveBook') : proxy.$t('shelf.newGroup')
    })
    const show = () => {
      ifNewGroup.value = props.showNewGroup
      newGroupName.value = props.groupName
      ctx.$refs.dialog.show()
    }
    const hide = () => {
      ctx.$refs.dialog.hide()
      setTimeout(() => {
        ifNewGroup.value = false
      }, 200)
    }
    const toastShow = (text) => {
      emit('toastShow', text)
    }
    const onComplete = () => {
      hide()
      saveBookShelf(getters.shelfList)
      dispatch('setIsEditMode', false)
    }
    const moveOutOfGroup = () => {
      dispatch('setShelfList', getters.shelfList.map(book => {
        if (book.type === 2 && book.itemList) {
          book.itemList = book.itemList.filter(subBook => !subBook.selected)
        } return book
      }))
        .then(() => {
          const list = computeId(appendAddToShelf([].concat(
            removeAddFromShelf(getters.shelfList), ...getters.shelfSelected)))
          dispatch('setShelfList', list)
            .then(() => {
              toastShow(proxy.$t('shelf.moveBookOutSuccess'))
              onComplete()
            })
        })
    }
    const onGroupClick = (item) => {
      if (item.edit && item.edit === 1) {
        ifNewGroup.value = true
      } else if (item.edit && item.edit === 2) {
        moveOutOfGroup()
      } else {
        moveToGroup(item)
      }
    }
    const clear = () => {
      newGroupName.value = ''
    }
    const moveToGroup = (group) => {
      dispatch('setShelfList', getters.shelfList.filter(book => {
        if (book.itemList) {
          book.itemList = book.itemList.filter(subBook => getters.shelfSelected.indexOf(subBook) < 0)
        }
        return getters.shelfSelected.indexOf(book) < 0
      }))
        .then(() => {
          if (group && group.itemList) {
            group.itemList = [...group.itemList, ...getters.shelfSelected]
          }
          group.itemList.forEach((item, index) => {
            item.id = index + 1
          })
          toastShow((proxy.$t('shelf.moveBookInSuccess').replace('$1', group.title)))
          onComplete()
        })
    }
    const createNewGroup = () => {
      if (!newGroupName.value || newGroupName.value.length === 0) {
        return
      }
      if (props.showNewGroup) { // 修改分類名稱
        shelfCategory.value.title = newGroupName.value
        onComplete()
      } else { // 新增分類
        const group = {
          id: getters.shelfList[getters.shelfList.length - 2].id + 1,
          itemList: [],
          selected: false,
          title: newGroupName.value,
          type: 2
        }
        let list = removeAddFromShelf(getters.shelfList)
        list.push(group)
        list = appendAddToShelf(list)
        dispatch('setShelfList', list).then(() => {
          console.log('ok')
          moveToGroup(group)
        })
      }
    }
    return {
      isInGroup,
      defaultCategory,
      category,
      categoryList,
      title,
      ifNewGroup,
      newGroupName,
      shelfCategory,
      show,
      hide,
      clear,
      onGroupClick,
      moveOutOfGroup,
      createNewGroup
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/styles/global.scss';
.dialog-list-wrapper {
  width: 100%;
  padding: 0 px2rem(20);
  box-sizing: border-box;
  font-size: px2rem(14);
  @include scroll;
  .dialog-list-item {
    display: flex;
    padding: px2rem(15) 0;
    box-sizing: border-box;
    color: #666;
    &.is-add {
      color: $color-blue;
      &:active {
        color: $color-blue-transparent;
      }
    }
    &:active {
      color: rgba(102, 102, 102, .5)
    }
    .dialog-list-item-text {
      flex: 1;
    }
    .dialog-list-icon-wrapper {
      flex: 0 0 px2rem(30);
      color: $color-blue;
      @include right;
    }
  }
}

.dialog-new-group-wrapper {
  width: 100%;
  padding: 0 px2rem(20);
  box-sizing: border-box;
  .dialog-input-title-wrapper {
    font-size: px2rem(10);
    margin-top: px2rem(20);
  }
  .dialog-input-wrapper {
    width: 100%;
    padding: 0 0 px2rem(30) 0;
    box-sizing: border-box;
    .dialog-input-inner-wrapper {
      display: flex;
      width: 100%;
      padding: px2rem(10) 0;
      box-sizing: border-box;
      border-bottom: px2rem(1) solid #eee;
      font-size: px2rem(14);
      color: #666;
      .dialog-input {
        flex: 1;
        border: none;
        &:focus {
          outline: none;
        }
      }
      .dialog-input-clear-wrapper {
        flex: 0 0 px2rem(30);
        color: #ccc;
        @include center;
        &:active {
          color: #999;
        }
      }
    }
  }
}

.group-dialog-btn-wrapper {
  width: 100%;
  @include center;
}

.dialog-btn {
  flex: 1;
  &.is-empty {
    color: rgba(255, 255, 255, .5);
  }
  &:active {
    color: rgba(255, 255, 255, .5)
  }
}
</style>
