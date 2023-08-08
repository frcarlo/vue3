<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
const route = useRoute()
console.log(JSON.stringify(route, null, 4))
</script>

<template>
  <main></main>
</template>
