<template>
  <div class="store-home">
    <search-bar />
    <flap-card :data="randomList" />
    <scroll
      ref="scroll"
      :top="scrollTop"
      @onScroll="onScroll"
    >
      <div class="banner-wrapper">
        <div
          class="banner-img"
          :style="{backgroundImage:`url('${banner}')`}"
        />
      </div>
      <guess-you-like :data="guessYouLikeList" />
      <recommend class="recommend" :data="recommend" />
      <featured
        class="featured"
        :data="featured"
        :titleText="$t('home.featured')"
        :btnText="$t('home.seeAll')"
      />
      <div
        class="category-list-wrapper"
        v-for="(item, index) in categoryList"
        :key="index"
      >
        <category-book :data="item" />
      </div>
      <category class="categories" :data="categories" />
    </scroll>
  </div>
</template>

<script>
import Category from '@/components/store/Category.vue'
import CategoryBook from '@/components/store/CategoryBook.vue'
import Featured from '@/components/store/Featured.vue'
import Recommend from '@/components/store/Recommend.vue'
import GuessYouLike from '@/components/store/GuessYouLike.vue'
import SearchBar from '@/components/store/SearchBar.vue'
import Scroll from '@/components/common/Scroll.vue'
import FlapCard from '@/components/store/FlapCard.vue'
import { ref, getCurrentInstance, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { home } from '../../../api/store'

export default {
  name: 'StoreHome',
  components: {
    Category,
    CategoryBook,
    Featured,
    Recommend,
    GuessYouLike,
    SearchBar,
    Scroll,
    FlapCard
  },
  setup () {
    const { dispatch } = useStore()
    const { ctx } = getCurrentInstance()
    const scrollTop = ref(94)
    const banner = ref('')
    const recommend = ref(null)
    const featured = ref(null)
    const categoryList = ref(null)
    const categories = ref(null)
    const guessYouLike = ref(null)
    const random = ref([])
    const randomList = computed(() => {
      return random.value
    })
    const guessYouLikeList = computed(() => {
      return guessYouLike.value
    })
    const onScroll = (offsetY) => {
      dispatch('setOffsetY', offsetY)
      if (offsetY > 0) {
        scrollTop.value = 52
      } else {
        scrollTop.value = 94
      }
      ctx.$refs.scroll.refresh()
    }

    onMounted(() => {
      home().then((res) => {
        if (res && res.status === 200) {
          const data = res.data
          const randomIndex = Math.floor(Math.random() * data.random.length)
          random.value = data.random[randomIndex]
          banner.value = data.banner
          guessYouLike.value = data.guessYouLike
          recommend.value = data.recommend
          featured.value = data.featured
          categoryList.value = data.categoryList
          categories.value = data.categories
        }
      })
    })
    return {
      scrollTop,
      randomList,
      guessYouLikeList,
      banner,
      recommend,
      featured,
      categoryList,
      categories,
      onScroll
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/styles/global.scss";
.store-home {
  width: 100%;
  height: 100%;
  .banner-wrapper {
    width: 100%;
    padding: px2rem(10);
    box-sizing: border-box;
    .banner-img {
      width: 100%;
      height: px2rem(150);
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
  }
  .recommend {
    margin-top: px2rem(20);
  }
  .featured {
    margin-top: px2rem(20);
  }
  .category-list-wrapper {
    margin-top: px2rem(20);
  }
  .categories {
    margin-top: px2rem(20);
  }
}
</style>
