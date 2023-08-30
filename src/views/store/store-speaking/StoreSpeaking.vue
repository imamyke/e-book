<!-- 听书组件 -->
<template>
  <div class="book-speaking">
    <detail-title
      ref="title"
      @back="back"
    ></detail-title>
    <scroll
      ref="scroll"
      class="content-wrapper"
      :top="42"
      :bottom="scrollBottom"
      :ifNoScroll="disableScroll"
      @onScroll="onScroll"
    >
      <book-info
        :cover="cover"
        :title="title"
        :author="author"
        :desc="desc"
      ></book-info>
      <div class="book-speak-title-wrapper">
        <div class="icon-speak-wrapper">
          <span class="icon-speak"></span>
        </div>
        <div class="speak-title-wrapper">
          <span class="speak-title">{{$t('speak.voice')}}</span>
        </div>
        <div
          class="icon-down-wrapper"
          @click="toggleContent"
        >
          <span :class="{'icon-down2': !ifShowContent, 'icon-up': ifShowContent}"></span>
        </div>
      </div>
      <div
        class="book-detail-content-wrapper"
        v-show="ifShowContent"
      >
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
              @click="speak(item, index)"
            >
              <speak-playing
                v-if="playingIndex === index"
                :number="5"
                ref="speakPlaying"
              ></speak-playing>
              <div
                class="book-detail-content-navigation-text"
                :class="{'is-playing': playingIndex === index}"
                v-if="item.label"
              >{{item.label}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <audio
        ref="audio"
        @canplay="onCanPlay"
        @timeupdate="onTimeUpdate"
        @ended="onAudioEnded"
      ></audio>
    </scroll>
    <bottom
      :chapter="chapter"
      :currentSectionIndex="currentSectionIndex"
      :currentSectionTotal="currentSectionTotal"
      :showPlay="showPlay"
      v-model:isPlaying="isPlaying"
      :playInfo="playInfo"
      @onPlayingCardClick="onPlayingCardClick"
    ></bottom>
    <div class="book-wrapper">
      <div id="read"></div>
    </div>
    <speak-window
      :title="chapter ? chapter.label : ''"
      :book="book"
      :section="section"
      v-model:currentSectionIndex="currentSectionIndex"
      :currentSectionTotal="currentSectionTotal"
      v-model:isPlaying="isPlaying"
      :playInfo="playInfo"
      @updateText="updateText"
      ref="speakWindow"
    ></speak-window>
  </div>
</template>

<script>
import DetailTitle from '@/components/detail/DetailTitle.vue'
import BookInfo from '@/components/detail/BookInfo.vue'
import Scroll from '@/components/common/Scroll.vue'
import SpeakPlaying from '@/components/speaking/SpeakPlaying.vue'
import Bottom from '@/components/speaking/SpeakBottom.vue'
import SpeakWindow from '@/components/speaking/SpeakMask.vue'
import { findBook, getCategoryName } from '@/utils/store'
import { flatList } from '@/api/store'
import { getLocalForage } from '@/utils/localForage'
import { realPx } from '@/utils/utils'
import { computed, ref, onMounted, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Epub from 'epubjs'

global.ePub = Epub

// const APPID = '5b4da68b'
// const API_SECRET = '48487e25de82a2c167eccda30f7a3c70'
// const API_KEY = '7154170219e3e4426025afef812d070e'
// const isChrome = navigator.userAgent.toLowerCase().match(/chrome/)
// const notSupportTip = isChrome ? '您的浏览器暂时不支持体验功能，请升级您的浏览器' : '您现在使用的浏览器暂时不支持体验功能，<br />推荐使用谷歌浏览器Chrome'

// const getWebsocketUrl = () => {
//   return new Promise((resolve, reject) => {
//     const apiKey = API_KEY
//     const apiSecret = API_SECRET
//     let url = 'wss://tts-api.xfyun.cn/v2/tts'
//     const host = location.host
//     const date = new Date().toGMTString()
//     const algorithm = 'hmac-sha256'
//     const headers = 'host date request-line'
//     const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`
//     const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
//     const signature = CryptoJS.enc.Base64.stringify(signatureSha)
//     const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
//     const authorization = btoa(authorizationOrigin)
//     url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
//     resolve(url)
//   })
// }

// let audioCtx
// let source
// const btnState = {
//   unTTS: '立即合成',
//   ttsing: '正在合成',
//   endTTS: '立即播放',
//   play: '停止播放',
//   pause: '继续播放',
//   endPlay: '重新播放',
//   errorTTS: '合成失败'
// }

// class Experience {
//   constructor ({
//     speed = 50,
//     voice = 50,
//     pitch = 50,
//     text = '',
//     engineType = 'aisound',
//     voiceName = 'xiaoyan',
//     playBtn = '.js-base-play',
//     defaultText = ''
//   } = {}) {
//     this.speed = speed
//     this.voice = voice
//     this.pitch = pitch
//     this.text = text
//     this.defaultText = defaultText
//     this.engineType = engineType
//     this.voiceName = voiceName
//     this.playBtn = playBtn
//     this.playState = ''
//     this.audioDatas = []
//     this.pcmPlayWork = new Worker('./transform.worker.js')
//     this.pcmPlayWork.onmessage = (e) => {
//       this.onmessageWork(e)
//     }
//   }

//   setConfig ({
//     speed,
//     voice,
//     pitch,
//     text,
//     defaultText,
//     engineType,
//     voiceName
//   }) {
//     speed && (this.speed = speed)
//     voice && (this.voice = voice)
//     pitch && (this.pitch = pitch)
//     text && (this.text = text)
//     defaultText && (this.defaultText = defaultText)
//     engineType && (this.engineType = engineType)
//     voiceName && (this.voiceName = voiceName)
//     this.resetAudio()
//   }

//   onmessageWork (e) {
//     switch (e.data.command) {
//       case 'newAudioData': {
//         this.audioDatas.push(e.data.data)
//         if (this.playState === 'ttsing' && this.audioDatas.length === 1) {
//           this.playTimeout = setTimeout(() => {
//             this.audioPlay()
//           }, 1000)
//         }
//         break
//       }
//     }
//   }

// setBtnState (state) {
//   const oldState = this.playState
//   this.playState = state
// }

// getAudio () {
//   this.setBtnState('ttsing')
//   getWebsocketUrl().then((url) => {
//     this.connectWebsocket(url)
//   })
// }

// connectWebsocket (url) {
//   if ('WebSocket' in window) {
//     this.websocket = new WebSocket(url)
//   } else if ('MozWebSocket' in window) {
//     this.websocket = new MozWebSocket(url)
//   } else {
//     alert(notSupportTip)
//     return
//   }
//   const self = this
//   this.websocket.onopen = (e) => {
//     const params = {
//       'common': {
//         'app_id': APPID // APPID
//       },
//       'business': {
//         'ent': self.engineType,
//         'aue': 'raw',
//         'auf': 'audio/L16;rate=16000',
//         'vcn': self.voiceName,
//         'speed': self.speed,
//         'volume': self.voice * 10,
//         'pitch': self.pitch,
//         // 'bgs': 1,
//         'tte': 'UTF8'
//       },
//       'data': {
//         'status': 2,
//         'text': Base64.encode(self.text || self.defaultText || DEFAULT_TEXT)
//       }
//     }
//     this.websocket.send(JSON.stringify(params))
//   }
//   this.websocket.onmessage = (e) => {
//     const jsonData = JSON.parse(e.data)
//     // 合成失败
//     if (jsonData.code !== 0) {
//       alert(`${jsonData.code}:${jsonData.message}`)
//       self.resetAudio()
//       this.websocket.close()
//       return
//     }
//     self.pcmPlayWork.postMessage({
//       command: 'transData',
//       data: jsonData.data.audio
//     })

//     if (jsonData.code === 0 && jsonData.data.status === 2) {
//       this.websocket.close()
//     }
//   }
//   this.websocket.onerror = (e) => {
//     console.log(e)
//     console.log(e.data)
//   }
//   this.websocket.onclose = (e) => {
//     console.log(e)
//   }
// }

// resetAudio () {
//   this.audioPause()
//   this.setBtnState('unTTS')
//   this.audioDatasIndex = 0
//   this.audioDatas = []
//   this.websocket && this.websocket.close()
//   clearTimeout(this.playTimeout)
// }

// audioPlay () {
//   try {
//     if (!audioCtx) {
//       audioCtx = new (window.AudioContext || window.webkitAudioContext)()
//     }
//     if (!audioCtx) {
//       alert(notSupportTip)
//       return
//     }
//   } catch (e) {
//     alert(notSupportTip)
//     return
//   }
//   this.audioDatasIndex = 0
//   if (this.audioDatas.length) {
//     this.playSource()
//     this.setBtnState('play')
//   } else {
//     this.getAudio()
//   }
// }

// audioPause (state) {
//   if (this.playState === 'play') {
//     this.setBtnState(state || 'endPlay')
//   }
//   clearTimeout(this.playTimeout)
//   try {
//     source && source.stop()
//   } catch (e) {
//     console.log(e)
//   }
// }

//   playSource () {
//     let bufferLength = 0
//     const dataLength = this.audioDatas.length
//     for (let i = this.audioDatasIndex; i < dataLength; i++) {
//       bufferLength += this.audioDatas[i].length
//     }
//     const audioBuffer = audioCtx.createBuffer(1, bufferLength, 22050)
//     let offset = 0
//     const nowBuffering = audioBuffer.getChannelData(0)
//     for (let i = this.audioDatasIndex; i < dataLength; i++) {
//       const audioData = this.audioDatas[i]
//       if (audioBuffer.copyToChannel) {
//         audioBuffer.copyToChannel(audioData, 0, offset)
//       } else {
//         for (let j = 0; j < audioData.length; j++) {
//           nowBuffering[offset + j] = audioData[j]
//         }
//       }
//       offset += audioData.length
//       this.audioDatasIndex++
//     }

//     source = audioCtx.createBufferSource()
//     source.buffer = audioBuffer
//     source.connect(audioCtx.destination)
//     source.start()
//     source.onended = (event) => {
//       if (this.playState !== 'play') {
//         return
//       }
//       if (this.audioDatasIndex < this.audioDatas.length) {
//         this.playSource()
//       } else {
//         this.audioPause('endPlay')
//       }
//     }
//   }
// }

// const experience = new Experience({
//   speed: 50,
//   voice: 50,
//   pitch: 50,
//   playBtn: '.audio-ctrl-btn'
// })

export default {
  name: 'StoreSpeaking',
  components: {
    DetailTitle,
    BookInfo,
    Scroll,
    SpeakPlaying,
    Bottom,
    SpeakWindow
  },
  setup () {
    const { ctx } = getCurrentInstance()
    const cover = ref(null)
    const route = useRoute()
    const router = useRouter()
    const bookItem = ref(null)
    const book = ref(null)
    const rendition = ref(null)
    const metadata = ref(null)
    const navigation = ref(null)
    const description = ref(null)
    const ifShowContent = ref(true)
    const playingIndex = ref(-1)
    const paragraph = ref(null)
    const currentSectionIndex = ref(null)
    const currentSectionTotal = ref(null)
    const section = ref(null)
    const isPlaying = ref(false)
    const audio = ref(null)
    const audioCanPlay = ref(false)
    const currentPlayingTime = ref(0)
    const totalPlayingTime = ref(0)
    const playStatus = ref(0) // 0 - 未播放，1 - 播放中，2 - 暂停中
    const toastText = ref('')
    const isOnline = ref(false)

    const desc = computed(() => { // 电子书摘要信息
      if (description.value) {
        return description.value.substring(0, 100)
      } else {
        return ''
      }
    })
    const title = computed(() => { // 电子书书名
      return metadata.value ? metadata.value.title : ''
    })
    const author = computed(() => { // 电子书作者
      return metadata.value ? metadata.value.creator : ''
    })
    const currentMinute = computed(() => { // 音频当前播放的分钟数
      const m = Math.floor(currentPlayingTime.value / 60)
      return m < 10 ? '0' + m : m
    })
    const currentSecond = computed(() => { // 音频当前播放的秒数
      const s = Math.floor(currentPlayingTime.value - parseInt(currentMinute.value) * 60)
      return s < 10 ? '0' + s : s
    })
    const totalMinute = computed(() => { // 音频的总时长
      const m = Math.floor(totalPlayingTime.value / 60)
      return m < 10 ? '0' + m : m
    })
    const totalSecond = computed(() => { // 音频的总秒数
      const s = Math.floor(totalPlayingTime.value - parseInt(totalMinute.value) * 60)
      return s < 10 ? '0' + s : s
    })
    const leftMinute = computed(() => { // 音频的剩余分钟数
      const m = Math.floor((totalPlayingTime.value - currentPlayingTime.value) / 60)
      return m < 10 ? '0' + m : m
    })
    const leftSecond = computed(() => { // 音频的剩余秒数
      const s = Math.floor((totalPlayingTime.value - currentPlayingTime.value) - parseInt(leftMinute.value) * 60)
      return s < 10 ? '0' + s : s
    })
    const playInfo = computed(() => { // 播放信息对象
      if (audioCanPlay.value) {
        return {
          currentMinute: currentMinute.value,
          currentSecond: currentSecond.value,
          totalMinute: totalMinute.value,
          totalSecond: totalSecond.value,
          leftMinute: leftMinute.value,
          leftSecond: leftSecond.value
        }
      } else {
        return null
      }
    })
    const lang = computed(() => { // 电子书的语种
      return metadata.value ? metadata.value.language : ''
    })
    const disableScroll = computed(() => { // 当播放面板显示时，禁用滚动条（解决事件穿透问题）
      if (ctx.$refs.speakWindow) {
        return ctx.$refs.speakWindow.visible
      } else {
        return false
      }
    })
    const showPlay = computed(() => { // 是否底部的播放面板
      return playingIndex.value >= 0
    })
    const scrollBottom = computed(() => { // 滚动条距底部距离，当显示播放面板时为116像素，不显示时为52像素
      return showPlay.value ? 116 : 52
    })
    const chapter = computed(() => { // 当前章节信息
      return flatNavigation.value[playingIndex.value]
    })
    const flatNavigation = computed(() => { // 一维数组的目录
      if (navigation.value) {
        return Array.prototype.concat.apply([], Array.prototype.concat.apply([], doFlatNavigation(navigation.value.toc)))
      } else {
        return []
      }
    })
    const category = computed(() => { // 电子书分类
      return bookItem.value ? getCategoryName(bookItem.value.category) : ''
    })

    const createVoice = (text) => { // 在线语音合成
      console.log('在线语音合成', text)
      // if (text !== experience.text) {
      //   experience.setConfig({
      //     text
      //   })
      // }
      // console.log(experience)
      // if (experience.playState === 'play') {
      //   experience.audioPause()
      //   resetPlay()
      // } else {
      //   experience.audioPlay()
      //   isPlaying.value = true
      //   playStatus.value = 1
      // }
      const xmlhttp = new XMLHttpRequest()
      // 创建HTTP请求，同步接收结果
      xmlhttp.open('GET', `${process.env.VUE_APP_VOICE_URL}/voice?text=${text}&lang=${lang.value.toLowerCase()}`, false)
      // 发送请求
      xmlhttp.send()
      // 获取响应内容
      const xmlDoc = xmlhttp.responseText
      if (xmlDoc) { // 解析响应内容
        const json = JSON.parse(xmlDoc)
        if (json.path) {
          // path为语音合成生成的MP3文件下载路径，将该路径赋值audio.src
          // audio控件会自动加载音频文件
          ctx.$refs.audio.src = json.path
          // 自动播放MP3
          continuePlay()
        } else {
          showToast('播放失败，未生成链接')
        }
      } else {
        showToast('播放失败')
      }
    }
    // 切换播放状态，如果处于播放状态则暂停，如果处于暂停状态，则播放
    // 注意状态0和状态2是不通的
    // 状态0 表示还未播放，所以需要先进行语音合成
    // 状态2 表示已经合成，所以直接进行播放即可
    const togglePlay = () => {
      if (!isPlaying.value) {
        if (playStatus.value === 0) {
          play()
        } else if (playStatus.value === 2) {
          continuePlay()
        }
      } else {
        pausePlay()
      }
    }
    const speak = (item, index) => { // 生成语音合成的文本信息
      resetPlay() // 重置播放状态，停止一切播放
      playingIndex.value = index
      nextTick(() => {
        ctx.$refs.scroll.refresh()
        if (chapter.value) {
          section.value = book.value.spine.get(chapter.value.href) // 获取当前点击的章节信息
          rendition.value.display(section.value.href).then(section => { // 渲染章节
            // 获取当前位置对象
            const currentPage = rendition.value.currentLocation()
            const cfibase = section.cfiBase
            const cfistart = currentPage.start.cfi.replace(/.*!/, '').replace(/\)/, '')
            const cfiend = currentPage.end.cfi.replace(/.*!/, '').replace(/\)/, '')
            currentSectionIndex.value = currentPage.start.displayed.page
            currentSectionTotal.value = currentPage.start.displayed.total
            // 合成cfi信息
            const cfi = `epubcfi(${cfibase}!,${cfistart},${cfiend})`
            // console.log(currentPage, cfi, cfibase, cfistart, cfiend)
            // 通过Book.getRange(cfi)方法获取指定片段的cfi对应的文本
            book.value.getRange(cfi).then(range => {
              // 获取章节片段的文本信息
              let text = range.toLocaleString()
              // 对文本信息进行过滤，去除其中的空格（注意是2个空格，1个空格是合理的）、换行符等特殊字符
              text = text.replace(/\s(2,)/g, '')
              text = text.replace(/\r/g, '')
              text = text.replace(/\n/g, '')
              text = text.replace(/\t/g, '')
              text = text.replace(/\f/g, '')
              // 更新语音合成的文本信息
              updateText(text)
            })
          })
        }
      })
    }
    const resetPlay = () => { // 重置播放状态
      if (playStatus.value === 1) {
        pausePlay()
      }
      isPlaying.value = false
      playStatus.value = 0
    }
    const play = () => { // 从头开始语音合成并播放
      createVoice(paragraph.value)
    }
    const continuePlay = () => { // 继续播放
      ctx.$refs.audio.play().then(() => { // 显示播放动画
        ctx.$refs.speakPlaying[0].startAnimation()
        isPlaying.value = true
        playStatus.value = 1
      })
    }
    const pausePlay = () => { // 暂停播放
      ctx.$refs.audio.pause()
      ctx.$refs.speakPlaying[0].stopAnimation() // 暂停播放动画
      isPlaying.value = false
      playStatus.value = 2
    }
    const onAudioEnded = () => { // 当播放结束时，刷新播放信息
      resetPlay()
      currentPlayingTime.value = ctx.$refs.audio.currentTime
      const percent = Math.floor((currentPlayingTime.value / totalPlayingTime.value) * 100)
      ctx.$refs.speakWindow.refreshProgress(percent)
    }
    const onTimeUpdate = () => { // 当播放进行时，刷新播放信息
      currentPlayingTime.value = ctx.$refs.audio.currentTime
      const percent = Math.floor((currentPlayingTime.value / totalPlayingTime.value) * 100)
      ctx.$refs.speakWindow.refreshProgress(percent)
    }
    // 调用audio.src时，audio控件会调用canplay事件
    // 此时我们可以获取总播放时长和当前播放时长
    const onCanPlay = () => {
      audioCanPlay.value = true
      currentPlayingTime.value = ctx.$refs.audio.currentTime
      totalPlayingTime.value = ctx.$refs.audio.duration
    }
    const findBookFromList = (fileName) => { // 通过API找到当前电子书的详情数据
      flatList().then(response => {
        if (response.status === 200) {
          const bookList = response.data.data.filter(item => item.fileName === fileName)
          if (bookList && bookList.length > 0) {
            bookItem.value = bookList[0]
            init()
          }
        }
      })
    }
    // 初始化参数信息
    const init = () => {
      const fileName = route.query.fileName
      if (!bookItem.value) {
        bookItem.value = findBook(fileName)
      }
      if (bookItem.value) { // 如果电子书已经缓存，则直接从IndexedDB数据库中获取
        getLocalForage(fileName, (err, blob) => {
          if (err || !blob) {
            // 如果获取缓存失败，则拼接opf文件来获取电子书
            isOnline.value = true
            const opf = route.query.opf
            if (opf) {
              parseBook(opf)
            }
          } else {
            isOnline.value = false
            parseBook(blob) // 解析电子书
          }
        })
      } else {
        findBookFromList(fileName)
      }
    }
    // 解析电子书
    const parseBook = (blob) => { // 解析电子书
      book.value = new Epub(blob)
      book.value.loaded.metadata.then(data => { // 获取电子书的metadata
        metadata.value = data
      })
      if (isOnline.value) { // 如果是在线获取的电子书，则通过Book.coverUrl()方法获取封面链接
        book.value.coverUrl().then(url => {
          cover.value = url
        })
      } else { // 如果是本地获取的电子书，通过Book.loaded.cover方法获取封面链接（加快封面获取速度）
        book.value.loaded.cover.then(cover => {
          book.value.archive.createUrl(cover).then(url => {
            cover.value = url
          })
        })
      }
      // 获取电子书的目录信息
      book.value.loaded.navigation.then(nav => {
        navigation.value = nav
      })
      display() // 渲染电子书
    }
    const back = () => {
      router.go(-1)
    }
    // 处理滚动条的事件，决定标题阴影是否展示
    const onScroll = (offsetY) => {
      if (offsetY > realPx(42)) {
        ctx.$refs.title.showShadow()
      } else {
        ctx.$refs.title.hideShadow()
      }
    }
    const toggleContent = () => {
      ifShowContent.value = !ifShowContent.value
    }
    // 渲染电子书
    const display = () => {
      const height = window.innerHeight * 0.9 - realPx(40) - realPx(54) - realPx(46) - realPx(48) - realPx(60) - realPx(44)
      rendition.value = book.value.renderTo('read', {
        width: window.innerWidth,
        height: height,
        method: 'default'
      })
      rendition.value.display()
    }
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
    const showToast = (text) => {
      // this.simpleToast(text)
    }
    const onPlayingCardClick = () => {
      ctx.$refs.speakWindow.show()
    }
    const updateText = (text) => {
      paragraph.value = text
    }

    onMounted(() => {
      init()
    })
    return {
      audio,
      toastText,
      category,
      cover,
      title,
      author,
      desc,
      toggleContent,
      updateText,
      onScroll,
      onCanPlay,
      onTimeUpdate,
      onAudioEnded,
      onPlayingCardClick,
      resetPlay,
      togglePlay,
      speak,
      back,
      scrollBottom,
      disableScroll,
      ifShowContent,
      navigation,
      flatNavigation,
      playingIndex,
      chapter,
      currentSectionIndex,
      currentSectionTotal,
      showPlay,
      isPlaying,
      playInfo,
      book,
      section
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/styles/global.scss";

.book-speaking {
  font-size: px2rem(16);
  width: 100%;
  background: white;

  .content-wrapper {
    width: 100%;

    .book-speak-title-wrapper {
      display: flex;
      padding: px2rem(15);
      box-sizing: border-box;
      border-bottom: px2rem(1) solid #eee;

      .icon-speak-wrapper {
        flex: 0 0 px2rem(40);
        @include left;

        .icon-speak {
          font-size: px2rem(24);
          color: #999;
        }
      }

      .speak-title-wrapper {
        flex: 1;
        @include left;

        .speak-title {
          font-size: px2rem(16);
          font-weight: bold;
          color: #666;
        }
      }

      .icon-down-wrapper {
        flex: 0 0 px2rem(40);
        @include right;

        .icon-up {
          font-size: px2rem(12);
          color: #999;
        }

        .icon-down2 {
          font-size: px2rem(12);
          color: #999;
        }
      }
    }

    .book-detail-content-wrapper {
      width: 100%;
      border-bottom: px2rem(1) solid #eee;
      box-sizing: border-box;

      .book-detail-content-list-wrapper {
        padding: px2rem(10) px2rem(15);

        .loading-text-wrapper {
          width: 100%;

          .loading-text {
            font-size: px2rem(14);
            color: #999;
          }
        }

        .book-detail-content-item-wrapper {
          .book-detail-content-item {
            display: flex;
            padding: px2rem(15) 0;
            font-size: px2rem(14);
            line-height: px2rem(16);
            color: #333;
            border-bottom: px2rem(1) solid #eee;

            &:last-child {
              border-bottom: none;
            }

            .book-detail-content-navigation-text {
              flex: 1;
              width: 100%;
              @include ellipsis;

              &.is-playing {
                color: $color-blue;
                font-weight: bold;
                margin-left: px2rem(10);
              }
            }
          }
        }
      }
    }
  }

  .book-wrapper {
    position: absolute;
    bottom: -100%;
    z-index: 100;
  }
}
</style>
