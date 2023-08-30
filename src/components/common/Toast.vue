<template>
  <transition name="fade">
    <div
      class="toast-bg-wrapper"
      @click.prevent
      v-show="visible"
    >
      <div class="toast-bg">
        <div class="toast-wrapper">
          <div
            class="toast"
            v-html="text">
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'Toast',
  props: {
    text: [String, Number],
    timeout: {
      type: Number,
      default: 1500
    }
  },
  setup (props) {
    const visible = ref(false)
    const showText = ref('')
    const task = {}

    const show = () => {
      updateText(props.text)
      clearTimeout(task.timeout)
      visible.value = true
      task.timeout = setTimeout(() => {
        visible.value = false
      }, props.timeout)
    }
    const hide = () => {
      visible.value = false
    }
    const updateText = (text) => {
      showText.value = text
    }
    const continueShow = () => {
      updateText(props.text)
      clearTimeout(task.timeout)
      delete task.timeout
      visible.value = true
    }
    return {
      visible,
      showText,
      hide,
      show,
      updateText,
      continueShow
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

.toast-bg-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3000;
  width: 100%;
  height: 100%;
  background: transparent;
  .toast-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: 0 0 0 -50%;
    z-index: 2500;
    width: 100%;
    @include center;
    .toast-wrapper {
      width: 60%;
      line-height: px2rem(20);
      padding: px2rem(10) px2rem(20);
      box-sizing: border-box;
      background: #ccc;
      border-radius: px2rem(10);
      font-size: px2rem(14);
      color: white;
      .toast {
        text-align: center;
        word-break: break-all;
      }
    }
  }
}
</style>
