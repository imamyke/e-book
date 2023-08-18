<template>
  <div class="home">
    <span class="text">Amy</span>
    <span class="icon-book"></span>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home'

}
</script>

<style lang="scss" scoped>
@import '../assets/styles/global.scss';
.text {
  font-family: 'Days One';
  font-size: px2rem(30);
  color: orange;
}
</style>
