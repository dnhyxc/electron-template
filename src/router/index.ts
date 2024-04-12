import { createRouter, RouteRecordRaw, createWebHistory } from 'vue-router';

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/',
    name: 'main',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          title: '首页'
        },
        component: () => import('@/views/home/index.vue')
      },
      {
        path: '/detail/:id',
        name: 'detail',
        meta: {
          title: '详情'
        },
        component: () => import('@/views/detail/index.vue')
      }
    ],
    redirect: { name: 'home' }
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录'
    },
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404/index.vue')
  }
];

const router = createRouter({
  // electron 只支持 hash router，使用 history router 会出现找不到对应路由得情况
  history: createWebHistory(),
  scrollBehavior: (_to, _from, savePosition) => {
    if (savePosition) {
      return savePosition;
    } else {
      return { top: 0 };
    }
  },
  routes
});

export default router;
