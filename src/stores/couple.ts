import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const server = import.meta.env.VITE_API_URL ?? 'https://checkco.onrender.com'

const couplePath = import.meta.env.VITE_COUPLE_PATH ?? '/couples/me'
const createCouplePath = import.meta.env.VITE_CREATE_COUPLE_PATH ?? '/couples'
const invitePath = import.meta.env.VITE_COUPLE_INVITE_PATH ?? '/couples/invite'
const joinPath = import.meta.env.VITE_COUPLE_JOIN_PATH ?? '/couples/join'

export interface Couple {
  id: number
  created_at: string
}

export interface CoupleMember {
  id: number
  email: string
  display_name: string
  role: string
  joined_at: string
}

export interface CoupleInvite {
  id: number
  couple_id: number
  email: string
  token: string
  expires_at: string
  created_at: string
}

async function parseJson(response: Response) {
  return response.json().catch(() => null)
}

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${server}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const data = await parseJson(response)

  if (!response.ok) {
    throw new Error(data?.error?.message ?? data?.message ?? `Error ${response.status}`)
  }

  return data
}

export const useCoupleStore = defineStore('couple', () => {
  const couple = ref<Couple | null>(null)
  const members = ref<CoupleMember[]>([])
  const invite = ref<CoupleInvite | null>(null)
  const partnerEmail = ref('')
  const inviteToken = ref('')
  const loading = ref(false)
  const loadingCouple = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const hasCouple = computed(() => Boolean(couple.value))
  const inviteUrl = computed(() => invite.value ? `${window.location.origin}/signup?invite=${invite.value.token}` : '')

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const loadCouple = async () => {
    loadingCouple.value = true

    try {
      const data = await request(couplePath)
      couple.value = data?.couple ?? null
      members.value = data?.members ?? []
      return data
    } catch (error) {
      couple.value = null
      members.value = []
      invite.value = null
      return null
    } finally {
      loadingCouple.value = false
    }
  }

  const loadInvite = async () => {
    try {
      const data = await request(invitePath)
      invite.value = data?.invite ?? null
      return data
    } catch (error) {
      invite.value = null
      return null
    }
  }

  const createCouple = async () => {
    clearMessages()
    loading.value = true

    try {
      const data = await request(createCouplePath, { method: 'POST' })
      couple.value = data?.couple ?? data
      successMessage.value = 'Espacio de pareja creado.'
      await loadCouple()
      return data
    } catch (error) {
      errorMessage.value = 'No se pudo crear la pareja.'
    } finally {
      loading.value = false
    }
  }

  const sendInvite = async () => {
    clearMessages()
    loading.value = true

    try {
      if (!couple.value) await createCouple()
      const data = await request(invitePath, {
        method: 'POST',
        body: JSON.stringify({ email: partnerEmail.value.trim() }),
      })
      invite.value = data?.invite ?? data
      successMessage.value = 'Invitación enviada correctamente.'
      return data
    } catch (error) {
      errorMessage.value = 'No se pudo enviar la invitación.'
    } finally {
      loading.value = false
    }
  }

  const joinCouple = async () => {
    clearMessages()
    loading.value = true

    try {
      const data = await request(joinPath, {
        method: 'POST',
        body: JSON.stringify({ token: inviteToken.value.trim() }),
      })
      couple.value = data?.couple ?? data
      successMessage.value = 'Te uniste a la pareja.'
      await loadCouple()
      return data
    } catch (error) {
      errorMessage.value = 'No se pudo aceptar la invitación.'
    } finally {
      loading.value = false
    }
  }

  const deleteCouple = async () => {
    clearMessages()
    loading.value = true

    try {
      const data = await request(createCouplePath, { method: 'DELETE' })
      couple.value = null
      members.value = []
      invite.value = null
      successMessage.value = 'Pareja eliminada.'
      return data
    } catch (error) {
      errorMessage.value = 'No se pudo eliminar la pareja.'
    } finally {
      loading.value = false
    }
  }

  return {
    couple,
    members,
    invite,
    partnerEmail,
    inviteToken,
    loading,
    loadingCouple,
    errorMessage,
    successMessage,
    hasCouple,
    inviteUrl,
    clearMessages,
    loadCouple,
    loadInvite,
    createCouple,
    sendInvite,
    joinCouple,
    deleteCouple,
  }
})
