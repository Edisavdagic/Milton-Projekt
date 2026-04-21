import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import DocumentsView from '../views/DocumentsView.vue'
import NotificationsView from '@/views/NotificationsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/dokumenter',
      name: 'documents',
      component: DocumentsView
    },
    {
      path: '/notifikationer',
      name: 'notifications',
      component: NotificationsView
    }
  ]
})

export default router
