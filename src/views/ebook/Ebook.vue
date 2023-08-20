<template>
  <div
    class="ebook"
    ref="ebookRef"
  >
    <ebook-title />
    <ebook-reader />
    <ebook-menu />
    <ebook-bookmark />
  </div>
</template>
<script>
import { onMounted, onBeforeUnmount, watch, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { getReadTime, saveReadTime } from '@/utils/localStorage'
import EbookTitle from '@/components/ebook/ebookTitle/EbookTitle.vue'
import EbookReader from '@/components/ebook/EbookReader/EbookReader.vue'
import EbookMenu from '@/components/ebook/ebookMenu/EbookMenu.vue'
import EbookBookmark from '@/components/ebook/EbookBookmark/EbookBookmark'
export default {
  name: 'Ebook',
  components: { EbookReader, EbookTitle, EbookMenu, EbookBookmark },
  setup () {
    const { getters } = useStore()
    const { ctx } = getCurrentInstance()
    const pull = (pullValue) => {
      ctx.$refs.ebookRef.style.top = pullValue + 'px'
    }
    const restore = () => {
      ctx.$refs.ebookRef.style.top = 0
      ctx.$refs.ebookRef.style.transition = 'all .2s linear'
      setTimeout(() => {
        ctx.$refs.ebookRef.style.transition = ''
      }, 200)
    }
    const startLoopReadTime = () => {
      const fileName = getters.fileName
      let readTime = getReadTime(fileName)
      if (!readTime) {
        readTime = 0
      }
      getters.task = setInterval(() => {
        readTime++
        if (readTime % 30 === 0) {
          saveReadTime(fileName, readTime)
        }
      }, 1000)
    }
    onMounted(() => startLoopReadTime())
    onBeforeUnmount(() => {
      getters.task && clearInterval(getters.task)
    })
    watch(() => getters.offsetY, (newValue) => {
      newValue > 0 ? pull(newValue) : restore()
    })
    return { pull }
  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/styles/global';
.ebook {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
