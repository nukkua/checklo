import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.checked) {
    await auth.checkSession()
  }

  const isAuthPage = to.name === '/(auth)/login' || to.name === '/(auth)/signup'

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return {
      name: '/(auth)/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (isAuthPage && auth.isLoggedIn) {
    return { name: '/(home)/' }
  }
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
