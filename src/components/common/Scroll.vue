<template>
  <div
    ref="scrollWrapper"
    class="scroll-wrapper"
    :class="{'no-scroll': ifNoScroll}"
    @scroll.passive="handleScroll"
  >
    <slot></slot>
  </div>
</template>

<script>
import { onMounted, getCurrentInstance } from 'vue'
import { realPx } from '@/utils/utils'

export default {
  name: 'Scroll',
  props: {
    top: {
      type: Number,
      default: 0
    },
    bottom: {
      type: Number,
      default: 0
    },
    ifNoScroll: {
      type: Boolean,
      default: false
    }
  },
  emits: ['onScroll'],
  setup (props, { emit }) {
    const { ctx } = getCurrentInstance()
    onMounted(() => refresh())
    const handleScroll = (e) => {
      const offsetY = e.target.scrollTop || window.pageYOffset || document.body.scrollTop
      emit('onScroll', offsetY)
    }
    const scrollTo = (x, y) => {
      ctx.$refs.scrollWrapper.scrollTo(x, y)
    }
    const refresh = () => { // 重新計算整個滾動調高度
      if (ctx.$refs.scrollWrapper) { // 選定 DOM 節點
        ctx.$refs.scrollWrapper.style.height = window.innerHeight - realPx(props.top) - realPx(props.bottom) + 'px'
        ctx.$refs.scrollWrapper.addEventListener('scroll', handleScroll)
      }
    }
    return {
      handleScroll,
      scrollTo,
      refresh
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global.scss";

  .scroll-wrapper {
    position: relative;
    z-index: 100;
    width: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
    &.no-scroll {
      overflow: hidden;
    }
  }
</style>
