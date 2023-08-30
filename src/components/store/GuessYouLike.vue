<template>
  <div class="guess-you-like">
    <Title
      :label="$t('home.guessYouLike')"
      :btn="$t('home.change')"
      @onClick="change"
    />
    <div class="guess-you-like-list">
      <div
        class="guess-you-like-item"
        v-for="(item, index) in showData"
        :key="index"
        @click="showBookDetail(item)"
      >
        <div class="img-wrapper">
          <img class="img" :src="item.cover">
        </div>
        <div class="content-wrapper">
          <div class="title title-big" ref="title">{{item.title}}</div>
          <div class="author sub-title" ref="author">{{item.author}}</div>
          <div class="result third-title" ref="result">{{resultText(item)}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from './Title.vue'
import { computed, nextTick, getCurrentInstance, watch, ref } from 'vue'
import { realPx } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useStoreEffect } from './useStoreEffect'

export default {
  name: 'GuessYouLike',
  components: { Title },
  props: ['data'],
  setup (props) {
    const router = useRouter()
    const index = ref(0)
    const total = ref(0)
    const { ctx, proxy } = getCurrentInstance()
    const { showBookDetail } = useStoreEffect(router)
    const width = computed(() => {
      return window.innerWidth - realPx(20) - realPx(60) + 'px'
    })
    const showData = computed(() => {
      if (props.data) {
        return [
          props.data[index.value],
          props.data[index.value + total.value],
          props.data[index.value + total.value * 2]
        ]
      } else {
        return []
      }
    })
    const change = () => {
      if (index.value + 1 >= total.value) {
        index.value = 0
      } else {
        index.value++
      }
    }
    const resultText = (item) => {
      if (item && item.type && item.result) {
        switch (item.type) {
          case 1:
            return proxy.$t('home.sameAuthor').replace('$1', item.result)
          case 2:
            return proxy.$t('home.sameReader').replace('$1', item.result)
          case 3:
            return proxy.$t('home.readPercent').replace('$1', item.percent).replace('$2', item.result)
        }
      }
    }
    const resize = () => {
      nextTick(() => {
        ctx.$refs.title.forEach(item => {
          item.style.width = width
        })
        ctx.$refs.author.forEach(item => {
          item.style.width = width
        })
        ctx.$refs.result.forEach(item => {
          item.style.width = width
        })
      })
    }
    watch(() => props.data, (newValue) => {
      total.value = newValue.length / 3
    })
    return {
      width,
      showData,
      change,
      resultText,
      resize,
      showBookDetail
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";

.guess-you-like {
  .guess-you-like-list {
    width: 100%;
    padding: 0 px2rem(10);
    box-sizing: border-box;
    .guess-you-like-item {
      display: flex;
      margin-top: px2rem(15);
      &:first-child {
        margin-top: px2rem(5);
      }
      .img-wrapper {
        flex: 0 0 20%;
        padding: px2rem(10) px2rem(10) px2rem(10) 0;
        box-sizing: border-box;
        .img {
          width: 100%;
        }
      }
      .content-wrapper {
        flex: 1;
        padding: px2rem(10) 0;
        box-sizing: border-box;
        .author {
          margin-top: px2rem(15);
        }
        .result {
          margin-top: px2rem(5);
        }
      }
    }
  }
}
</style>
