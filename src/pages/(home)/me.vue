<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { CalendarDays, Heart, LogOut, Mail, ShieldCheck, Sparkles, UserRound } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useCoupleStore } from '@/stores/couple'

interface ProfileUser {
  id?: number | string
  user_id?: number | string
  email?: string
  display_name?: string
  name?: string
  created_at?: string
}

const authStore = useAuthStore()
const coupleStore = useCoupleStore()
const { user, loading } = storeToRefs(authStore)
const { couple, members, loadingCouple, hasCouple } = storeToRefs(coupleStore)
const { handleLogout, checkSession } = authStore
const { loadCouple } = coupleStore

const profile = computed(() => (user.value ?? {}) as ProfileUser)
const displayName = computed(() => profile.value.display_name || profile.value.name || 'Tu perfil')
const email = computed(() => profile.value.email || 'Sin correo')
const initials = computed(() => {
  const source = displayName.value !== 'Tu perfil' ? displayName.value : email.value
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'YO'
})
const memberRole = computed(() => {
  const id = String(profile.value.id ?? profile.value.user_id ?? '')
  const member = members.value.find(item => String(item.id) === id || item.email === profile.value.email)
  return member?.role || 'Miembro'
})
const createdAt = computed(() => {
  if (!profile.value.created_at) return 'Disponible pronto'

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(profile.value.created_at))
})
const partnerLabel = computed(() => {
  const others = members.value.filter(member => member.email !== profile.value.email)
  if (!others.length) return hasCouple.value ? 'Esperando pareja' : 'Sin pareja activa'
  return others.map(member => member.display_name || member.email).join(' + ')
})

onMounted(async () => {
  await Promise.all([checkSession(), loadCouple()])
})
</script>

<template>
  <section class="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.75fr)]">
    <article class="min-w-0 animate-slide-up overflow-hidden bg-app-surface shadow-none sm:rounded-[2rem] sm:border sm:border-app-border sm:shadow-2xl sm:shadow-brand-ink/10">
      <div class="relative min-w-0 px-4 py-6 sm:p-6 md:p-8">
        <div class="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_18%_12%,rgb(197_176_205_/_0.65),transparent_34%),radial-gradient(circle_at_88%_0%,rgb(65_94_114_/_0.2),transparent_30%)]" />

        <div class="relative min-w-0">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-app-surface-muted/35 px-4 py-2 text-sm font-bold text-app-primary">
            <Sparkles :size="16" :stroke-width="2" />
            Perfil
          </div>

          <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex min-w-0 items-center gap-4">
              <div class="grid size-20 shrink-0 place-items-center rounded-[1.7rem] bg-app-primary text-2xl font-extrabold text-app-text-inverse shadow-xl shadow-app-primary/25 sm:size-24 sm:text-3xl">
                {{ initials }}
              </div>
              <div class="min-w-0">
                <h1 class="truncate text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl">
                  {{ displayName }}
                </h1>
                <p class="mt-2 flex min-w-0 items-center gap-2 truncate font-semibold text-app-text-muted">
                  <Mail class="shrink-0" :size="17" :stroke-width="1.8" />
                  {{ email }}
                </p>
              </div>
            </div>

            <button class="btn-secondary w-full sm:w-auto" :disabled="loading" type="button" @click="handleLogout">
              <LogOut class="mr-2 shrink-0" :size="18" :stroke-width="1.8" />
              {{ loading ? 'Saliendo...' : 'Cerrar sesión' }}
            </button>
          </div>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <div class="rounded-3xl border border-app-border bg-white/60 p-4">
              <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-app-text-muted">Cuenta</p>
              <p class="mt-2 text-lg font-extrabold text-app-text">Activa</p>
            </div>
            <div class="rounded-3xl border border-app-border bg-white/60 p-4">
              <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-app-text-muted">Rol</p>
              <p class="mt-2 truncate text-lg font-extrabold text-app-text">{{ memberRole }}</p>
            </div>
            <div class="rounded-3xl border border-app-border bg-white/60 p-4">
              <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-app-text-muted">Desde</p>
              <p class="mt-2 truncate text-lg font-extrabold text-app-text">{{ createdAt }}</p>
            </div>
          </div>
        </div>
      </div>
    </article>

    <aside class="min-w-0 animate-scale-in px-4 py-2 sm:rounded-3xl sm:border sm:border-app-border sm:bg-app-surface-muted/35 sm:p-6 sm:shadow-xl sm:shadow-brand-ink/5 md:rounded-4xl md:p-8">
      <div class="grid gap-3 sm:rounded-3xl sm:bg-app-surface sm:p-5 sm:shadow-lg sm:shadow-brand-ink/5">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-app-text-muted">Resumen</p>

        <div class="rounded-3xl bg-brand-cream p-4">
          <div class="flex items-center gap-3">
            <span class="grid size-11 place-items-center rounded-2xl bg-app-primary/15 text-app-primary">
              <Heart :size="20" :stroke-width="1.8" />
            </span>
            <div class="min-w-0">
              <p class="font-extrabold text-app-text">Pareja</p>
              <p class="truncate text-sm font-semibold text-app-text-muted">
                {{ loadingCouple ? 'Cargando...' : partnerLabel }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-app-border bg-white/70 p-4">
          <div class="flex items-center gap-3">
            <span class="grid size-11 place-items-center rounded-2xl bg-app-primary/15 text-app-primary">
              <UserRound :size="20" :stroke-width="1.8" />
            </span>
            <div class="min-w-0">
              <p class="font-extrabold text-app-text">Miembros</p>
              <p class="text-sm font-semibold text-app-text-muted">{{ members.length || 1 }} en espacio</p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-app-border bg-white/70 p-4">
          <div class="flex items-center gap-3">
            <span class="grid size-11 place-items-center rounded-2xl bg-app-primary/15 text-app-primary">
              <CalendarDays :size="20" :stroke-width="1.8" />
            </span>
            <div class="min-w-0">
              <p class="font-extrabold text-app-text">Calendario</p>
              <p class="text-sm font-semibold text-app-text-muted">Tus tareas compartidas</p>
            </div>
          </div>
        </div>

        <div v-if="couple" class="rounded-3xl border border-app-success/25 bg-app-success/10 p-4 text-sm font-bold leading-6 text-app-success">
          <ShieldCheck class="mb-2" :size="20" :stroke-width="1.8" />
          Espacio de pareja #{{ couple.id }} conectado.
        </div>
      </div>
    </aside>
  </section>
</template>
