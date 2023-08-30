<template>
  <div
    class="shelf-footer"
    v-show="isEditMode"
  >
    <div
      class="shelf-footer-tab-wrapper"
      v-for="item in tabs"
      :key="item.index"
      @click="onTabClick(item)"
    >
      <div
        class="shelf-footer-tab"
        :class="{'is-selected': isSelected}"
      >
        <div
          class="icon-private tab-icon"
          v-if="item.index === 1 && !isPrivate"
        ></div>
        <div
          class="icon-private-see tab-icon"
          v-if="item.index === 1 && isPrivate"
        ></div>
        <div
          class="icon-download tab-icon"
          v-if="item.index === 2 && !isDownload"
        ></div>
        <div
          class="icon-download-remove tab-icon"
          v-if="item.index === 2 && isDownload"
        ></div>
        <div
          class="icon-move tab-icon"
          v-if="item.index === 3"
        ></div>
        <div
          class="icon-shelf tab-icon"
          v-if="item.index === 4"
        ></div>
        <div
          class="tab-text"
          :class="{'remove-text': item.index === 4}"
        >
          {{label(item)}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ShelfFooter',
  emits: [
    'dialogShow',
    'popupShow'
  ],
  props: [
    'isEditMode',
    'isSelected',
    'isPrivate',
    'isDownload'
  ],
  setup (props, { emit }) {
    const store = useStore()
    const { getters } = store
    const { proxy } = getCurrentInstance()
    const tabs = computed(() => {
      return [
        {
          label: proxy.$t('shelf.private'),
          label2: proxy.$t('shelf.noPrivate'),
          index: 1
        },
        {
          label: proxy.$t('shelf.download'),
          label2: proxy.$t('shelf.delete'),
          index: 2
        },
        {
          label: proxy.$t('shelf.move'),
          index: 3
        },
        {
          label: proxy.$t('shelf.remove'),
          index: 4
        }
      ]
    })

    const showDownload = () => {
      emit('popupShow', {
        title: props.isDownload ? proxy.$t('shelf.removeDownloadTitle') : proxy.$t('shelf.setDownloadTitle'),
        btn: [
          {
            text: props.isDownload ? proxy.$t('shelf.delete') : proxy.$t('shelf.open'),
            click: 'setDownload'
          },
          {
            text: proxy.$t('shelf.cancel')
          }
        ]
      })
    }
    const showRemove = () => {
      let title
      if (getters.shelfSelected.length === 1) {
        title = proxy.$t('shelf.removeBookTitle').replace('$1', `《${getters.shelfSelected[0].title}》`)
      } else {
        title = proxy.$t('shelf.removeBookTitle').replace('$1', proxy.$t('shelf.selectedBooks'))
      }
      emit('popupShow', {
        title: title,
        btn: [
          {
            text: proxy.$t('shelf.removeBook'),
            type: 'danger',
            click: 'setRemoveSelected'
          },
          {
            text: proxy.$t('shelf.cancel')
          }
        ]
      })
    }
    const showDialog = () => {
      emit('dialogShow', { showNewGroup: false })
    }
    const showPrivate = () => {
      emit('popupShow', {
        title: props.isPrivate ? proxy.$t('shelf.closePrivateTitle') : proxy.$t('shelf.setPrivateTitle'),
        btn: [
          {
            text: props.isPrivate ? proxy.$t('shelf.close') : proxy.$t('shelf.open'),
            click: 'setPrivate'
          },
          {
            text: proxy.$t('shelf.cancel')
          }
        ]
      })
    }
    const label = (item) => {
      switch (item.index) {
        case 1:
          return props.isPrivate ? item.label2 : item.label
        case 2:
          return props.isDownload ? item.label2 : item.label
        default:
          return item.label
      }
    }
    const onTabClick = (item) => { // 待修改
      if (!props.isSelected) {
        return
      }
      switch (item.index) {
        case 1:
          showPrivate()
          break
        case 2:
          showDownload()
          break
        case 3:
          showDialog()
          break
        case 4:
          showRemove()
          break
        default:
          break
      }
    }
    return {
      tabs,
      label,
      onTabClick
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";
.shelf-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 120;
  display: flex;
  width: 100%;
  height: px2rem(48);
  background: white;
  box-shadow: 0 px2rem(-2) px2rem(4) 0 rgba(0, 0, 0, .1);
  .shelf-footer-tab-wrapper {
    flex: 1;
    width: 25%;
    height: 100%;
    .shelf-footer-tab {
      width: 100%;
      height: 100%;
      opacity: .5;
      @include columnCenter;
      &.is-selected {
        opacity: 1;
      }
      .tab-icon {
        font-size: px2rem(20);
        color: #666;
      }
      .tab-text {
        margin-top: px2rem(5);
        font-size: px2rem(12);
        color: #666;
        &.remove-text {
          color: $color-pink;
        }
      }
      .icon-shelf {
        color: $color-pink;
      }
    }
  }
}
</style>
