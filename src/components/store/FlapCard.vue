<template>
  <div
    class="flap-card-wrapper"
    v-show="flapCardVisible"
  >
    <div
      class="flap-card-bg"
      :class="{'animation': runFlapCardAnimation}"
      v-show="runFlapCardAnimation"
    >
      <div
        class="flap-card"
        v-for="(item, index) in FLAP_CARD_LIST"
        :key="index"
        :style="{zIndex: item.zIndex}"
      >
        <div class="flap-card-circle">
          <div
            ref="leftRef"
            class="flap-card-semi-circle flap-card-semi-circle-left"
            :style="semiCircleStyle(item, 'left')"
          />
          <div
            ref="rightRef"
            class="flap-card-semi-circle flap-card-semi-circle-right"
            :style="semiCircleStyle(item, 'right')"
          />
        </div>
      </div>
      <div class="point-wrapper">
        <div
          class="point"
          :class="{'animation': runPointAnimation}"
          v-for="item in pointList"
          :key="item"
        ></div>
      </div>
    </div>
    <div
      class="book-card"
      :class="{'animation': runBookCardAnimation}"
      v-show="runBookCardAnimation"
    >
      <div class="book-card-wrapper">
        <div class="img-wrapper">
          <img
            class="img"
            :src="data ? data.cover : ''"
          />
        </div>
        <div class="content-wrapper">
          <div class="content-title">{{data ? data.title : ''}}</div>
          <div class="content-author sub-title-medium">{{data ? data.author : ''}}</div>
          <div class="content-category">{{categoryTextWord}}</div>
        </div>
        <div
          class="read-btn"
          @click.stop="showBookDetail(data)"
        >{{$t('home.readNow')}}</div>
      </div>
    </div>
    <div
      class="close-btn-wrapper"
      @click="close"
    >
      <div class="icon-close"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, getCurrentInstance, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { flapCardList, categoryText } from '@/utils/store'
import { useStoreEffect } from './useStoreEffect'

export default {
  name: 'FlapCard',
  props: ['data'],
  setup (props) {
    const { dispatch, getters } = useStore()
    const router = useRouter()
    const { ctx, proxy } = getCurrentInstance()
    const { showBookDetail } = useStoreEffect(router)
    let front = 0
    let back = 1
    let task = null
    const timeout = {}
    const intervalTime = 25
    const FLAP_CARD_LIST = ref(flapCardList) // 重要!!!
    const runFlapCardAnimation = ref(false)
    const pointList = ref([])
    const runPointAnimation = ref(false)
    const runBookCardAnimation = ref(false)
    const flapCardVisible = computed(() => { return getters.flapCardVisible })
    const categoryTextWord = computed(() => {
      if (props.data) {
        return categoryText(props.data.category, proxy)
      } else {
        return ''
      }
    })
    const close = () => {
      stopAnimation()
      dispatch('setFlapCardVisible', false)
    }
    const semiCircleStyle = (item, dir) => {
      return {
        backgroundColor: `rgb(${item.r}, ${item.g}, ${item.b})`,
        backgroundSize: item.backgroundSize,
        backgroundImage: dir === 'left' ? item.imgLeft : item.imgRight
      }
    }
    const rotate = (index, type) => {
      const item = flapCardList[index]
      let dom
      if (type === 'front') {
        dom = ctx.$refs.rightRef[index]
      } else {
        dom = ctx.$refs.leftRef[index]
      }
      dom.style.transform = `rotateY(${item.rotateDegree}deg)`
      dom.style.backgroundColor = `rgb(${item.r}, ${item._g}, ${item.b})`
    }
    const flapCardRotate = () => {
      const frontFlapCard = FLAP_CARD_LIST.value[front]
      const backFlapCard = FLAP_CARD_LIST.value[back]
      frontFlapCard.rotateDegree += 10
      frontFlapCard._g -= 5
      backFlapCard.rotateDegree -= 10
      backFlapCard._g += 5
      if (backFlapCard.rotateDegree < 90) {
        backFlapCard._g += 5
      }
      if (frontFlapCard.rotateDegree === 90 && backFlapCard.rotateDegree === 90) {
        backFlapCard.zIndex += 2
      }
      rotate(front, 'front')
      rotate(back, 'back')
      if (frontFlapCard.rotateDegree === 180 && backFlapCard.rotateDegree === 0) {
        next()
      }
    }
    const startFlapCardAnimation = () => {
      prepare()
      task = setInterval(() => { flapCardRotate() }, intervalTime)
    }
    const startPointAnimation = () => { // 點點動畫
      runPointAnimation.value = true
      setTimeout(() => { // 秒數 for point animation 結束的秒數
        runPointAnimation.value = false
      }, 750)
    }
    const stopAnimation = () => {
      if (task) {
        clearInterval(task)
      }
      if (timeout.flapCard) {
        clearTimeout(timeout.flapCard)
      }
      if (timeout.bookCard) {
        clearTimeout(timeout.bookCard)
      }
      reset()
    }
    const runAnimation = () => {
      runFlapCardAnimation.value = true
      for (let i = 0; i < 18; i++) {
        pointList.value.push(`point${i}`)
      }
      timeout.flapCard = setTimeout(() => { // 秒數 for flapCardVisible = true 後的時間
        startFlapCardAnimation()
        startPointAnimation()
      }, 300)
      timeout.bookCard = setTimeout(() => { // 秒數 for 何時要結束動畫
        stopAnimation()
        runBookCardAnimation.value = true
      }, 2500)
    }
    const reset = () => { // 對整個頁面的重製
      front = 0
      back = 1
      flapCardList.forEach((item, index) => {
        item.zIndex = 100 - index
        item._g = item.g
        item.rotateDegree = 0
        rotate(index, 'front')
        rotate(index, 'back')
      })
      runBookCardAnimation.value = false
      runFlapCardAnimation.value = false
      runPointAnimation.value = false
    }
    const prepare = () => {
      const backFlapCard = FLAP_CARD_LIST.value[back]
      backFlapCard.rotateDegree = 180
      backFlapCard._g = backFlapCard.g - 5 * 9
      rotate(back, 'back')
    }
    const next = () => {
      const frontFlapCard = FLAP_CARD_LIST.value[front]
      const backFlapCard = FLAP_CARD_LIST.value[back]
      frontFlapCard.rotateDegree = 0
      backFlapCard.rotateDegree = 0
      frontFlapCard._g = frontFlapCard.g
      backFlapCard._g = backFlapCard.g
      rotate(front, 'front')
      rotate(back, 'back')
      front++
      back++
      const len = FLAP_CARD_LIST.value.length
      if (front >= len) {
        front = 0
      }
      if (back >= len) {
        back = 0
      }
      flapCardList.forEach((item, index) => {
        item.zIndex = 100 - ((index - front + len) % len)
      })
      prepare()
    }

    watch(() => getters.flapCardVisible, (newValue) => {
      newValue && runAnimation()
    })

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      flapCardVisible,
      FLAP_CARD_LIST,
      intervalTime,
      runFlapCardAnimation,
      pointList,
      runPointAnimation,
      runBookCardAnimation,
      categoryTextWord,
      close,
      semiCircleStyle,
      showBookDetail,
      rotate
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/styles/global.scss';
@import '../../assets/styles/flapCard.scss';
.flap-card-wrapper {
  z-index: 1000;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .6);
  @include center;
  @include absCenter;
  .flap-card-bg {
    width: 100%;
    height: 100%;
    position: relative;
    width: px2rem(64);
    height: px2rem(64);
    border-radius: px2rem(5);
    background: white;
    // 默認
    transform: scale(0);
    opacity: 0;
    &.animation {
      animation: flap-card-move .3s ease-in both;
    }
    @keyframes flap-card-move {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      75% {
        transform: scale(.9);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .flap-card {
      width: px2rem(48);
      height: px2rem(48);
      @include absCenter;
      .flap-card-circle {
        display: flex;
        width: 100%;
        height: 100%;
        .flap-card-semi-circle {
          flex: 0 0 50%;
          width: 50%;
          height: 100%;
          background-repeat: no-repeat;
          backface-visibility: hidden;
        }
        .flap-card-semi-circle-left {
          border-radius: px2rem(24) 0 0 px2rem(24);
          background-position: center right;
          transform-origin: right;
        }
        .flap-card-semi-circle-right {
          border-radius: 0 px2rem(24) px2rem(24) 0;
          background-position: center left;
          transform-origin: left;
        }
      }
    }
    .point-wrapper {
      z-index: 1500;
      @include absCenter;
      .point {
        border-radius: 50%;
        @include absCenter;
        &.animation {
          @for $i from 1 to length($moves) {
            &:nth-child(#{$i}) {
              @include move($i);
            }
          }
        }
      }
    }
  }
  .book-card {
    position: relative;
    width: 65%;
    max-width: px2rem(400);
    box-sizing: border-box;
    border-radius: px2rem(15);
    background: white;
    &.animation {
      animation: scale .3s ease-in both;
      @keyframes scale {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    }
    .book-card-wrapper {
      width: 100%;
      height: 100%;
      margin-bottom: px2rem(30);
      @include columnTop;
      .img-wrapper {
        width: 100%;
        margin-top: px2rem(20);
        @include center;
        .img {
          width: px2rem(90);
          height: px2rem(130);
        }
      }
      .content-wrapper {
        padding: 0 px2rem(20);
        margin-top: px2rem(20);
        .content-title {
          color: #333;
          font-weight: bold;
          font-size: px2rem(18);
          line-height: px2rem(20);
          max-height: px2rem(40);
          text-align: center;
          @include ellipsis2(2)
        }
        .content-author {
          margin-top: px2rem(10);
          text-align: center;
        }
        .content-category {
          color: #999;
          font-size: px2rem(14);
          margin-top: px2rem(10);
          text-align: center;
        }
      }
      .read-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1100;
        width: 100%;
        border-radius: 0 0 px2rem(15) px2rem(15);
        padding: px2rem(15) 0;
        text-align: center;
        color: white;
        font-size: px2rem(14);
        background: $color-blue;
      }
    }
  }
  .close-btn-wrapper {
    position: absolute;
    left: 0;
    bottom: px2rem(30);
    z-index: 1100;
    width: 100%;
    @include center;
    .icon-close {
      width: px2rem(45);
      height: px2rem(45);
      border-radius: 50%;
      background: #333;
      font-size: px2rem(25);
      color: white;
      @include center;
    }
  }
}
</style>
