<template>
  <div
    class="shelf-list"
    :style="{top: shelfListTop}"
  >
    <transition-group
      name="list"
      tag="div"
      id="shelf-list"
    >
      <div
        class="shelf-list-item-wrapper"
        v-for="item in data"
        :key="item.id"
      >
        <shelf-item
          :data="item"
          :style="{height: itemHeight}"
        />
        <div class="shelf-list-title-wrapper">
          <span class="shelf-list-title title-small">{{item.title}}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { computed } from 'vue'
import { realPx, px2rem } from '@/utils/utils'
import ShelfItem from './shelfItem/ShelfItem.vue'

export default {
  name: 'ShelfList',
  components: { ShelfItem },
  props: {
    top: {
      type: Number,
      default: 94
    },
    data: Array
  },
  setup (props) {
    const shelfListTop = computed(() => {
      return px2rem(props.top) + 'rem'
    })
    const itemHeight = computed(() => {
      // w / 250 = h / 350
      // h = w / 250 * 350
      return ((window.innerWidth - realPx(120)) / 3) / 250 * 350 + 'px'
    })
    return { shelfListTop, itemHeight }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";
.shelf-list {
  position: absolute;
  left: 0;
  z-index: 100;
  width: 100%;
  #shelf-list {
    display: flex;
    flex-flow: row wrap;
    width: 100%;
    padding: 0 px2rem(15);
    box-sizing: border-box;
    .shelf-list-item-wrapper {
      flex: 0 0 33.33%;
      width: 33.33%;
      padding: px2rem(15);
      box-sizing: border-box;
      &.list-leave-active {
        display: none;
      }
      &.list-move {
        transition: transform .5s;
      }
      .shelf-list-title-wrapper {
        margin-top: px2rem(10);
      }
    }
  }
}
</style>
