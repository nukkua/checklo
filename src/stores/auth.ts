import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useCoupleStore } from './couple'
import { useRouter } from 'vue-router'

const server = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const mePath = import.meta.env.VITE_AUTH_ME_PATH ?? '/auth/me'
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function parseJson(response: Response) {
  return response.json().catch(() => null)
}

async function requestAuth(path: string, body: Record<string, string>) {
  const response = await fetch(`${server}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await parseJson(response)

  if (!response.ok) {
    throw new Error(data?.message ?? `Error ${response.status}`)
  }

  return data
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const userStore = useUserStore()
  const coupleStore = useCoupleStore()
  const loading = ref(false)
  const checking = ref(false)
  const checked = ref(false)
  const user = ref<unknown>(null)
  const errorMessage = ref('')
  const successMessage = ref('')
  const isLoggedIn = computed(() => Boolean(user.value))

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const handleSignUp = async () => {
    clearMessages()
    loading.value = true

    try {
      const data = await requestAuth('/auth/signup', {
        email: userStore.email,
        password: userStore.password,
        display_name: userStore.name,
      })

      successMessage.value = 'Cuenta creada correctamente.'
      router.push({
        name: '/(auth)/login',
        query: coupleStore.inviteToken ? { invite: coupleStore.inviteToken } : undefined,
      })
      return data
    } catch (error) {
      errorMessage.value = 'No se pudo crear la cuenta.'
    } finally {
      loading.value = false
    }
  }

  const checkSession = async () => {
    if (checking.value) return user.value
    checking.value = true

    try {
      const response = await fetch(`${server}${mePath}`, {
        credentials: 'include',
      })

      const data = await parseJson(response)

      if (!response.ok) {
        user.value = null
        return null
      }

      user.value = data?.user ?? data
      return user.value
    } finally {
      checked.value = true
      checking.value = false
    }
  }

  const handleLogin = async () => {
    clearMessages()
    loading.value = true

    try {
      const data = await requestAuth('/auth/login', {
        email: userStore.email,
        password: userStore.password,
      })
      await sleep(900)
      successMessage.value = 'Sesión iniciada correctamente.'
      user.value = data?.user ?? data ?? true
      checked.value = true

      if (coupleStore.inviteToken.trim()) {
        await coupleStore.joinCouple()
      }

      router.push({ name: '/(home)/' })
    } catch (error) {
      user.value = null
      checked.value = true
      errorMessage.value = 'No se pudo iniciar sesión.'
    } finally {
      loading.value = false
    }
  }

  const handleLogout = async () => {
    clearMessages()
    loading.value = true

    try {
      await requestAuth('/auth/logout', {})
    } finally {
      user.value = null
      checked.value = true
      loading.value = false
      router.push({ name: '/(auth)/login' })
    }
  }

  return {
    loading,
    checking,
    checked,
    user,
    isLoggedIn,
    errorMessage,
    successMessage,
    clearMessages,
    checkSession,
    handleSignUp,
    handleLogin,
    handleLogout,
  }
})
