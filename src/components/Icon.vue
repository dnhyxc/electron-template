<!--
 * 404
 * @author: dnhyxc
 * @since: 2024-04-12
 * index.vue
-->
<template>
  <i :class="className" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface IProps {
  className?: string;
  color?: string;
  size?: string;
  padding?: string;
  background?: string;
  drag?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  size: '16px',
  padding: '10px',
  background: 'var(--hover-bg)',
  drag: 'no-drag'
});

// 图标在 iconfont 中的名字
const className = computed(() => {
  return `icon iconfont ${props.className}`;
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.icon {
  font-size: v-bind('props.size');
  padding: v-bind('props.padding');
  cursor: pointer;
  border-radius: 5px;
  -webkit-app-region: v-bind('props.drag');

  &:hover {
    background: v-bind('props.background');
  }
}
</style>
