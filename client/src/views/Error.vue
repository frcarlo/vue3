<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style>
.v-alert {
  position: fixed;
  left: 50%;
  top: 250px;
  transform: translate(-50%, -50%);
  margin: 0 auto;
}
</style>

<template>
  <main>
    <div class="">
      <v-alert rounded="lg" min-width="580" type="error" variant="flat">
        <v-alert-title>Error</v-alert-title>
        {{ route.query.message || 'Unknown Server Error' }}</v-alert
      >
    </div>
  </main>
</template>
