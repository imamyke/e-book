<template>
  <div
    class="bookmark"
    :style="style"
    ref="bookmarkRef"
  />
</template>

<script>
import { onMounted, computed, getCurrentInstance } from 'vue'
import { px2rem } from '@/utils/utils'

export default {
  name: 'Bookmark',
  props: ['width', 'height', 'color'],
  setup (props) {
    const { ctx } = getCurrentInstance()
    onMounted(() => refresh())
    const style = computed(() => {
      if (props.color) {
        return {
          borderColor: `${props.color} ${props.color} transparent ${props.color}`
        }
      } else {
        return {}
      }
    })
    const refresh = () => {
      console.log(props.height, props.width)
      if (props.height && props.width) {
        ctx.$refs.bookmarkRef.style.borderWidth = `${px2rem(props.height - 5)}rem ${px2rem(props.width / 2)}rem ${px2rem(5)}rem ${px2rem(props.width / 2)}rem`
      }
    }
    return { style }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .bookmark {
    width: 0;
    height: 0;
    border-width: px2rem(50) px2rem(10) px2rem(10) px2rem(10);
    border-style: solid;
    border-color: white white transparent white;
  }
</style>
