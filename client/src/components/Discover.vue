<template>
  <div></div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
const route = useRoute()
console.log(JSON.stringify(route, null, 4))
</script>

<style lang="scss" scoped></style>
