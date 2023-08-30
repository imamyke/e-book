<template>
  <div class="playing-item-wrapper">
    <div
      class="playing-item"
      ref="playingItem"
      :style="item"
      v-for="(item, index) in styles"
      :key="index"
    ></div>
  </div>
</template>

<script>
import { px2rem } from '@/utils/utils'
import { computed, getCurrentInstance } from 'vue'

export default {
  props: {
    number: Number
  },
  setup (props) {
    const { ctx } = getCurrentInstance()
    let task = null
    const styles = computed(() => {
      const styles = new Array(props.number)
      for (let i = 0; i < styles.length; i++) {
        styles[i] = {
          height: px2rem(random()) + 'rem'
        }
      }
      return styles
    })

    const startAnimation = () => {
      task = setInterval(() => {
        ctx.$refs.playingItem.forEach(item => {
          item.style.height = px2rem(random()) + 'rem'
        })
      }, 200)
    }
    const stopAnimation = () => {
      if (task) {
        clearInterval(task)
      }
    }
    const random = () => {
      return Math.ceil(Math.random() * 10)
    }
    return {
      styles,
      startAnimation,
      stopAnimation,
      random
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/global";

.playing-item-wrapper {
  @include center;
  .playing-item {
    flex: 0 0 px2rem(2);
    width: px2rem(2);
    height: px2rem(1);
    background: $color-blue;
    margin-left: px2rem(2);
    transition: all .2s ease-in-out;
    &:first-child {
      margin: 0;
    }
  }
}
</style>
