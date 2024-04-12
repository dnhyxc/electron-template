<template>
  <div class="el-container-wrap">
    <el-container>
      <el-aside class="aside-wrap" width="160">
        <div class="menu-list">Menu</div>
      </el-aside>
      <el-main class="el-main">
        <div class="header-warp">
          <div class="left"><el-button type="primary" class="back" @click="goBack">返回</el-button> header</div>
        </div>
        <div class="content">
          <RouterView v-if="isRouterAlive" v-slot="{ Component }">
            <component :is="Component" />
          </RouterView>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, provide } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const isRouterAlive = ref<boolean>(true);

// 刷新当前页面
const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
};

// 父组件注册刷新当前页面的方法
provide('reload', reload);

const goBack = () => {
  router.go(-1);
};
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.el-container-wrap {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  height: 100vh;

  .aside-wrap {
    -webkit-app-region: drag;
    padding: 0 8px;
    border-right: 1px solid var(--border-color);

    .menu-list {
      margin-top: 28px;
      width: 160px;
      height: 100%;
      background-color: var(--background);
    }
  }

  .el-main {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    padding: 0;

    .header-warp {
      display: flex;
      align-items: center;
      padding: 8px;
      height: 60px;
      box-sizing: border-box;
      -webkit-app-region: drag;
      border-bottom: 1px solid var(--border-color);

      .back {
        -webkit-app-region: no-drag;
      }
    }

    .content {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
