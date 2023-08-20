<template>
  <div class="ebook-loading">
    <div class="ebook-loading-wrapper">
      <div
        class="ebook-loading-item"
        v-for="(item, index) in data"
        :key="index"
      >
        <div
          class="ebook-loading-line-wrapper"
          v-for="(subItem, subIndex) in item"
          :key="subIndex"
        >
          <div class="ebook-loading-line" ref="line" />
          <div class="ebook-loading-mask" ref="mask" />
        </div>
      </div>
      <div class="ebook-loading-center" />
    </div>
  </div>
</template>

<script>
import { px2rem } from '@/utils/utils'
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'EbookLoading',
  setup () {
    const { getters } = useStore()
    const { ctx } = getCurrentInstance()
    const data = ref([
      [{}, {}, {}],
      [{}, {}, {}]
    ])
    const add = ref(true)
    const end = ref(false)
    const maskWidth = ref([
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 }
    ])
    const lineWidth = ref([
      { value: 16 },
      { value: 16 },
      { value: 16 },
      { value: 16 },
      { value: 16 },
      { value: 16 }
    ])
    onMounted(() => {
      getters.task = setInterval(() => {
        ctx.$refs.mask.forEach((item, index) => {
          const mask = ctx.$refs.mask[index]
          const line = ctx.$refs.line[index]
          const targetMaskWidth = maskWidth.value[index]
          const targetLineWidth = lineWidth.value[index]
          if (index === 0) {
            if (add.value && targetMaskWidth.value < 16) {
              targetMaskWidth.value++
              targetLineWidth.value--
            } else if (!add.value && targetLineWidth.value < 16) {
              targetMaskWidth.value--
              targetLineWidth.value++
            }
          } else {
            if (add.value && targetMaskWidth.value < 16) {
              const preMaskWidth = maskWidth.value[index - 1]
              if (preMaskWidth.value >= 8) {
                targetMaskWidth.value++
                targetLineWidth.value--
              }
            } else if (!add.value && targetLineWidth.value < 16) {
              const preLineWidth = lineWidth[index - 1]
              if (preLineWidth.value >= 8) {
                targetMaskWidth.value--
                targetLineWidth.value++
              }
            }
          }
          mask.style.width = `${px2rem(targetMaskWidth.value)}rem`
          mask.style.flex = `0 0 ${px2rem(targetMaskWidth.value)}rem`
          line.style.width = `${px2rem(targetLineWidth.value)}rem`
          line.style.flex = `0 0 ${px2rem(targetLineWidth.value)}rem`
          if (index === targetMaskWidth.value.length - 1) {
            if (add.value) {
              if (targetMaskWidth.value === 16) {
                end.value = true
              }
            } else {
              if (targetMaskWidth.value === 0) {
                end.value = true
              }
            }
          }
          if (end.value) {
            add.value = !add.value
            end.value = false
          }
        })
      }, 20)
    })
    return {
      data
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../../../assets/styles/global.scss";

  .ebook-loading {
    position: relative;
    z-index: 400;
    width: px2rem(63);
    height: px2rem(40);
    background: transparent;
    border: px2rem(1.5) solid #d7d7d7;
    border-radius: px2rem(3);
    .ebook-loading-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      .ebook-loading-item {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: px2rem(7) 0;
        box-sizing: border-box;
        .ebook-loading-line-wrapper {
          flex: 1;
          padding: 0 px2rem(7);
          box-sizing: border-box;
          @include left;
          .ebook-loading-line {
            flex: 0 0 px2rem(16);
            width: px2rem(16);
            height: px2rem(2);
            background: #d7d7d7;
          }
          .ebook-loading-mask {
            flex: 0 0 0;
            width: 0;
            height: px2rem(2);
          }
        }
      }
      .ebook-loading-center {
        position: absolute;
        left: 50%;
        top: 0;
        width: px2rem(1.5);
        height: 100%;
        background: #d7d7d7;
      }
    }
  }
</style>
