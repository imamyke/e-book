import { createRouter, createWebHashHistory } from 'vue-router'
import EbookReader from '../components/ebook/EbookReader/EbookReader.vue'

const routes = [
  {
    path: '/',
    redirect: '/store'
  },
  {
    path: '/ebook',
    name: 'Ebook',
    component: () => import('../views/ebook/Ebook.vue'),
    children: [
      {
        path: ':fileName',
        component: EbookReader
      }
    ]
  },
  {
    path: '/store',
    component: () => import('../views/store/Store.vue'),
    children: [
      {
        path: 'home',
        component: () => import('../views/store/store-home/StoreHome.vue')
      },
      {
        path: 'list',
        component: () => import('../views/store/store-list/StoreList.vue')
      },
      {
        path: 'detail',
        component: () => import('../views/store/store-detail/StoreDetail.vue')
      },
      {
        path: 'shelf',
        component: () => import('../views/store/store-shelf/StoreShelf.vue')
      },
      {
        path: 'category',
        component: () => import('../views/store/store-category/StoreCategory.vue')
      },
      {
        path: 'speaking',
        component: () => import('../views/store/store-speaking/StoreSpeaking.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
