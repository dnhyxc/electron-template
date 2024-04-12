<template>
  <h3>{{ msg }}</h3>
</template>

<script setup lang="ts">
interface IProps {
  msg: string;
}

defineProps<IProps>();
</script>
