<template>
  <div class="category-book">
    <Title
      :label="categoryTitle(data.category)"
      :btn="$t('home.seeAll')"
      @onClick="showBookCategory"
    ></Title>
    <div class="category-book-list">
      <div
        class="category-book-item"
        v-for="(item, index) in data.list"
        :key="index"
        @click="showBookDetail(item)"
      >
        <div class="img-wrapper">
          <img class="img" :src="item.cover">
        </div>
        <div class="content-wrapper">
          <div class="title title-small" ref="title">{{item.title}}</div>
          <div class="num sub-title-tiny" ref="author">{{item.author}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from './Title.vue'
import { getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreEffect } from './useStoreEffect'
import { getCategoryName, categoryText } from '@/utils/store'
export default {
  name: 'CategoryBook',
  components: { Title },
  props: ['data'],
  setup (props) {
    const router = useRouter()
    const { showBookDetail } = useStoreEffect(router)
    const { proxy } = getCurrentInstance()
    const showBookCategory = () => {
      router.push({
        path: '/store/list',
        query: {
          category: getCategoryName(props.data.category),
          categoryText: categoryText(props.data.category, proxy)
        }
      })
    }
    const categoryTitle = (category) => {
      return categoryText(category, proxy)
    }
    return {
      showBookCategory,
      categoryTitle,
      showBookDetail
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
.category-book {
  .category-book-list {
    width: 100%;
    @include top;
    padding: 0 px2rem(5);
    box-sizing: border-box;
    .category-book-item {
      flex: 0 0 25%;
      width: 25%;
      padding: 0 px2rem(5);
      box-sizing: border-box;
      .img-wrapper {
        @include center;
        .img {
          width: 100%;
        }
      }
      .content-wrapper {
        width: 100%;
        margin-top: px2rem(10);
        .num {
          margin-top: px2rem(5);
        }
      }
    }
  }
}

</style>
