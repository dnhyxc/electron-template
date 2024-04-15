import {createRouter, createWebHistory} from 'vue-router';

export const routes = [
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
      },
      {
        path: '/setting',
        name: 'setting',
        meta: {
          title: '设置'
        },
        component: () => import('@/views/setting/index.vue')
      }
    ],
    redirect: {name: 'home'}
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
  history: createWebHistory(),
  routes
});

export default router;
