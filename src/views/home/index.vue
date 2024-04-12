<!--
 * home
 * @author: dnhyxc
 * @since: 2024-04-12
 * index.vue
-->
<template>
  <div class="container">
    <div>
      <a href="https://www.electronjs.org/" target="_blank">
        <img src="@/assets/electron.svg" class="logo" alt="Electron logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <HelloWorld msg="Electron + Vue3 + Template" />
    <div class="action">
      <el-button type="primary" @click="onSendMsgToMainWin">我是 ElButton</el-button>
      <el-button type="success" @click="toDetail">前往详情</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const toDetail = () => {
  router.push('/detail/1');
};

const onSendMsgToMainWin = () => {
  window.electronApi.sendInfo(123);
};

window.electronApi.onGetInfo((value: { id: number; title: string }) => {
  console.log(value, 'onInfo');
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #21b1ffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }

  .action {
    padding-bottom: 35px;
  }
}
</style>
