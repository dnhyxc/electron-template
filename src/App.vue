<template>
  <RouterView v-if="isRouterAlive" v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>

<script setup lang="ts">
import { ref, nextTick, provide } from 'vue';

const isRouterAlive = ref(true);

window.electronApi.sendTest('dnhyxc');

window.electronApi.onTest((value: string) => {
  console.log(value, '渲染进程中监听到了 test 事件');
});

// 刷新当前页面
const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
};

// 父组件注册刷新当前页面的方法
provide('reload', reload);
</script>

<style scoped></style>
