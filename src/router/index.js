import { createRouter, createWebHistory } from 'vue-router'
import CtrlView from '../views/CtrlView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CtrlView
    },
    {
      path: '/ctrl',
      name: 'ctrl',

      component: () => import('../views/CtrlView.vue')
    },
    {
      path:'/auth',
      name: 'auth',

      component: () => import('../views/AuthView.vue')
    },
    {
      path:'/redirect',
      name: 'redirect',

      component: () => import('../views/RedirectView.vue')
    }

  ]
})

export default router
