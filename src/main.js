import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/icon.css'
import './assets/fonts/cabin.css'
import './assets/fonts/daysOne.css'
import './assets/fonts/montserrat.css'
import './assets/fonts/tangerine.css'

createApp(App).use(store).use(router).mount('#app')
