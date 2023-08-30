<template>
  <div class="popup" v-if="popupVisible">
  <transition name="fade">
    <div
      class="popup-bg"
      @click.stop.prevent="hide"
      v-show="popupVisible"
    />
  </transition>
  <transition name="popup-slide-up">
    <div class="popup-wrapper" v-show="visible">
      <div
        class="popup-title"
        v-if="title && title.length > 0"
      >
        {{title}}
      </div>
      <div
        class="popup-btn"
        :class="{'danger':item.type==='danger'}"
        v-for="(item, index) in btn"
        :key="index"
        @click="item.click === 'setPrivate'
          ? onSetPrivate()
          : item.click === 'setDownload'
          ? onSetDownload()
          : item.click === 'setRemoveSelected'
          ? onRemoveSelected()
          : item.click === 'changeGroupName'
          ? onChangeGroupName()
          : item.click === 'showDeleteGroup'
          ? onShowDeleteGroup()
          : item.click === 'deleteGroup'
          ? onDeleteGroup()
          : hide()"
        >
          {{item.text}}
        </div>
    </div>
  </transition>
</div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'popup',
  props: ['title', 'btn'],
  emits: [
    'setPrivate',
    'setDownload',
    'setRemoveSelected',
    'setChangeGroupName',
    'setShowDeleteGroup',
    'setDeleteGroup'
  ],
  setup (props, { emit }) {
    const { proxy } = getCurrentInstance()

    const store = useStore()
    const { getters } = store
    const popupVisible = ref(false)
    const visible = ref(false)
    const createPopupBtn = (text, onClick, type = 'normal') => {
      return {
        text: text,
        type: type,
        click: onClick
      }
    }
    const show = () => {
      popupVisible.value = true
      setTimeout(() => {
        visible.value = true
      })
    }
    const hide = () => {
      visible.value = false
      setTimeout(() => {
        popupVisible.value = false
      }, 200)
    }
    const onSetPrivate = () => {
      emit('setPrivate', 'setPrivate')
    }
    const onSetDownload = () => {
      emit('setDownload', 'setDownload')
    }
    const onRemoveSelected = () => {
      emit('setRemoveSelected', 'setRemoveSelected')
    }
    const onChangeGroupName = () => {
      hide()
      emit('setChangeGroupName', {
        showNewGroup: true,
        groupName: getters.shelfCategory.title
      })
    }
    const onShowDeleteGroup = () => {
      hide()
      setTimeout(() => {
        emit('setShowDeleteGroup', {
          title: proxy.$t('shelf.deleteGroupTitle'),
          btn: [
            createPopupBtn(proxy.$t('shelf.confirm'), 'deleteGroup', 'danger'),
            createPopupBtn(proxy.$t('shelf.cancel'))
          ]
        })
        show()
      }, 200)
    }
    const onDeleteGroup = () => {
      emit('setDeleteGroup', 'setDeleteGroup')
    }
    return {
      show,
      hide,
      onSetPrivate,
      onSetDownload,
      onRemoveSelected,
      onChangeGroupName,
      onShowDeleteGroup,
      onDeleteGroup,
      popupVisible,
      visible
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .4);
    .popup-bg {
      width: 100%;
      height: 100%;
    }
    .popup-wrapper {
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 2000;
      width: 100%;
      background: white;
      .popup-title {
        width: 100%;
        height: px2rem(44);
        border-bottom: px2rem(1) solid #eee;
        font-size: px2rem(12);
        line-height: px2rem(14);
        padding: px2rem(15);
        box-sizing: border-box;
        color: #999;
        @include center;
      }
      .popup-btn {
        width: 100%;
        height: px2rem(60);
        border-bottom: px2rem(1) solid #eee;
        font-size: px2rem(16);
        color: #666;
        font-weight: bold;
        @include center;
        &.danger {
          color: $color-pink;
        }
      }
    }
  }
</style>
