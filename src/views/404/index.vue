<!--
 * 404
 * @author: dnhyxc
 * @since: 2024-04-12
 * index.vue
-->
<template>
  <div class="container">
    <h1>404</h1>
    <el-button type="primary" link @click="goBack">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.push('/home');
};
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
