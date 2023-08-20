import { createRouter, createWebHashHistory } from 'vue-router'
import EbookReader from '../components/ebook/EbookReader/EbookReader.vue'

const routes = [
  {
    path: '/',
    redirect: '/ebook'
  },
  {
    path: '/ebook',
    name: 'Ebook',
    component: () => import('../views/ebook/Ebook.vue'),
    children: [
      { path: ':fileName', component: EbookReader }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
