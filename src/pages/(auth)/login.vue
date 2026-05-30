<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useCoupleStore } from '@/stores/couple';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();
const coupleStore = useCoupleStore();
const { email, password, validLogin } = storeToRefs(userStore);

const authStore = useAuthStore();
const { loading, errorMessage, successMessage } = storeToRefs(authStore);
const { handleLogin, clearMessages } = authStore;

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
      class="grid min-h-svh w-full overflow-hidden bg-app-surface md:min-h-0 md:max-w-5xl md:rounded-[2rem] md:border md:border-app-border md:shadow-2xl md:shadow-app-primary/10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <aside class="relative hidden bg-app-primary p-10 text-app-text-inverse md:flex md:flex-col md:justify-between">
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(197_176_205_/_0.45),transparent_32%),radial-gradient(circle_at_85%_70%,rgb(243_226_212_/_0.22),transparent_30%)]" />

        <div class="relative space-y-6">
          <div
            class="inline-flex items-center rounded-full bg-app-text-inverse/10 px-4 py-2 text-sm font-bold backdrop-blur">
            Checklo
          </div>
          <div class="space-y-4">
            <h1 class="max-w-sm text-4xl font-extrabold leading-tight">Lleva un control con tu
              pareja</h1>
            <p class="max-w-md text-base leading-7 text-app-text-inverse/80">
              Organiza hábitos, pendientes y rutinas desde un espacio compartido, simple, cálido y confiable.
            </p>
          </div>
        </div>

        <div class="relative rounded-3xl border border-app-text-inverse/15 bg-app-text-inverse/10 p-5 backdrop-blur">
          <p class="text-sm font-semibold text-app-text-inverse/80">Hoy</p>
          <div class="mt-4 space-y-3">
            <div class="h-3 w-2/3 rounded-full bg-app-text-inverse/80" />
            <div class="h-3 w-1/2 rounded-full bg-app-secondary" />
            <div class="h-3 w-4/5 rounded-full bg-app-text-inverse/35" />
          </div>
        </div>
      </aside>

      <div class="flex min-h-svh items-center px-5 py-8 sm:p-8 md:min-h-0 lg:p-12">
        <div class="mx-auto w-full max-w-md animate-slide-up">
          <div class="mb-8 space-y-2 text-center md:text-left">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-app-primary">Bienvenido</p>
            <h2 class="text-3xl font-extrabold text-app-text sm:text-4xl md:text-3xl">Inicia sesión</h2>
            <p class="text-pretty text-app-text-muted">Entra para continuar gestionando tus checklists.</p>
          </div>

          <form class="space-y-5">
            <div
              v-if="successMessage"
              class="rounded-2xl border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-bold text-app-success"
            >
              {{ successMessage }}
            </div>
            <div
              v-if="errorMessage"
              class="rounded-2xl border border-app-danger/30 bg-app-danger/10 px-4 py-3 text-sm font-bold text-app-danger"
            >
              {{ errorMessage }}
            </div>

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
                type="password" placeholder="••••••••" />
            </label>
            <button @click="handleLogin" class="btn-primary w-full" :disabled="!validLogin || loading" type="button">
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>

          <p class="mt-8 text-center text-sm text-app-text-muted">
            ¿No tienes cuenta?
            <RouterLink class="font-extrabold text-app-primary hover:text-app-primary-hover" to="/signup">
              Crear cuenta
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
