<script setup lang="ts">
import { useCoupleStore } from '@/stores/couple'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Heart, Link, Mail, Sparkles, Trash2, UserRoundCheck, UsersRound } from '@lucide/vue'

const route = useRoute()
const coupleStore = useCoupleStore()
const {
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
} = storeToRefs(coupleStore)
const { loadCouple, loadInvite, sendInvite, joinCouple, deleteCouple } = coupleStore

const memberNames = computed(() => {
  if (!members.value.length) return 'Tú y tu pareja'
  return members.value.map(member => member.display_name || member.email).join(' + ')
})

const canInvite = computed(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(partnerEmail.value.trim()))
const canJoin = computed(() => inviteToken.value.trim().length >= 16)

const copyInvite = async () => {
  const text = inviteUrl.value || invite.value?.token
  if (!text) return

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

onMounted(async () => {
  const invite = route.query.invite
  const token = Array.isArray(invite) ? invite[0] : invite

  if (token) {
    inviteToken.value = token
    await joinCouple()
  }

  await loadCouple()
  await loadInvite()
})
</script>

<template>
  <section class="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
    <article class="min-w-0 animate-slide-up overflow-hidden bg-app-surface shadow-none sm:rounded-[2rem] sm:border sm:border-app-border sm:shadow-2xl sm:shadow-brand-ink/10">
      <div class="relative min-w-0 px-4 py-6 sm:p-6 md:p-8">
        <div class="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_18%_10%,rgb(197_176_205_/_0.55),transparent_34%),radial-gradient(circle_at_88%_0%,rgb(65_94_114_/_0.18),transparent_30%)]" />

        <div class="relative min-w-0">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-app-surface-muted/35 px-4 py-2 text-sm font-bold text-app-primary">
            <Sparkles :size="16" :stroke-width="2" />
            Nueva pareja
          </div>

          <div class="space-y-3">
            <h1 class="text-balance text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl md:text-5xl">
              Agrega a tu pareja y comiencen a organizarse juntos.
            </h1>
            <p class="max-w-2xl text-pretty text-base leading-7 text-app-text-muted md:text-lg">
              Crea su espacio compartido, envía invitación por correo o acepta token si ya tienes invitación.
            </p>
          </div>

          <div v-if="successMessage" class="mt-6 rounded-2xl border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-bold text-app-success">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="mt-6 rounded-2xl border border-app-danger/30 bg-app-danger/10 px-4 py-3 text-sm font-bold text-app-danger">
            {{ errorMessage }}
          </div>

          <form class="mt-8 grid min-w-0 gap-4" @submit.prevent="sendInvite">
            <label class="grid gap-2">
              <span class="text-sm font-bold text-app-text">Correo electrónico de tu pareja</span>
              <input
                v-model="partnerEmail"
                class="min-w-0 w-full rounded-2xl border border-app-border bg-white/70 px-4 py-3 font-semibold text-app-text outline-none transition placeholder:text-app-text-muted/60 focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                placeholder="vianka@email.com"
                type="email"
              >
            </label>

            <button class="btn-primary mt-2 w-full" :disabled="!canInvite || loading" type="submit">
              <Mail class="mr-2 shrink-0" :size="18" :stroke-width="1.8" />
              {{ loading ? 'Enviando...' : hasCouple ? 'Enviar invitación' : 'Crear pareja y enviar invitación' }}
            </button>
          </form>

          <div class="my-6 flex items-center gap-3 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-app-text-muted sm:text-xs sm:tracking-[0.2em]">
            <span class="h-px flex-1 bg-app-border" />
            o aceptar invitación
            <span class="h-px flex-1 bg-app-border" />
          </div>

          <form class="grid min-w-0 gap-4" @submit.prevent="joinCouple">
            <label class="grid gap-2">
              <span class="text-sm font-bold text-app-text">Token de invitación</span>
              <input
                v-model="inviteToken"
                class="min-w-0 w-full rounded-2xl border border-app-border bg-white/70 px-4 py-3 font-semibold text-app-text outline-none transition placeholder:text-app-text-muted/60 focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                placeholder="433ccdfcc852..."
                type="text"
              >
            </label>

            <button class="btn-secondary w-full" :disabled="!canJoin || loading" type="submit">
              <Link class="mr-2 shrink-0" :size="18" :stroke-width="1.8" />
              {{ loading ? 'Uniendo...' : 'Unirme a pareja' }}
            </button>
          </form>
        </div>
      </div>
    </article>

    <aside class="min-w-0 animate-scale-in px-4 py-2 shadow-none sm:rounded-3xl sm:border sm:border-app-border sm:bg-app-surface-muted/35 sm:p-6 sm:shadow-xl sm:shadow-brand-ink/5 md:rounded-4xl md:p-8">
      <div class="flex min-w-0 flex-col p-0 sm:rounded-3xl sm:bg-app-surface sm:p-5 sm:shadow-lg sm:shadow-brand-ink/5">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-app-text-muted">Vista previa</p>
        <div class="mt-5 flex min-w-0 items-center gap-4">
          <div class="grid size-16 place-items-center rounded-3xl bg-app-primary text-2xl font-extrabold text-app-text-inverse">
            <Heart :size="30" :stroke-width="1.8" />
          </div>
          <div class="min-w-0">
            <h2 class="truncate text-xl font-extrabold text-app-text">{{ memberNames }}</h2>
            <p class="font-semibold text-app-text-muted">
              {{ loadingCouple ? 'Cargando...' : hasCouple ? 'Espacio activo' : 'Pendiente de crear' }}
            </p>
          </div>
        </div>

        <div class="mt-6 grid gap-3">
          <div v-if="couple" class="rounded-2xl bg-brand-cream p-4 text-sm font-semibold leading-6 text-app-text">
            Pareja #{{ couple.id }} creada. Miembros: {{ members.length }}.
          </div>
          <div v-else class="rounded-2xl bg-brand-cream p-4 text-sm font-semibold leading-6 text-app-text">
            Cuando acepte, podrán crear checklists compartidas, marcar tareas y seguir avances juntos.
          </div>

          <div v-if="members.length" class="space-y-2">
            <div v-for="member in members" :key="member.id" class="flex min-w-0 items-center gap-3 rounded-2xl border border-app-border bg-white/60 p-3">
              <span class="grid size-10 place-items-center rounded-xl bg-app-primary/15 text-app-primary">
                <UserRoundCheck :size="18" :stroke-width="1.8" />
              </span>
              <div class="min-w-0">
                <p class="truncate font-extrabold text-app-text">{{ member.display_name }}</p>
                <p class="truncate text-sm font-semibold text-app-text-muted">{{ member.email }}</p>
              </div>
            </div>
          </div>

          <div v-if="invite" class="rounded-3xl border border-app-border bg-white/70 p-4">
            <div class="flex items-center gap-2 font-extrabold text-app-text">
              <UsersRound :size="18" :stroke-width="1.8" />
              Invitación lista
            </div>
            <p class="mt-2 break-all text-xs font-semibold leading-5 text-app-text-muted">{{ inviteUrl || invite.token }}</p>
            <button class="btn-ghost mt-3 w-full" type="button" @click="copyInvite">Copiar enlace</button>
          </div>

          <button v-if="couple" class="btn-danger mt-2 w-full" :disabled="loading" type="button" @click="deleteCouple">
            <Trash2 class="mr-2" :size="18" :stroke-width="1.8" />
            {{ loading ? 'Eliminando...' : 'Borrar pareja' }}
          </button>
        </div>
      </div>
    </aside>
  </section>
</template>
