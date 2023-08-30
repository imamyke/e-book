<template>
  <div>
    <div
      class="search-bar"
      :class="{'hide-title': !titleVisible, 'hide-shadow': !shadowVisible}"
    >
      <transition name="title-move">
        <div
          class="search-bar-title-wrapper"
          v-show="titleVisible"
        >
          <div class="title-text-wrapper">
            <span class="title-text title">{{$t('home.title')}}</span>
          </div>
          <div
            class="title-icon-shake-wrapper"
            @click="showFlapCard"
          >
            <span class="icon-shake icon"></span>
          </div>
        </div>
      </transition>
      <div
        class="title-icon-back-wrapper"
        :class="{'hide-title': !titleVisible}"
        @click="back"
      >
        <span class="icon-back icon"></span>
      </div>
      <div
        class="search-bar-input-wrapper"
        :class="{'hide-title': !titleVisible}"
      >
        <div
          class="search-bar-blank"
          :class="{'hide-title': !titleVisible}"
        />
        <div class="search-bar-input">
          <span class="icon-search icon" />
          <input class="input"
            type="text"
            :placeholder="$t('home.hint')"
            v-model="searchText"
            @click="showHotSearch"
            @keyup.enter.exact="search"
          />
        </div>
      </div>
    </div>
    <hot-search-list
      ref="hotSearch"
      v-show="hotSearchVisible"
    />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { nextTick, ref, watch, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import HotSearchList from './HotSearchList.vue'

export default {
  name: 'SearchBar',
  components: { HotSearchList },
  setup () {
    const router = useRouter()
    const { getters, dispatch } = useStore()
    const titleVisible = ref(true)
    const searchText = ref('')
    const shadowVisible = ref(false)
    const hotSearchVisible = ref(false)
    const { ctx } = getCurrentInstance()

    const search = () => {
      router.push({
        path: '/store/list',
        query: {
          keyword: searchText.value
        }
      })
    }

    watch([() => getters.offsetY, () => getters.hotSearchOffsetY], ([newOffset, newHotSearchOffsetY]) => {
      if (newOffset > 0) {
        hideTitle()
        showShadow()
      } else {
        showTitle()
        hideShadow()
      }
      if (newHotSearchOffsetY > 0) {
        showShadow()
        hideTitle()
      } else {
        hideShadow()
        hideTitle()
      }
    })
    const back = () => {
      getters.offsetY > 0 ? showShadow() : hideShadow()
      hotSearchVisible.value ? hideHotSearch() : router.push('/store/shelf')
    }
    const hideTitle = () => {
      titleVisible.value = false
    }
    const showTitle = () => {
      titleVisible.value = true
    }
    const hideShadow = () => {
      shadowVisible.value = false
    }
    const showShadow = () => {
      shadowVisible.value = true
    }
    const showHotSearch = () => {
      hideTitle()
      hideShadow()
      hotSearchVisible.value = true
      nextTick(() => {
        ctx.$refs.hotSearch.reset()
      })
    }
    const hideHotSearch = () => {
      hotSearchVisible.value = false
      if (getters.offsetY > 0) {
        hideTitle()
        showShadow()
      } else {
        showTitle()
        hideShadow()
      }
    }
    const showFlapCard = () => {
      dispatch('setFlapCardVisible', true)
    }

    return {
      searchText,
      titleVisible,
      shadowVisible,
      hotSearchVisible,
      back,
      search,
      hideTitle,
      showTitle,
      showHotSearch,
      hideHotSearch,
      showFlapCard
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";

.search-bar {
  position: relative;
  z-index: 150;
  width: 100%;
  height: px2rem(94);
  box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, .1);
  &.hide-title {
    height: px2rem(52);
  }
  &.hide-shadow {
    box-shadow: none;
  }
  .search-bar-title-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: px2rem(42);
    .title-text-wrapper {
      width: 100%;
      height: px2rem(42);
      @include center;
    }
    .title-icon-shake-wrapper {
      position: absolute;
      right: px2rem(15);
      top: 0;
      height: px2rem(42);
      @include center;
    }
  }
  .title-icon-back-wrapper {
    position: absolute;
    left: px2rem(15);
    top: 0;
    z-index: 200;
    height: px2rem(42);
    transition: height $animationTime $animationType;
    @include center;
    &.hide-title {
      height: px2rem(52);
    }
  }
  .search-bar-input-wrapper {
    position: absolute;
    left: 0;
    top: px2rem(42);
    display: flex;
    width: 100%;
    height: px2rem(52);
    padding: px2rem(10);
    box-sizing: border-box;
    transition: top $animationTime $animationType;
    &.hide-title {
      top: 0;
    }
    .search-bar-blank {
      flex: 0 0 0;
      width: 0;
      transition: all $animationTime $animationType;
      &.hide-title {
        flex: 0 0 px2rem(31);
        width: px2rem(31);
      }
    }
    .search-bar-input {
      flex: 1;
      width: 100%;
      background: #f4f4f4;
      border-radius: px2rem(20);
      padding: px2rem(5) px2rem(15);
      box-sizing: border-box;
      border: px2rem(1) solid #eee;
      @include left;
      .icon-search {
        color: #999;
      }
      .input {
        width: 100%;
        height: px2rem(22);
        border: none;
        background: transparent;
        margin-left: px2rem(10);
        font-size: px2rem(12);
        color: #666;
        &:focus {
          outline: none;
        }
        &::-webkit-input-placeholder {
          color: #ccc;
        }
      }
    }
  }
}

</style>
