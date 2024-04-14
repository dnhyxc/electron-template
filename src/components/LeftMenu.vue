<!--
 * LeftMenu
 * @author: dnhyxc
 * @since: 2024-04-13
 * index.vue
-->
<template>
  <el-aside :class="`${checkOS() === 'mac' && 'mac-aside-wrap'} aside-wrap`" width="170">
    <div class="menu-list">
      <div class="header">
        <Icon class-name="icon-hd" size="40px" padding="0 10px 4px 0" background="" drag="drag" />
        <span class="name">dnhyxc</span>
      </div>
      <div v-for="menu in MENU_LIST" class="menu-item" @click="onClick(menu)">
        <Icon :class-name="menu.icon" padding="0 10px 0 0" size="20px" color="#000" />
        <span>{{ menu.name }}</span>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { checkOS } from '@/utils';
import { MENU_LIST } from '@/constant';
import { MenuListParams } from '@/typings';
import Icon from '@/components/Icon.vue';

const router = useRouter();

const onClick = (menu: MenuListParams) => {
  router.push(menu.path);
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.aside-wrap {
  -webkit-app-region: drag;
  border-right: 1px solid var(--border-color);

  .menu-list {
    width: 170px;
    height: 100%;
    background-color: var(--background);

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      padding: 0 8px;

      .icon-hd {
        @include textLg;
      }

      .name {
        font-size: 25px;
        font-weight: 700;
        padding-bottom: 9px;
        @include textLg;
      }
    }

    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 8px;
      cursor: pointer;
      -webkit-app-region: no-drag;

      &:hover {
        background: var(--hover-bg);
      }
    }
  }
}

.mac-aside-wrap {
  .menu-list {
    margin-top: 28px;
  }
}
</style>
