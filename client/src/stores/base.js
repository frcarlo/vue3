import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { defineStore } from 'pinia'

export const base = defineStore('base', () => {
  const route = useRoute()

  return { route }
})
