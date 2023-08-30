<template>
  <div class="featured">
    <Title
      :label="titleText"
      :btn="btnText"
      v-if="titleVisible && data && data.length > 0"
    ></Title>
    <div class="featured-list">
      <div class="featured-item-wrapper">
        <div
          class="featured-item"
          v-for="(item, index) in data"
          :key="index"
          @click="showBookDetail(item)"
        >
          <div class="img-wrapper">
            <img class="img" :src="item.cover">
          </div>
          <div class="content-wrapper">
            <div
              class="title title-small"
              ref="title"
            >{{item.title}}</div>
            <div
              class="author sub-title-tiny"
              ref="author"
            >{{item.author}}</div>
            <div
              class="category third-title-tiny"
              ref="category"
            >{{categoryTitle(item.category)}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from './Title.vue'
import { computed, getCurrentInstance, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { realPx } from '../../utils/utils'
import { useStoreEffect } from './useStoreEffect'
import { categoryText } from '@/utils/store'

export default {
  name: 'Featured',
  components: { Title },
  props: {
    data: Array,
    titleVisible: {
      type: Boolean,
      default: true
    },
    titleText: {
      type: String
    },
    btnText: {
      type: String
    }
  },
  setup (props) {
    const router = useRouter()
    const { showBookDetail } = useStoreEffect(router)
    const { proxy, ctx } = getCurrentInstance()
    const width = computed(() => {
      return window.innerWidth - realPx(20) - realPx(60) + 'px'
    })
    const categoryTitle = (category) => {
      return categoryText(category, proxy)
    }
    const resize = () => {
      nextTick(() => {
        ctx.$refs.title.forEach(item => {
          item.style.width = width.value
        })
        ctx.$refs.author.forEach(item => {
          item.style.width = width.value
        })
        ctx.$refs.category.forEach(item => {
          item.style.width = width.value
        })
      })
    }

    return {
      width,
      showBookDetail,
      categoryTitle,
      resize
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";

.featured {
  .featured-list {
    width: 100%;
    padding: 0 px2rem(10);
    box-sizing: border-box;
    .featured-item-wrapper {
      width: 100%;
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      align-items: flex-start;
      .featured-item {
        flex: 0 0 50%;
        width: 50%;
        padding: px2rem(5) 0;
        @include top;
        .img-wrapper {
          flex: 0 0 30%;
          width: 30%;
          .img {
            width: 100%;
            // width: px2rem(50);
            // height: px2rem(75);
          }
        }
        .content-wrapper {
          flex: 1;
          width: px2rem(117.5);
          padding: 0 px2rem(5);
          box-sizing: border-box;
          .author {
            margin-top: px2rem(15);
          }
          .category {
            margin-top: px2rem(5);
          }
        }
      }
    }
  }
}

</style>
