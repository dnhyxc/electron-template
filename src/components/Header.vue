<!--
 * Header
 * @author: dnhyxc
 * @since: 2024-04-13
 * index.vue
-->
<template>
  <div :class="`header-warp ${checkOS() === 'mac' && 'mac-header-warp'}`">
    <div class="left">
      <Icon icon-name="icon-zjt" class-name="icon-zjt back" @click="goBack"/>
      <div class="title">{{ route.meta.title }}</div>
    </div>
    <div class="right">
      <Icon
        v-for="(i, key) of HEADER_ACTIONS"
        :class-name="`${key === 'max' && winStatus ? 'icon-ckxh' : i} icon`"
        @click="onClick(key)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {HEADER_ACTIONS} from '@/constant';
import {checkOS} from "@/utils";
import Icon from '@/components/Icon.vue';

const router = useRouter();
const route = useRoute();

const winStatus = ref(false);

window.electronApi.onWinMax((status: boolean) => {
  winStatus.value = status;
});

const onWinMin = () => {
  window.electronApi.sendWinMin();
};
const onWinMax = () => {
  window.electronApi.sendWinMax();
};
const onWinClose = () => {
  window.electronApi.sendWinClose();
};

const onClick = (key: string) => {
  const actions = {
    win: onWinMin,
    max: onWinMax,
    close: onWinClose
  };
  actions[key]();
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.header-warp {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    display: flex;
    align-items: center;

    .back {
      -webkit-app-region: no-drag;
    }

    .title {
      margin-left: 5px;
    }
  }

  .right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.mac-header-warp {
  .right {
    display: none;
  }
}
</style>
