import '@/assets/main.scss'
import { createApp } from 'vue'
import App from './App.vue'

import('w-mc')
  .then(module => {
    window.MC = module
    createApp(App).mount('#app')
  })
  .catch(e => console.error("Error importing `w-mc`:", e));