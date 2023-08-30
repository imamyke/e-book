<template>
  <div class="book-list-wrapper">
    <detail-title
      ref="title"
      :title="title"
      :showShelf="true"
      @back="back"
    />
    <scroll
      class="book-list-scroll-wrapper"
      ref="scroll"
      :top="42"
      @onScroll="onScroll"
    >
      <featured
        v-for="(value, key, index) in lists"
        :data="value"
        :titleText="titleText ? titleText : getCategoryText(key)"
        :btnText="''"
        :key="index"
      ></featured>
    </scroll>
  </div>
</template>

<script>
import DetailTitle from '@/components/detail/DetailTitle.vue'
import Scroll from '@/components/common/Scroll.vue'
import Featured from '@/components/store/Featured.vue'
import { realPx } from '@/utils/utils'
import { list } from '@/api/store'
import { useRouter, useRoute } from 'vue-router'
import { categoryList, categoryText } from '@/utils/store'
import { ref, computed, getCurrentInstance, reactive, toRefs } from 'vue'

const getItems = (ctx, proxy) => {
  const route = useRoute()
  const router = useRouter()
  const total = ref('')
  const titleText = ref('')
  const lists = reactive({ items: {} })
  const back = () => { router.go(-1) }
  const getList = () => { // 通过API获取分类列表
    list().then(response => {
      lists.items = response.data.data
      total.value = response.data.total
      const category = route.query.category
      const keyword = route.query.keyword
      if (category) { // 如果用户传入了分类数据，则从结果中搜索相应的分类数据并进行展示
        const key = Object.keys(lists.items).filter(item => item === category)[0]
        const data = lists.items[key]
        lists.items = {}
        lists.items[key] = data
      } else if (keyword) {
        Object.keys(lists.items).filter(key => { // 如果用户输入了关键字，则通过书名进行关键字匹配（搜索算法）
          lists.items[key] = lists.items[key].filter(book => book.fileName.indexOf(keyword) >= 0)
          return lists.items[key].length > 0
        })
      }
      titleText.value = route.query.categoryText
    })
  }
  const onScroll = (offsetY) => { // 标题阴影的隐藏状态
    if (offsetY > realPx(42)) {
      ctx.$refs.title.showShadow()
    } else {
      ctx.$refs.title.hideShadow()
    }
  }
  const title = computed(() => {
    if (lists) {
      return total.value && proxy.$t('home.allBook').replace('$1', totalNumber.value)
    } else {
      return null
    }
  })
  const totalNumber = computed(() => {
    let num = 0
    Object.keys(lists.items).forEach(key => {
      num += lists.items[key].length
    })
    return num
  })
  const getCategoryText = (key) => {
    return `${categoryText(categoryList[key], proxy)}(${lists.items[key].length})`
  }
  const { items } = toRefs(lists)
  return { items, getList, total, titleText, title, totalNumber, back, onScroll, getCategoryText }
}

export default {
  name: 'StoreList',
  components: { DetailTitle, Scroll, Featured },
  setup () {
    const { ctx, proxy } = getCurrentInstance()
    const {
      back,
      getList,
      onScroll,
      getCategoryText,
      items,
      title,
      titleText,
      totalNumber
    } = getItems(ctx, proxy)
    getList()

    return {
      title,
      totalNumber,
      titleText,
      lists: items,
      getCategoryText,
      back,
      onScroll
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/global.scss';
.book-list-wrapper {
  width: 100%;
  height: 100%;
  background: white;
}
</style>
