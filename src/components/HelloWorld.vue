<template>
  <h3>{{ msg }}</h3>
  <el-button type="primary">我是 ElButton</el-button>
</template>

<script setup lang="ts">
interface IProps {
  msg: string;
}

defineProps<IProps>();
</script>
