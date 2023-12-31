<template>
  <transition name="slide-up">
    <div
      class="setting-wrapper"
      v-show="menuVisible && settingVisible === 1"
    >
      <div class="setting-theme">
        <div
          class="setting-theme-item"
          v-for="(item, index) in themes"
          :key="index"
          @click="setTheme(index)"
        >
          <div
            class="preview"
            :class="{'selected': item.name === defaultTheme}"
            :style="{background: item.style.body.background}"
          />
          <div
            class="text"
            :class="{'selected': item.name === defaultTheme}"
          >
            {{item.alias}}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { getCurrentInstance, computed } from 'vue'
import { useStore } from 'vuex'
import { ebookMixin } from '@/utils/mixin'
import { saveTheme } from '@/utils/localStorage'
import { themeList } from '@/utils/book'
import { useInitEffect } from '@/components/ebook/EbookReader/useInitEffect'
export default {
  name: 'EbookSettingTheme',
  mixins: [ebookMixin],
  setup () {
    const store = useStore()
    const { dispatch, getters } = store
    const { proxy } = getCurrentInstance()
    const { initGlobalStyle } = useInitEffect(store)
    const themes = computed(() => {
      return themeList(proxy)
    })
    const setTheme = (index) => {
      const theme = themes.value[index]
      const themeName = theme.name
      const fileName = getters.fileName
      dispatch('setDefaultTheme', themeName) // 切換主題 => 把 defaultTheme 變成新的 defaultTheme
        .then(() => {
          getters.currentBook.rendition.themes.select(themeName)
          initGlobalStyle()
        })
      saveTheme(fileName, themeName) // 保存主題
    }
    return { themes, setTheme }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../../assets//styles/global.scss";

  .setting-wrapper {
    position: absolute;
    bottom: px2rem(48);
    left: 0;
    z-index: 160;
    width: 100%;
    height: px2rem(90);
    background: white;
    box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
    .setting-theme {
      height: 100%;
      display: flex;
      .setting-theme-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: px2rem(5);
        box-sizing: border-box;
        .preview {
          flex: 1;
          border: px2rem(1) solid #ccc;
          box-sizing: border-box;
          &.selected {
            box-shadow: 0 px2rem(4) px2rem(6) 0 rgba(0, 0, 0, .1);
          }
        }
        .text {
          flex: 0 0 px2rem(20);
          font-size: px2rem(14);
          color: #ccc;
          @include center;
          &.selected {
            color: #333;
          }
        }
      }
    }
  }
</style>
