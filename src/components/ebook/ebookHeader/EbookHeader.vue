<template>
  <div class="ebook-header">
    <span class="ebook-header-text">{{getSectionName}}</span>
  </div>
</template>

<script type="text/ecmascript-6">
import { useStore } from 'vuex'
import { ebookMixin } from '@/utils/mixin'
import { useProgressEffect } from '@/components/ebook/ebookMenu/EbookSettingProgress/useProgressEffect'

export default {
  mixins: [ebookMixin],
  setup () {
    const store = useStore()
    const { getSectionName } = useProgressEffect(store)
    return { getSectionName }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../../assets/styles/global.scss";

  .ebook-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: px2rem(48);
    padding: 0 px2rem(15);
    box-sizing: border-box;
    overflow: hidden;
    @include left;
    .ebook-header-text {
      font-size: px2rem(12);
      color: #6d7178;
    }
  }
</style>
