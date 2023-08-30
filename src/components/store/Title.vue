<template>
  <div class="home-title-wrapper">
    <div class="label">{{label}}</div>
    <div class="btn" @click="click">{{btn}}</div>
  </div>
</template>

<script>
export default {
  name: 'Title',
  props: ['label', 'btn'],
  emits: ['onClick'],
  setup (props, { emit }) {
    const click = () => { emit('onClick') }
    return { click }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
.home-title-wrapper {
  width: 100%;
  padding: px2rem(15) px2rem(10);
  box-sizing: border-box;
  @include top;
  .label {
    flex: 1;
    font-size: px2rem(18);
    color: #333;
    font-weight: bold;
  }
  .btn {
    font-size: px2rem(14);
    color: rgba(64, 158, 255, 1);
    &:active {
      color: rgba(64, 158, 255, .5);
    }
  }
}
</style>
