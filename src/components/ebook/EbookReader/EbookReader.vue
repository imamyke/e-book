<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div
      class="ebook-reader-mask"
      @click="handleMaskClick"
      @touchmove="pullDown"
      @touchend="pullDownEnd"
      @mousedown.left="handleMouseEnter"
      @mousemove.left="handleMouseMove"
      @mouseup.left="handleMouseEnd"
    ></div>
  </div>
</template>

<script>
import Epub from 'epubjs'
import { getCurrentInstance, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { ebookMixin } from '@/utils/mixin'
import { themeList } from '@/utils/book'
import { useInitEffect } from './useInitEffect'
import { getFontSize, getLocation } from '@/utils/localStorage'
import { useProgressEffect } from '@/components/ebook/ebookMenu/EbookSettingProgress/useProgressEffect'
import { useEbookEffect } from './useEbookEffect'
import { getLocalForage } from '@/utils/localForage'

global.ePub = Epub
export default {
  name: 'EbookReader',
  mixins: [ebookMixin],
  setup () {
    const route = useRoute()
    const store = useStore()
    const { dispatch, getters } = store
    const { proxy } = getCurrentInstance()
    const { refreshLocation } = useProgressEffect(store)
    const themes = computed(() => {
      return themeList(proxy)
    })
    const {
      initFontFamily,
      initFontSize,
      initTheme,
      initGlobalStyle,
      parseBook,
      display
    } = useInitEffect(store)
    const {
      prevPage,
      nextPage,
      toggleTitleAndMenu,
      pullDown,
      pullDownEnd
    } = useEbookEffect(store)
    // 鼠標示件 => 進入/進入後的移動/從移動狀態移出/還原
    const handleMouseEnter = (e) => {
      getters.mouseState = 1
      e.preventDefault()
      e.stopPropagation()
    }
    const handleMouseMove = (e) => {
      if (getters.mouseState === 1) {
        getters.mouseState = 2
      } else if (getters.mouseState === 2) {
        let offsetY = 0
        if (getters.firstOffsetY) {
          offsetY = e.clientY - getters.firstOffsetY
          dispatch('setOffsetY', offsetY)
        } else {
          getters.firstOffsetY = e.clientY
        }
      }
      e.preventDefault()
      e.stopPropagation()
    }
    const handleMouseEnd = (e) => {
      if (getters.mouseState === 2) {
        dispatch('setOffsetY', 0)
        getters.firstOffsetY = null
        getters.mouseState = 3
      } else {
        getters.mouseState = 4
      }
      const time = e.timeStamp - getters.mouseStartTime
      if (time < 200) {
        getters.mouseState = 4
      }
      e.preventDefault()
      e.stopPropagation()
    }
    const handleMaskClick = (e) => {
      if (getters.mouseState && (getters.mouseState === 2 || getters.mouseState === 3)) return
      const offsetX = e.offsetX
      const width = window.innerWidth
      if (offsetX > 0 && offsetX < width * 0.3) {
        prevPage()
      } else if (offsetX > 0 && offsetX > width * 0.7) {
        nextPage()
      } else {
        toggleTitleAndMenu()
      }
    }
    // 初始化閱讀器
    const fileName = route.params.fileName.split('|').join('/')
    const url = `${process.env.VUE_APP_RES_URL}/epub/${fileName}.epub`
    // 閱讀器初始化相關邏輯
    const initEpub = (url) => {
      const book = new Epub(url)
      dispatch('setCurrentBook', book) // 將 book 對象存進 store
      initRendition(store) // 閱讀器渲染
      initGesture(store) // 閱讀器手勢
      book.ready
        .then(() => {
          return book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(fileName) / 16))
        })
        .then(() => dispatch('setBookAvailable', true))
        .then(() => refreshLocation()) // 載入閱讀進度
    }
    const initRendition = (store) => { // 設定電子書初始樣式
      const rendition = store.getters.currentBook.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default'
      })
      const location = getLocation(fileName)
      display(location, () => {
        initTheme(themes)
        initFontFamily()
        initFontSize()
        initGlobalStyle()
        parseBook()
      })
      // 在閱讀器載入字體
      rendition.hooks.content.register(content => {
        Promise.all([
          content.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
          content.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
          content.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
          content.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
        ]).then(() => console.log('字體 OK'))
      })
    }
    const initGesture = (store) => { // 設定電子書手勢
      const rendition = store.getters.currentBook
      rendition.on('touchstart', event => {
        rendition.touchStartX = event.changedTouches[0].clientX
        rendition.touchStartTime = event.timeStamp
      })
      rendition.on('touchend', event => {
        const offsetX = event.changedTouches[0].clientX - rendition.touchStartX
        const time = event.timeStamp - rendition.touchStartTime
        if (time < 500 && offsetX > 40) {
          prevPage()
        } else if (time < 500 && offsetX < -40) {
          nextPage()
        } else {
          toggleTitleAndMenu()
        }
        event.preventDefault()
        event.stopPropagation()
      })
    }
    onMounted(() => {
      const books = route.params.fileName.split('|')
      const fileName = books[1]
      getLocalForage(fileName, (err, blob) => {
        if (!err && blob) {
          console.log('找到離線緩存電子書')
          dispatch('setFileName', books.join('/'))
            .then(() => { initEpub(blob) })
        } else {
          console.log('在線獲取電子書')
          dispatch('setFileName', route.params.fileName.split('|').join('/'))
            .then(() => { initEpub(url) })
        }
      })
    })
    return {
      handleMaskClick,
      pullDown,
      pullDownEnd,
      handleMouseEnter,
      handleMouseMove,
      handleMouseEnd
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/global.scss';
.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
  &-mask {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 200;
    width: 100%;
    height: 100%;
    background: transparent;
  }
}
</style>
