import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router/index.js'
import ELementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ELementPlusIconsVue from '@element-plus/icons-vue'


const app = createApp(App);
app.use(router);
app.use(ELementPlus);
app.mount('#app');
for (const [key, component] of Object.entries(ELementPlusIconsVue)) {
    app.component(key, component);
}