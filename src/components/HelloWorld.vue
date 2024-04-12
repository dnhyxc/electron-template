<template>
  <div class="wrap">
    <h3>{{ msg }}</h3>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  msg: string;
}

defineProps<IProps>();
</script>

<style scoped></style>
