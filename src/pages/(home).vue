<script setup lang="ts">
import { ref } from 'vue'
import { LogOut, Menu, UserRound, House, X } from '@lucide/vue'

const menuOpen = ref(false)

const closeMenu = () => {
  menuOpen.value = false
}

definePage({
  meta: {
    requiresAuth: true,
  },
})
</script>

<template>
  <div class="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col gap-8 animate-fade-in">
    <nav
      class="relative z-20 border border-app-border bg-app-surface/85 shadow-xl shadow-brand-ink/5 backdrop-blur transition-all duration-300"
      :class="menuOpen ? 'rounded-t-3xl rounded-b-none' : 'rounded-3xl'"
    >
      <div class="flex items-center justify-between px-5 py-4">
      <RouterLink to="/" class="flex items-center gap-3" @click="closeMenu">
        <span>
          <span class="block text-lg font-extrabold tracking-tight text-app-text">Checklo</span>
          <span class="block text-xs font-semibold text-app-text-muted">Tu espacio compartido</span>
        </span>
      </RouterLink>

      <div class="hidden items-center gap-2 md:flex">
        <RouterLink to="/" class="btn-ghost px-3 py-2">
          Inicio
        </RouterLink>
        <RouterLink to="/me" class="btn-ghost px-3 py-2">
          Perfil
        </RouterLink>
      </div>

      <button type="button" class="hidden btn-secondary md:inline-flex">
        <LogOut :stroke-width="1.5" :size="19" />
      </button>

      <button
        type="button"
        class="relative grid size-12 place-items-center overflow-hidden rounded-2xl border border-app-border bg-app-surface-muted/45 text-app-text shadow-lg shadow-brand-ink/5 transition duration-300 hover:-translate-y-0.5 hover:border-app-primary hover:bg-app-primary hover:text-app-text-inverse md:hidden cursor-pointer"
        :aria-expanded="menuOpen"
        aria-label="Abrir menú"
        @click="menuOpen = !menuOpen"
      >
        <Menu
          :size="22"
          :stroke-width="1.8"
          class="absolute transition duration-300"
          :class="menuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'"
        />
        <X
          :size="22"
          :stroke-width="1.8"
          class="absolute transition duration-300"
          :class="menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'"
        />
      </button>

      </div>

      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="-translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-4 opacity-0"
      >
        <div
          v-if="menuOpen"
          class="origin-top border-t border-app-border bg-app-surface/95 p-3 shadow-inner shadow-brand-ink/5 md:hidden"
        >
            <RouterLink
              to="/"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-app-text transition hover:bg-app-surface-muted/45 hover:text-app-primary"
              @click="closeMenu"
            >
              <span class="grid size-10 place-items-center rounded-xl bg-app-primary/15 text-app-primary">
                <House :size="19" :stroke-width="1.8" />
              </span>
              Inicio
            </RouterLink>
            <RouterLink
              to="/me"
              class="mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-app-text transition hover:bg-app-surface-muted/45 hover:text-app-primary"
              @click="closeMenu"
            >
              <span class="grid size-10 place-items-center rounded-xl bg-app-primary/15 text-app-primary">
                <UserRound :size="19" :stroke-width="1.8" />
              </span>
              Perfil
            </RouterLink>
            <button
              type="button"
              class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-app-primary px-4 py-3 font-extrabold text-app-text-inverse shadow-lg shadow-app-primary/25 transition hover:-translate-y-0.5 hover:bg-app-primary-hover cursor-pointer"
              @click="closeMenu"
            >
              <LogOut :size="18" :stroke-width="1.8" />
              Cerrar sesión
            </button>
          </div>
      </Transition>
    </nav>

    <main class="flex-1 transition-[filter] duration-200 ease-out" :class="menuOpen ? 'blur-[1.5px]' : 'blur-0'">
      <router-view />
    </main>
  </div>
</template>
