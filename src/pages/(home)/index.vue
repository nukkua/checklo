<script setup lang="ts">
import { Heart } from '@lucide/vue';
</script>
<template>
  <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <article class="animate-slide-up rounded-[2rem] border border-app-border bg-app-surface p-6 shadow-2xl shadow-brand-ink/10 md:p-8">
      <div class="mb-6 inline-flex rounded-full bg-app-surface-muted/35 px-4 py-2 text-sm font-bold text-app-primary">
        Nueva pareja
      </div>

      <div class="space-y-3">
        <h1 class="text-3xl font-extrabold tracking-tight text-app-text md:text-5xl">
          Agrega a tu pareja y comiencen a organizarse juntos.
        </h1>
        <p class="max-w-2xl text-base leading-7 text-app-text-muted md:text-lg">
          Invita a esa persona especial para compartir listas, pendientes y pequeños planes diarios en un solo lugar.
        </p>
      </div>

      <form class="mt-8 grid gap-4">
        <label class="grid gap-2">
          <span class="text-sm font-bold text-app-text">Nombre de tu pareja</span>
          <input
            class="rounded-2xl border border-app-border bg-white/70 px-4 py-3 font-semibold text-app-text outline-none transition placeholder:text-app-text-muted/60 focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
            placeholder="Ej. Vianka"
            type="text"
          >
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-bold text-app-text">Correo electrónico</span>
          <input
            class="rounded-2xl border border-app-border bg-white/70 px-4 py-3 font-semibold text-app-text outline-none transition placeholder:text-app-text-muted/60 focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
            placeholder="vianka@email.com"
            type="email"
          >
        </label>

        <div class="mt-2 flex flex-col gap-3 sm:flex-row">
          <button class="btn-primary flex-1" type="button">
            Enviar invitación
          </button>
        </div>
      </form>
    </article>

    <aside class="animate-scale-in rounded-4xl border border-app-border bg-app-surface-muted/35 p-6 shadow-xl shadow-brand-ink/5 md:p-8">
      <div class="flex flex-col rounded-3xl bg-app-surface p-5 shadow-lg shadow-brand-ink/5">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-app-text-muted">Vista previa</p>
        <div class="mt-5 flex items-center gap-4">
          <div class="grid size-16 place-items-center rounded-3xl bg-app-primary text-2xl font-extrabold text-app-text-inverse">
            <heart />
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-app-text">Ustedes dos</h2>
            <p class="font-semibold text-app-text-muted">Pendiente de aceptar</p>
          </div>
        </div>
        <div class="mt-6 rounded-2xl bg-brand-cream p-4 text-sm font-semibold leading-6 text-app-text">
          Cuando acepte, podrán crear checklists compartidas, marcar tareas y seguir avances juntos.
        </div>
      </div>
    </aside>
  </section>
</template>
