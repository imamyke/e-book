<template>
  <div class="book-detail">
    <detail-title
      @back="back"
      :showShelf="true"
      ref="title"
    />
    <scroll
      class="content-wrapper"
      :top="42"
      :bottom="52"
      @onScroll="onScroll"
      ref="scroll"
    >
      <book-info
        :cover="cover"
        :title="title"
        :author="author"
        :desc="desc"
      />
      <div class="book-detail-content-wrapper">
        <div class="book-detail-content-title">{{$t('detail.copyright')}}</div>
        <div class="book-detail-content-list-wrapper">
          <div class="book-detail-content-row">
            <div class="book-detail-content-label">{{$t('detail.publisher')}}</div>
            <div class="book-detail-content-text">{{publisher}}</div>
          </div>
          <div class="book-detail-content-row">
            <div class="book-detail-content-label">{{$t('detail.category')}}</div>
            <div class="book-detail-content-text">{{categoryText}}</div>
          </div>
          <div class="book-detail-content-row">
            <div class="book-detail-content-label">{{$t('detail.lang')}}</div>
            <div class="book-detail-content-text">{{lang}}</div>
          </div>
          <div class="book-detail-content-row">
            <div class="book-detail-content-label">{{$t('detail.ISBN')}}</div>
            <div class="book-detail-content-text">{{isbn}}</div>
          </div>
        </div>
      </div>
      <div class="book-detail-content-wrapper">
        <div class="book-detail-content-title">{{$t('detail.navigation')}}</div>
        <div class="book-detail-content-list-wrapper">
          <div
            class="loading-text-wrapper"
            v-if="!navigation"
          >
            <span class="loading-text">{{$t('detail.loading')}}</span>
          </div>
          <div class="book-detail-content-item-wrapper">
            <div
              class="book-detail-content-item"
              v-for="(item, index) in flatNavigation"
              :key="index"
              @click="read(item)"
            >
              <div
                class="book-detail-content-navigation-text"
                :class="{'is-sub': item.deep> 1}"
                :style="itemStyle(item)"
                v-if="item.label"
              >{{item.label}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="book-detail-content-wrapper">
        <div class="book-detail-content-title">{{$t('detail.trial')}}</div>
        <div class="book-detail-content-list-wrapper">
          <div
            class="loading-text-wrapper"
            v-show="!displayed"
          >
            <span class="loading-text">{{$t('detail.loading')}}</span>
          </div>
        </div>
        <div
          id="preview"
          v-show="displayed"
          ref="preview"
        />
      </div>
    </scroll>
    <div class="bottom-wrapper">
      <div
        class="bottom-btn"
        @click.stop.prevent="readBook()"
      >{{$t('detail.read')}}</div>
      <div
        class="bottom-btn"
        @click.stop.prevent="trialListening()"
      >{{$t('detail.listen')}}</div>
      <div
        class="bottom-btn"
        @click.stop.prevent="addOrRemoveShelf()"
      >
        <span
          class="icon-check"
          v-if="inBookShelf"
        ></span>
        {{inBookShelf ? $t('detail.isAddedToShelf') : $t('detail.addOrRemoveShelf')}}
      </div>
    </div>
    <toast :text="toastText" ref="toast"></toast>
  </div>
</template>

<script>
import DetailTitle from '@/components/detail/DetailTitle.vue'
import BookInfo from '@/components/detail/BookInfo.vue'
import Scroll from '@/components/common/Scroll.vue'
import Toast from '@/components/common/Toast.vue'
import { computed, ref, getCurrentInstance, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { detail } from '@/api/store'
import { px2rem, realPx } from '@/utils/utils'
import { getLocalForage } from '@/utils/localForage'
import { removeFromBookShelf, addToShelf } from '@/utils/store'
import { getBookShelf, saveBookShelf } from '@/utils/localStorage'
import { useShelfEffect } from '@/components/shelf/useShelfEffect'
import Epub from 'epubjs'
global.ePub = Epub

export default {
  name: 'StoreDetail',
  components: { DetailTitle, BookInfo, Scroll, Toast },
  setup () {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { getters, dispatch } = store
    const { ctx } = getCurrentInstance()
    const { getShelfList } = useShelfEffect(store)
    const fileName = ref(null)
    const bookItem = ref(null)
    const book = ref(null)
    const title = ref(null)
    const cover = ref(null)
    const navigation = ref(null)
    const displayed = ref(false)
    const rendition = ref(null)
    const isbn = ref(null)
    const description = ref(null)
    const toastText = ref('')
    const categoryText = ref(null)
    const publisher = ref(null)
    const author = ref(null)
    const opf = ref(null)
    const lang = ref(null)
    // const trialRead = ref(null)
    // const audio = ref(null)
    // const randomLocation = ref(null)
    // const trialText = ref(null)
    const desc = computed(() => { // 获取电子书摘要
      if (description.value) {
        return description.value.substring(0, 100)
      } else {
        return ''
      }
    })
    const flatNavigation = computed(() => { // 将电子书目录转为一维数组
      if (navigation.value) {
        return Array.prototype.concat.apply([], Array.prototype.concat.apply([], doFlatNavigation(navigation.value.toc)))
      } else {
        return []
      }
    })

    const inBookShelf = computed(() => { // 判断当前的电子书是否存在于书架
      if (bookItem.value && getters.shelfList) {
        // 定义一个自执行函数，将书架转为一维数组结构，并且只保留type为1的数据（type=1的为电子书）
        const flatShelf = (function flatten (arr) {
          return [].concat(...arr.map(v => v.itemList ? [v, ...flatten(v.itemList)] : v))
        })(getters.shelfList).filter(item => item.type === 1)
        // 查找当前电子书是否存在于书架
        const book = flatShelf.filter(item => item.fileName === bookItem.value.fileName)
        return book && book.length > 0
      } else {
        return false
      }
    })
    const init = () => {
      fileName.value = route.query.fileName // 获取电子书书名
      categoryText.value = route.query.category // 获取电子书分类

      if (fileName.value) {
        detail({ fileName: fileName.value }).then(response => { // 请求API，获取电子书详情数据
          if (response.status === 200 && response.data.error_code === 0 && response.data.data) {
            const data = response.data.data
            bookItem.value = data // 保存电子书详情数据
            cover.value = bookItem.value.cover // 获取封面数据
            categoryText.value = bookItem.value.categoryText
            let rootFile = data.rootFile // 获取rootFile数据
            if (rootFile.startsWith('/')) {
              rootFile = rootFile.substring(1, rootFile.length)
            }
            // 根据rootFile拼接出opf文件路径
            opf.value = `${process.env.VUE_APP_EPUB_OPF_URL}/${fileName.value}/${rootFile}`
            parseBook(opf.value) // 解析电子书
          } else {
            showToast(response.data.msg)
          }
        })
      }
    }
    // 解析电子书
    const parseBook = (url) => {
      book.value = new Epub(url) // 通过电子书或opf文件的url生成Book对象
      book.value.loaded.metadata.then(metadata => { // 获取电子书的metadata信息
        title.value = metadata.title
        publisher.value = metadata.publisher
        lang.value = metadata.language
        author.value = metadata.creator
        isbn.value = metadata.identifier
      })
      // 获取电子书的目录信息
      book.value.loaded.navigation.then(nav => {
        navigation.value = nav
        if (navigation.value.toc && navigation.value.toc.length > 1) { // 通过第二章的目录（第一章通常是封面，所以获取第二章）
          // 将第二章进行渲染（渲染的内容隐藏在屏幕外，用户是看不见的）
          const candisplay = display(navigation.value.toc[1].href)
          if (candisplay) {
            candisplay.then(section => {
              if (ctx.$refs.scroll) {
                ctx.$refs.scroll.refresh()
              }
              displayed.value = true
              // 渲染成功后通过section获取HTML文本，将HTML标签进行替换，提取纯文本信息
              // eslint-disable-next-line prefer-regex-literals
              const reg = new RegExp('<.+?>', 'g')
              const text = section.output.replace(reg, '').replace(/\s\s/g, '')
              description.value = text // 将纯文本信息保存到description变量中，用于进行摘要信息展示
            })
          }
        }
      })
    }
    const addOrRemoveShelf = () => {
      // 如果电子书存在于书架，则从书架中移除电子书
      if (inBookShelf.value) {
        dispatch('setShelfList', removeFromBookShelf(bookItem.value))
          .then(() => saveBookShelf(getters.shelfList)) // 将书架数据保存到LocalStorage
      } else {
        addToShelf(bookItem) // 如果电子书不存在于书架，则添加电子书到书架
        dispatchEvent('setShelfList', getBookShelf())
      }
    }
    // 展示Toast弹窗
    const showToast = (text) => {
      toastText.value = text
      ctx.$refs.toast.show()
    }
    // 阅读电子书
    const readBook = () => {
      router.push({ // 跳转到阅读器页面
        path: `/ebook/${bookItem.value.categoryText}|${fileName.value}`
      })
    }
    // 听书
    const trialListening = () => {
      // 如果电子书已经缓存，从IndexedDB中读取电子书
      getLocalForage(bookItem.value.fileName, (err, blob) => {
        console.log(blob)
        if (!err && blob && blob instanceof Blob) {
          router.push({
            path: '/store/speaking',
            query: { fileName: bookItem.value.fileName }
          })
        } else {
          // 如果没有缓存，直接跳转到听书页面
          router.push({
            path: '/store/speaking',
            query: {
              fileName: bookItem.value.fileName,
              opf: opf.value
            }
          })
        }
      })
    }
    // 通过章节阅读电子书
    const read = (item) => {
      router.push({
        path: `/ebook/${categoryText.value}|${fileName.value}`,
        query: {
          href: item.href
        }
      })
    }
    // 电子书目录缩进样式
    const itemStyle = (item) => {
      return {
        marginLeft: (item.deep - 1) * px2rem(20) + 'rem'
      }
    }
    // 将目录从多维转为一维
    const doFlatNavigation = (content, deep = 1) => {
      const arr = []
      content.forEach(item => {
        item.deep = deep
        arr.push(item)
        if (item.subitems && item.subitems.length > 0) {
          arr.push(doFlatNavigation(item.subitems, deep + 1))
        }
      })
      return arr
    }
    const downloadBook = () => { // 通过opf下载电子书（实现逐章下载，提供电子书访问性能）
      // 拼接opf文件路径
      const opf = `${process.env.VUE_APP_EPUB_URL}/${bookItem.value.categoryText}/${bookItem.value.fileName}/OEBPS/package.opf`
      parseBook(opf)
    }
    const back = () => {
      router.go(-1)
    }
    const display = (location) => { // 根据传入的目录信息，渲染电子书
      if (ctx.$refs.preview) {
        if (!rendition.value) {
          rendition.value = book.value.renderTo('preview', {
            width: window.innerWidth > 640 ? 640 : window.innerWidth,
            height: window.innerHeight,
            method: 'default'
          })
        }
        if (!location) {
          return rendition.value.display()
        } else {
          return rendition.value.display(location)
        }
      }
    }
    // 处理用户滚动事件，确定标题阴影的显示状态
    const onScroll = (offsetY) => {
      if (offsetY > realPx(42)) {
        ctx.$refs.title.showShadow()
      } else {
        ctx.$refs.title.hideShadow()
      }
    }
    onMounted(() => {
      init()
      if (!getters.shelfList || getters.shelfList.length === 0) {
        getShelfList()
      }
    })
    return {
      desc,
      title,
      cover,
      author,
      publisher,
      flatNavigation,
      navigation,
      lang,
      isbn,
      categoryText,
      displayed,
      inBookShelf,
      onScroll,
      back,
      downloadBook,
      read,
      addOrRemoveShelf,
      showToast,
      readBook,
      trialListening,
      itemStyle
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/global.scss';
.book-detail {
  width: 100%;
  background: white;
  .content-wrapper {
    width: 100%;
    .book-detail-content-wrapper {
      width: 100%;
      border-bottom: px2rem(1) solid #eee;
      box-sizing: border-box;
      .book-detail-content-title {
        font-size: px2rem(20);
        font-weight: bold;
        padding: px2rem(20) px2rem(15) px2rem(10) px2rem(15);
        box-sizing: border-box;
      }
      .book-detail-content-list-wrapper {
        padding: px2rem(10) px2rem(15);
        box-sizing: border-box;
        .loading-text-wrapper {
          width: 100%;
          .loading-text {
            font-size: px2rem(14);
            color: #666;
          }
        }
        .book-detail-content-row {
          display: flex;
          box-sizing: border-box;
          margin-bottom: px2rem(10);
          .book-detail-content-label {
            flex: 0 0 px2rem(70);
            font-size: px2rem(14);
            color: #666;
          }
          .book-detail-content-text {
            flex: 1;
            font-size: px2rem(14);
            color: #333;
          }
        }
        #preview {
        }
        .book-detail-content-item-wrapper {
          .book-detail-content-item {
            padding: px2rem(15) 0;
            font-size: px2rem(14);
            line-height: px2rem(16);
            color: #666;
            border-bottom: px2rem(1) solid #eee;
            &:last-child {
              border-bottom: none;
            }
            .book-detail-content-navigation-text {
              width: 100%;
              @include ellipsis;
              &.is-sub {
                color: #666;
              }
            }
          }
        }
      }
    }
    .audio-wrapper {
      width: 100%;
      padding: px2rem(15);
      box-sizing: border-box;
      #audio {
        width: 100%;
      }
    }
  }
  .bottom-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 120;
    display: flex;
    width: 100%;
    height: px2rem(52);
    box-shadow: 0 px2rem(-2) px2rem(2) rgba(0, 0, 0, .1);
    .bottom-btn {
      flex: 1;
      color: $color-blue;
      font-weight: bold;
      font-size: px2rem(14);
      @include center;
      &:active {
        color: $color-blue-transparent;
      }
      .icon-check {
        margin-right: px2rem(5);
      }
    }
    &.hide-shadow {
      box-shadow: none;
    }
  }
}
</style>
