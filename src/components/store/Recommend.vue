<template>
  <div class="recommend">
    <Title
      :label="$t('home.recommend')"
      :btn="$t('home.seeAll')"
    />
    <div class="recommend-list">
      <div
        class="recommend-item"
        v-for="(item, index) in data"
        :key="index"
        @click="showBookDetail(item)"
      >
        <div class="img-wrapper">
          <img class="img" :src="item.cover">
        </div>
        <div class="content-wrapper">
          <div class="title title-medium" ref="title">{{item.title}}</div>
          <div class="num sub-title" ref="num">{{$t('home.readers').replace('$1', item.readers)}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from './Title.vue'
import { useStoreEffect } from './useStoreEffect'
import { useRouter } from 'vue-router'

export default {
  name: 'Recommend',
  props: ['data'],
  components: { Title },
  setup () {
    const router = useRouter()
    const { showBookDetail } = useStoreEffect(router)
    return { showBookDetail }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
.recommend {
  .recommend-list {
    width: 100%;
    @include top;
    padding: 0 px2rem(5);
    box-sizing: border-box;
    .recommend-item {
      flex: 0 0 33.33%;
      width: 33.33%;
      padding: 0 px2rem(5);
      box-sizing: border-box;
      .img-wrapper {
        @include center;
        .img {
          width: 80%;
        }
      }
      .content-wrapper {
        width: 100%;
        margin-top: px2rem(10);
        @include columnCenter;
        .title {
          text-align: center;
        }
        .num {
          margin-top: px2rem(5);
        }
      }
    }
  }
}
</style>
