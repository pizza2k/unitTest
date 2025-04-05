import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);
app.use(router);
app.use(elementPlus);
app.mount('#app');
