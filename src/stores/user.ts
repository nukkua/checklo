import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const acceptTerms = ref(false)

  const nameError = computed(() => {
    if (!name.value.trim()) return 'Nombre requerido'
      if (name.value.trim().length < 3) return 'Nombre muy corto'
        return ''
  })

  const emailError = computed(() => {
    if (!email.value.trim()) return 'Email requerido'
      if (!emailRegex.test(email.value.trim())) return 'Email inválido'
        return ''
  })

  const passwordError = computed(() => {
    if (!password.value) return 'Contraseña requerida'
      if (password.value.length < 6) return 'Mínimo 6 caracteres'
        return ''
  })

  const validSignUp = computed(() => {
    return !nameError.value && !emailError.value && !passwordError.value && acceptTerms.value
  })

  const validLogin = computed(() => {
    return !emailError.value && !passwordError.value
  })

  return {
    name,
    email,
    password,
    acceptTerms,
    nameError,
    emailError,
    passwordError,
    validSignUp,
    validLogin,
  }
})
