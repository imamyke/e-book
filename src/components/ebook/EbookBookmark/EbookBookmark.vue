<template>
  <div
    class="ebook-bookmark"
    ref="bookmarkRef"
  >
    <div class="ebook-bookmark-text-wrapper">
      <div
        class="ebook-bookmark-down-wrapper"
        ref="iconDownRef"
      >
        <span class="icon-down" />
      </div>
      <div class="ebook-bookmark-text">{{text}}</div>
    </div>
    <div
      class="ebook-bookmark-icon-wrapper"
      :style="isFixed ? fixedStyle : {}"
    >
      <bookmark
        :color="color"
        :width="15"
        :height="35"
      />
    </div>
  </div>
</template>

<script>
import { computed, watch, ref, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { realPx } from '@/utils/utils'
import { getBookmark, saveBookmark } from '@/utils/localStorage'
import { ebookMixin } from '@/utils/mixin'
import Bookmark from '@/components/common/Bookmark'

export default {
  name: 'EbookBookmark',
  mixins: [ebookMixin],
  components: { Bookmark },
  setup () {
    const { getters, dispatch } = useStore()
    const { ctx, proxy } = getCurrentInstance()
    const BLUE = '#346cbc'
    const WHITE = 'white'
    const text = ref('')
    const color = ref(WHITE)
    const isFixed = ref(false)
    const height = computed(() => { return realPx(35) })
    const threshold = computed(() => { return realPx(55) })
    const fixedStyle = computed(() => {
      return {
        position: 'fixed',
        top: 0,
        right: `${(window.innerWidth - ctx.$refs.bookmarkRef.clientWidth) / 2}px`
      }
    })
    watch(() => getters.offsetY, (newValue) => {
      if (!getters.bookAvailable || getters.menuVisible || getters.settingVisible >= 0) return
      if (newValue >= height.value && newValue < threshold.value) {
        beforeThreshold(newValue)
      } else if (newValue >= threshold.value) {
        afterThreshold(newValue)
      } else if (newValue > 0 && newValue < height.value) {
        beforeHeight()
      } else if (newValue === 0) {
        restore()
      }
    })
    watch(() => getters.isBookmark, (isBookmark) => {
      isFixed.value = isBookmark
      if (isBookmark) {
        color.value = BLUE
      } else {
        color.value = WHITE
      }
    })
    const addBookmark = () => {
      getters.bookmark = getBookmark(getters.fileName)
      if (!getters.bookmark) {
        getters.bookmark = []
      }
      const currentLocation = getters.currentBook.rendition.currentLocation()
      const cfibase = currentLocation.start.cfi.replace(/!.*/, '')
      const cfistart = currentLocation.start.cfi.replace(/.*!/, '').replace(/\)$/, '')
      const cfiend = currentLocation.end.cfi.replace(/.*!/, '').replace(/\)$/, '')
      const cfirange = `${cfibase}!,${cfistart},${cfiend})`
      getters.currentBook.getRange(cfirange).then(range => {
        const text = range.toString().replace(/\s\s/g, '')
        getters.bookmark.push({
          cfi: currentLocation.start.cfi,
          text: text
        })
        saveBookmark(getters.fileName, getters.bookmark)
      })
    }
    const removeBookmark = () => {
      const currentLocation = getters.currentBook.rendition.currentLocation()
      const cfi = currentLocation.start.cfi
      getters.bookmark = getBookmark(getters.fileName)
      if (getters.bookmark) {
        saveBookmark(getters.fileName, getters.bookmark.filter(item => item.cfi !== cfi))
        dispatch('setIsBookmark', false)
      }
    }
    const restore = () => {
      // 状态4：归位
      setTimeout(() => {
        ctx.$refs.bookmarkRef.style.top = `${-height.value}px`
        ctx.$refs.iconDownRef.style.transform = 'rotate(0deg)'
      }, 200)
      if (isFixed.value) {
        dispatch('setIsBookmark', true)
        addBookmark()
      } else {
        dispatch('setIsBookmark', false)
        removeBookmark()
      }
    }
    const beforeHeight = () => {
      // 状态1：未超过书签的高度
      if (getters.isBookmark) {
        text.value = proxy.$t('book.pulldownDeleteMark')
        color.value = BLUE
        isFixed.value = true
      } else {
        text.value = proxy.$t('book.pulldownAddMark')
        color.value = WHITE
        isFixed.value = false
      }
    }
    const beforeThreshold = (v) => {
      // 状态2：未到达零界状态
      ctx.$refs.bookmarkRef.style.top = `${-v}px`
      beforeHeight()
      const iconDown = ctx.$refs.iconDownRef
      if (iconDown.style.transform === 'rotate(180deg)') {
        iconDown.style.transform = 'rotate(0deg)'
      }
    }
    const afterThreshold = (v) => {
      // 状态3：超越零界状态
      ctx.$refs.bookmarkRef.style.top = `${-v}px`
      if (getters.isBookmark) {
        text.value = proxy.$t('book.releaseDeleteMark')
        color.value = WHITE
        isFixed.value = false
      } else {
        text.value = proxy.$t('book.releaseAddMark')
        color.value = BLUE
        isFixed.value = true
      }
      const iconDown = ctx.$refs.iconDownRef
      if (iconDown.style.transform === '' || iconDown.style.transform === 'rotate(0deg)') {
        iconDown.style.transform = 'rotate(180deg)'
      }
    }
    return {
      color,
      text,
      fixedStyle,
      isFixed
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../../assets/styles/global.scss";
.ebook-bookmark {
  position: absolute;
  top: px2rem(-35);
  left: 0;
  z-index: 150;
  width: 100%;
  height: px2rem(35);
  .ebook-bookmark-text-wrapper {
    position: absolute;
    right: px2rem(45);
    bottom: 0;
    display: flex;
    .ebook-bookmark-down-wrapper {
      font-size: px2rem(14);
      color: #000;
      transition: all .2s linear;
      @include center;
    }
    .ebook-bookmark-text {
      font-size: px2rem(14);
      color: #000;
    }
  }
}
.ebook-bookmark-icon-wrapper {
  position: absolute;
  right: 0;
  bottom: 0;
  margin-right: px2rem(15);
}
</style>
