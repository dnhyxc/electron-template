import { createApp } from 'vue';
import router from '@/router';
import App from './App.vue';
// import '@/assets/iconfont/iconfont.js';
import '@/assets/iconfont/iconfont.css';
import './style.css';

// 创建vue实例
const app = createApp(App);

// 挂在路由
app.use(router);

// 挂载实例
app.mount('#app');
