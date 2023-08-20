<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div
      class="ebook-reader-mask"
      @click="handleMaskClick"
      @touchmove="pullDown"
      @touchend="pullDownEnd"
    ></div>
  </div>
</template>

<script>
import Epub from 'epubjs'
import { getCurrentInstance, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { ebookMixin } from '@/utils/mixin'
import { themeList } from '@/utils/book'
import { useInitEffect } from './useInitEffect'
import { getFontSize, getLocation } from '@/utils/localStorage'
import { useProgressEffect } from '@/components/ebook/ebookMenu/EbookSettingProgress/useProgressEffect'
import { useEbookEffect } from './useEbookEffect'

global.ePub = Epub
export default {
  name: 'EbookReader',
  mixins: [ebookMixin],
  setup () {
    const route = useRoute()
    const store = useStore()
    const { dispatch } = store
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
    const handleMaskClick = (e) => {
      console.log(e)
      const offsetX = e.offsetX
      const width = window.innerWidth
      console.log(width * 0.3)
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
    const book = new Epub(url)
    const rendition = book.renderTo('read', {
      width: innerWidth,
      height: innerHeight,
      method: 'default'
    })
    dispatch('setFileName', fileName).then(() => { initEpub() })

    // 閱讀器初始化相關邏輯
    const initEpub = () => {
      dispatch('setCurrentBook', book) // 將 book 對象存進 store
      initRendition() // 閱讀器渲染
      initGesture() // 閱讀器手勢
      book.ready
        .then(() => {
          return book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(fileName) / 16))
        })
        .then(() => dispatch('setBookAvailable', true))
        .then(() => refreshLocation()) // 載入閱讀進度
    }
    const initRendition = () => { // 設定電子書初始樣式
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
    const initGesture = () => { // 設定電子書手勢
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

    return {
      handleMaskClick,
      pullDown,
      pullDownEnd
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
