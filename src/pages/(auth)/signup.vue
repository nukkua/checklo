<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useCoupleStore } from '@/stores/couple';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();
const coupleStore = useCoupleStore();
const { name, email, password, acceptTerms, validSignUp } = storeToRefs(userStore);
const { loading, errorMessage, successMessage } = storeToRefs(authStore);
const { handleSignUp, clearMessages } = authStore;


onMounted(() => {
  clearMessages();

  const invite = route.query.invite;
  const token = Array.isArray(invite) ? invite[0] : invite;

  if (token) {
    coupleStore.inviteToken = token;
  }
})

</script>
<template>
  <section
    class="-mx-4 -my-5 flex min-h-svh items-stretch justify-center sm:-m-6 md:m-0 md:min-h-[calc(100svh-3rem)] md:items-center md:px-4 md:py-10">
    <div
      class="grid min-h-svh w-full overflow-hidden bg-app-surface md:min-h-0 md:max-w-5xl
      md:rounded-4xl md:border md:border-app-border md:shadow-2xl md:shadow-app-primary/10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div class="flex min-h-svh items-center px-5 py-8 sm:p-8 md:min-h-0 lg:p-12">
        <div class="mx-auto w-full max-w-md animate-slide-up">
          <div class="mb-8 space-y-2 text-center md:text-left">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-app-primary">Únete a Checklo</p>
            <h2 class="text-3xl font-extrabold text-app-text sm:text-4xl md:text-3xl">Crea tu cuenta</h2>
            <p class="text-pretty text-app-text-muted">Empieza a organizar tus rutinas y pendientes en minutos
              con tu pareja.</p>
          </div>

          <form class="space-y-5">
            <div v-if="successMessage"
              class="rounded-2xl border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-bold text-app-success">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage"
              class="rounded-2xl border border-app-danger/30 bg-app-danger/10 px-4 py-3 text-sm font-bold text-app-danger">
              {{ errorMessage }}
            </div>

            <label class="block space-y-2">
              <span class="text-sm font-bold text-app-text">Nombre</span>
              <input v-model="name"
                class="w-full rounded-2xl border border-app-border bg-app-bg/60 px-4 py-3 text-app-text outline-none transition placeholder:text-app-text-muted/70 focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                type="text" placeholder="Tu nombre" />
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-bold text-app-text">Correo electrónico</span>
              <input v-model="email"
                class="w-full rounded-2xl border border-app-border bg-app-bg/60 px-4 py-3 text-app-text outline-none transition placeholder:text-app-text-muted/70 focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                type="email" placeholder="tu@email.com" />
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-bold text-app-text">Contraseña</span>
              <input v-model="password"
                class="w-full rounded-2xl border border-app-border bg-app-bg/60 px-4 py-3 text-app-text outline-none transition placeholder:text-app-text-muted/70 focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                type="password" placeholder="Mínimo 8 caracteres" />
            </label>

            <label class="flex items-start gap-3 rounded-2xl bg-app-bg/70 p-4 text-sm
              text-app-text-muted cursor-pointer">
              <input v-model="acceptTerms" class="mt-1 size-4 accent-app-primary" type="checkbox" />
              <span>Acepto recibir recordatorios y mantener mis checklists sincronizadas.</span>
            </label>

            <button @click="handleSignUp" :disabled="!validSignUp || loading" class="btn-primary w-full" type="button">
              {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="mt-8 text-center text-sm text-app-text-muted">
            ¿Ya tienes cuenta?
            <RouterLink
              class="font-extrabold text-app-primary hover:text-app-primary-hover"
              :to="{ path: '/login', query: coupleStore.inviteToken ? { invite: coupleStore.inviteToken } : undefined }"
            >
              Iniciar sesión
            </RouterLink>
          </p>
        </div>
      </div>

      <aside class="relative hidden bg-app-secondary p-10 text-app-text md:flex md:flex-col md:justify-between">
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_248_243_/_0.7),transparent_32%),radial-gradient(circle_at_85%_70%,rgb(65_94_114_/_0.22),transparent_30%)]" />

        <div class="relative space-y-6">
          <div
            class="inline-flex items-center rounded-full bg-app-surface/70 px-4 py-2 text-sm font-bold text-app-primary shadow-sm">
            Nuevo comienzo
          </div>
          <div class="space-y-4">
            <h1 class="max-w-sm text-4xl font-extrabold leading-tight">
              Convierte pendientes en progreso visible.
            </h1>
            <p class="max-w-md text-base leading-7 text-app-text-muted">
              Crea listas, marca avances y mantén todo bajo control con una interfaz tranquila.
            </p>
          </div>
        </div>

        <div
          class="relative grid gap-3 rounded-3xl border border-app-surface/70 bg-app-surface/70 p-5 shadow-xl shadow-app-primary/10 backdrop-blur">
          <div class="flex items-center justify-between rounded-2xl bg-app-bg px-4 py-3">
            <span class="font-bold">Rutina diaria</span>
            <span class="rounded-full bg-app-success px-3 py-1 text-xs font-extrabold text-white">80%</span>
          </div>
          <div class="flex items-center justify-between rounded-2xl bg-app-bg px-4 py-3">
            <span class="font-bold">Pesaje Mensual</span>
            <span class="rounded-full bg-app-warning px-3 py-1 text-xs font-extrabold text-white">3 pendientes</span>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
