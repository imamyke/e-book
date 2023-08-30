<template>
  <transition name="slide-up">
    <div
      class="setting-wrapper"
      v-show="menuVisible && settingVisible === 2"
    >
      <div class="setting-progress">
        <div class="read-time-wrapper">
          <span class="read-time-text">{{ getReadTimeText() }}</span>
          <span class="icon-forward" />
        </div>
        <div class="progress-wrapper">
          <div
            class="progress-icon-wrapper"
            @click="prevSection"
          >
            <span class="icon-back" />
          </div>
          <input
            class="progress"
            type="range"
            max="100"
            min="0"
            step="1"
            :disabled="!bookAvailable"
            :value="progress"
            @change="(e) => onProgressChange(e)"
            @input="(e) => onProgressInput(e)"
            ref="progress"
          />
          <div
            class="progress-icon-wrapper"
            @click="nextSection"
          >
            <span class="icon-forward" />
          </div>
        </div>
        <div class="text-wrapper">
          <span class="progress-section-text">{{getSectionName}}</span>
          <span>({{bookAvailable ? progress + '%' : '加载中...'}})</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { onUpdated, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { ebookMixin } from '@/utils/mixin'
import { useInitEffect } from '@/components/ebook/EbookReader/useInitEffect'
import { useProgressEffect } from './useProgressEffect'

export default {
  name: 'EbookSettingProgress',
  mixins: [ebookMixin],
  setup () {
    const store = useStore()
    const { dispatch, getters } = store
    const { ctx, proxy } = getCurrentInstance()
    const { getReadTimeText, getSectionName } = useProgressEffect(store)
    const { display } = useInitEffect(store)
    onUpdated(() => {
      updateProgressBg()
    })

    // 進度條基礎邏輯
    const displayProgress = () => { // 顯示進度條
      const cfi = getters.currentBook.locations.cfiFromPercentage(getters.progress / 100)
      display(cfi)
    }
    const updateProgressBg = () => { // 更新進度條 => ctx.$refs.progress => input.progress
      ctx.$refs.progress.style.backgroundSize = `${getters.progress}% 100%`
    }
    const EbookSettingProgress = (progress) => {
      dispatch('setProgress', progress)
        .then(() => {
          displayProgress()
          updateProgressBg()
        })
    }
    // 進度條改變
    const onProgressChange = (e) => { // 輸入框的 "值改變" => 進度條的值也改變
      const progress = e.target.value
      dispatch('setProgress', progress)
        .then(() => displayProgress())
        .then(() => updateProgressBg())
    }
    const onProgressInput = (e) => { // 輸入框的 "輸入狀況改變" => 進度條值隨拉動一起改變
      const progress = e.target.value
      dispatch('setProgress', progress)
        .then(() => displayProgress())
        .then(() => updateProgressBg())
    }
    // 顯示章節
    const displaySection = () => {
      const sectionInfo = getters.currentBook.section(getters.section) // book.section() 方法
      if (sectionInfo && sectionInfo.href) {
        display(sectionInfo.href)
      }
    }
    const prevSection = () => { // 上一章節
      const currentSection = getters.section
      const currentBookAvailable = getters.bookAvailable
      if (currentSection > 0 && currentBookAvailable) {
        dispatch('setSection', currentSection - 1)
          .then(() => displaySection())
      }
    }
    const nextSection = () => { // 下一章節
      const currentSection = getters.section
      const currentBookAvailable = getters.bookAvailable
      if (currentSection < getters.currentBook.spine.length - 1 && currentBookAvailable) {
        dispatch('setSection', currentSection + 1)
          .then(() => displaySection())
      }
    }

    return {
      onProgressChange,
      EbookSettingProgress,
      onProgressInput,
      displayProgress,
      updateProgressBg,
      prevSection,
      nextSection,
      displaySection,
      getSectionName,
      getReadTimeText: () => getReadTimeText(proxy)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../../../assets/styles/global.scss";

  .setting-wrapper {
    position: absolute;
    bottom: px2rem(48);
    left: 0;
    z-index: 210;
    width: 100%;
    height: px2rem(90);
    background: white;
    box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
    .setting-progress {
      position: relative;
      width: 100%;
      height: 100%;
      .read-time-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: px2rem(40);
        font-size: px2rem(12);
        @include center;
      }
      .progress-wrapper {
        width: 100%;
        height: 100%;
        @include center;
        padding: 0 px2rem(15);
        box-sizing: border-box;
        .progress-icon-wrapper {
          font-size: px2rem(20);
        }
        .progress {
          width: 100%;
          -webkit-appearance: none;
          height: px2rem(2);
          margin: 0 px2rem(10);
          &:focus {
            outline: none;
          }
          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: px2rem(20);
            width: px2rem(20);
            border-radius: 50%;
            background: white;
            box-shadow: 0 4px 4px 0 rgba(0, 0, 0, .15);
            border: px2rem(1) solid #ddd;
          }
        }
      }
      .text-wrapper {
        position: absolute;
        left: 0;
        bottom: px2rem(10);
        width: 100%;
        color: #333;
        font-size: px2rem(12);
        padding: 0 px2rem(15);
        box-sizing: border-box;
        @include center;
        .progress-section-text {
          @include ellipsis;
        }
      }
    }
  }
</style>
