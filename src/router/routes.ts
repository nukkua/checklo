import { useAuthStore } from '@/stores/auth'
import { useCoupleStore } from '@/stores/couple'
import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const coupleStore = useCoupleStore()

  const invite = to.query.invite
  const token = Array.isArray(invite) ? invite[0] : invite

  if (token) {
    coupleStore.inviteToken = token
  }

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
    return { name: '/(home)/', query: token ? { invite: token } : undefined }
  }
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
