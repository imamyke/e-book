<template>
  <div>
    <transition name="slide-up">
      <div
        class="menu-wrapper" :class="{'hide-box-shadow': settingVisible >= 0}"
        v-show="menuVisible"
      >
        <div class="icon-wrapper">
          <span class="icon-menu" @click="setSettingVisible(3)" />
        </div>
        <div class="icon-wrapper">
          <span class="icon-progress" @click="setSettingVisible(2)" />
        </div>
        <div class="icon-wrapper">
          <span class="icon-bright" @click="setSettingVisible(1)" />
        </div>
        <div class="icon-wrapper">
          <span class="icon-A" @click="setSettingVisible(0)" />
        </div>
      </div>
    </transition>
    <ebook-setting-font />
    <ebook-setting-font-popup />
    <ebook-setting-theme />
    <ebook-setting-progress />
    <ebook-slide />
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { ebookMixin } from '@/utils/mixin'
import EbookSettingFont from './EbookSettingFont.vue'
import EbookSettingFontPopup from './EbookSettingFontPopup'
import EbookSettingTheme from './EbookSettingTheme'
import EbookSettingProgress from '@/components/ebook/ebookMenu/EbookSettingProgress/EbookSettingProgress.vue'
import EbookSlide from '@/components/ebook/ebookMenu/EbookSlide/EbookSlide.vue'
export default {
  name: 'EbookMenu',
  mixins: [ebookMixin],
  components: {
    EbookSettingFont,
    EbookSettingFontPopup,
    EbookSettingTheme,
    EbookSettingProgress,
    EbookSlide
  },
  setup () {
    const { dispatch } = useStore()
    const setSettingVisible = (key) => {
      dispatch('setSettingVisible', key)
    }
    return { setSettingVisible }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../../assets/styles/global.scss";

  .menu-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 200;
    display: flex;
    width: 100%;
    height: px2rem(48);
    background: white;
    box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
    font-size: px2rem(20);
    &.hide-box-shadow {
      box-shadow: none;
    }
    .icon-wrapper {
      flex: 1;
      @include center;
      .icon-progress {
        font-size: px2rem(24);
      }
      .icon-bright {
        font-size: px2rem(22);
      }
    }
  }
</style>
