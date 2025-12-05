import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 引入全局样式
import './styles/main.less'
// 引入 RemixIcon (确保你执行了 pnpm add remixicon)
import 'remixicon/fonts/remixicon.css'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')