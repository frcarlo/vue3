import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Error from '../views/Error.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/error',
      name: 'Error',
      component: Error
    },
    {
      path: '/discover',
      name: 'Discover',
      component: () => import('../views/DiscoverView.vue')
    }
  ]
})

export default router
