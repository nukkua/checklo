<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { CalendarDays, ChevronLeft, ChevronRight, Check, LockKeyhole, Plus, UsersRound, WalletCards, X } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useCoupleStore } from '@/stores/couple'
import { useTasksStore, type Task, type TaskInstance } from '@/stores/tasks'

const authStore = useAuthStore()
const coupleStore = useCoupleStore()
const tasksStore = useTasksStore()
const { user } = storeToRefs(authStore)
const { hasCouple, loadingCouple } = storeToRefs(coupleStore)
const { dailyTasks, loading, saving, errorMessage } = storeToRefs(tasksStore)

const today = new Date()
const cursor = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref(toDateKey(today))
const newTitle = ref('')
const newDescription = ref('')
const newPriceBs = ref<number | null>(null)
const newCompletionLimit = ref(1)
const taskModalOpen = ref(false)

const monthName = computed(() => monthLabel(cursor.value))
const year = computed(() => cursor.value.getFullYear())
const selectedLabel = computed(() => dayLabel(parseDateKey(selectedDate.value)))

const calendarDays = computed(() => {
  const start = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1)
  const end = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 0)
  const leading = (start.getDay() + 6) % 7
  const days: Date[] = []

  for (let i = leading; i > 0; i--) days.push(new Date(start.getFullYear(), start.getMonth(), 1 - i))
  for (let i = 1; i <= end.getDate(); i++) days.push(new Date(start.getFullYear(), start.getMonth(), i))
  while (days.length % 7 !== 0 || days.length < 42) {
    const last = days.at(-1) ?? end
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1))
  }

  return days
})

const selectedItems = computed(() => itemsForDate(selectedDate.value))
const currentUserId = computed(() => {
  const value = user.value as { id?: number | string, user_id?: number | string } | null
  return Number(value?.id ?? value?.user_id ?? 0)
})
const isInitialTasksLoading = computed(() => loading.value && dailyTasks.value.length === 0)
const taskSkeletonCount = computed(() => Math.max(0, selectedItems.value.length + (saving.value ? 1 : 0)))

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(key: string) {
  const [year = today.getFullYear(), month = today.getMonth() + 1, day = today.getDate()] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('es', { month: 'long' }).format(date)
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

function shortDay(date: Date) {
  return new Intl.DateTimeFormat('es', { weekday: 'short' }).format(date).slice(0, 1).toUpperCase()
}

function money(cents: number) {
  return `Bs ${(cents / 100).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function itemsForDate(dateKey: string) {
  return dailyTasks.value
    .map(task => ({
      task,
      instance: task.instances.find(instance => instance.period_key === dateKey || instance.due_date?.slice(0, 10) === dateKey),
    }))
    .filter((item): item is { task: Task, instance: TaskInstance } => Boolean(item.instance))
}

function isCurrentMonth(date: Date) {
  return date.getMonth() === cursor.value.getMonth()
}

function isToday(date: Date) {
  return toDateKey(date) === toDateKey(today)
}

function changeMonth(amount: number) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + amount, 1)
}

function canEditTask(task: Task) {
  return currentUserId.value > 0 && task.creator_user_id === currentUserId.value
}

async function toggleDone(item: { task: Task, instance: TaskInstance }) {
  if (!canEditTask(item.task)) return
  await tasksStore.setDone(item.task, item.instance, !item.instance.done_at)
}

async function togglePaid(item: { task: Task, instance: TaskInstance }) {
  if (!canEditTask(item.task)) return
  await tasksStore.setPaid(item.task, item.instance, !item.instance.paid_at)
}

async function addTask() {
  const title = newTitle.value.trim()
  if (!title) return

  const created = await tasksStore.createTask({
    title,
    description: newDescription.value.trim(),
    period: 'daily',
    price_bs: Number(newPriceBs.value ?? 0),
    completion_limit: Math.max(1, Number(newCompletionLimit.value || 1)),
  })

  if (!created) return

  newTitle.value = ''
  newDescription.value = ''
  newPriceBs.value = null
  newCompletionLimit.value = 1
  taskModalOpen.value = false
}

onMounted(async () => {
  await coupleStore.loadCouple()
  if (hasCouple.value) {
    await tasksStore.loadTasks('daily')
    tasksStore.connectRealtime()
  }
})

onUnmounted(() => {
  tasksStore.disconnectRealtime()
})

definePage({
  meta: {
    requiresAuth: true,
  },
})
</script>

<template>
  <section class="-mx-4 -mt-5 min-h-[calc(100svh-5rem)] text-app-text sm:mx-0 sm:mt-0 sm:p-5 lg:p-7" :class="hasCouple ? 'bg-[radial-gradient(circle_at_top,_rgba(197,176,205,0.45),_transparent_35%),linear-gradient(180deg,#17313e_0%,#17313e_32%,#f3e2d4_32%)] sm:rounded-[2rem] sm:border sm:border-app-border sm:bg-[linear-gradient(135deg,#fff9f4_0%,#f3e2d4_42%,#efe5ef_100%)]' : 'bg-transparent sm:bg-transparent'">
    <div v-if="loadingCouple" class="grid min-h-[calc(100svh-7rem)] place-items-center px-4">
      <div class="rounded-4xl bg-app-surface p-8 text-center shadow-2xl shadow-brand-ink/10 ring-1 ring-app-border">
        <CalendarDays class="mx-auto text-app-primary" :size="42" />
        <p class="mt-4 text-lg font-extrabold">Preparando calendario…</p>
      </div>
    </div>

    <div v-else-if="!hasCouple" class="grid min-h-[calc(100svh-20rem)] place-items-center mx-auto">
      <article class="w-full max-w-md rounded-4xl bg-app-surface p-6 text-center shadow-2xl shadow-brand-ink/10 sm:p-8">
        <span class="mx-auto grid size-16 place-items-center rounded-3xl bg-app-primary text-app-text-inverse">
          <UsersRound :size="30" />
        </span>
        <p class="mt-5 text-xs font-extrabold uppercase tracking-[0.25em] text-app-text-muted">Calendario bloqueado</p>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-app-text">Primero crea tu pareja.</h1>
        <p class="mt-3 text-pretty font-semibold leading-7 text-app-text-muted">
          Las tareas viven en espacio compartido. Agrega o acepta pareja para ver calendario mensual.
        </p>
        <RouterLink to="/" class="btn-primary mt-6 w-full">
          Ir a pareja
        </RouterLink>
      </article>
    </div>

    <div v-else class="mx-auto max-w-7xl">
      <header class="sticky top-0 z-10 bg-brand-ink/95 px-4 pb-4 pt-5 text-app-text-inverse backdrop-blur sm:static sm:rounded-[2rem] sm:bg-brand-ink sm:px-6 sm:py-5 sm:shadow-2xl sm:shadow-brand-ink/10 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-8">
        <div class="flex items-center justify-between gap-3 lg:contents p-3 md:p-0">
          <button class="grid size-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 transition hover:bg-white/15 lg:order-2" type="button" @click="changeMonth(-1)">
            <ChevronLeft :size="22" />
          </button>

          <div class="min-w-0 text-center lg:order-1 lg:flex-1 lg:text-left">
            <p class="text-xs font-extrabold uppercase tracking-[0.28em] text-app-secondary">Calendario · {{ year }}</p>
            <h1 class="truncate text-4xl font-extrabold capitalize tracking-tight sm:text-5xl lg:text-6xl">{{ monthName }}</h1>
          </div>

          <button class="grid size-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 transition hover:bg-white/15 lg:order-3" type="button" @click="changeMonth(1)">
            <ChevronRight :size="22" />
          </button>
        </div>

        <div class="mt-5 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-extrabold text-white/55 sm:hidden">
          <span v-for="day in calendarDays.slice(0, 7)" :key="shortDay(day)">{{ shortDay(day) }}</span>
        </div>

        <div class="hidden rounded-[1.5rem] bg-white/10 px-5 py-4 ring-1 ring-white/15 lg:block lg:w-80">
          <p class="mt-1 text-2xl font-extrabold capitalize">{{ selectedLabel }}</p>
          <p class="mt-2 text-sm font-semibold text-white/65">{{ selectedItems.length }} tareas este día</p>
        </div>
      </header>

      <div class="grid gap-4 px-4 py-4 sm:px-0 sm:py-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-6">
        <article class="overflow-hidden rounded-[1.75rem] bg-app-surface/95 shadow-2xl shadow-brand-ink/10 ring-1 ring-app-border/70 lg:rounded-[2rem]">
          <div class="grid grid-cols-7 border-b border-app-border bg-app-surface-muted/20 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-app-text-muted">
            <span v-for="label in ['L','M','X','J','V','S','D']" :key="label" class="py-2.5 lg:py-3">{{ label }}</span>
          </div>

          <div class="grid grid-cols-7">
            <button
              v-for="date in calendarDays"
              :key="toDateKey(date)"
              type="button"
              class="group min-h-20 border-b border-r border-app-border/75 p-1.5 text-left transition hover:bg-app-surface-muted/25 active:scale-[0.98] sm:min-h-28 sm:p-2.5 lg:min-h-32 lg:p-3"
              :class="[
                isCurrentMonth(date) ? 'bg-app-surface' : 'bg-app-surface-muted/20 text-app-text-muted/45',
                selectedDate === toDateKey(date) ? 'shadow-[inset_0_0_0_2px_#415e72]' : '',
              ]"
              @click="selectedDate = toDateKey(date)"
            >
              <span
                class="grid size-8 place-items-center rounded-full text-sm font-extrabold transition sm:size-9 sm:text-base lg:size-10"
                :class="isToday(date) ? 'bg-app-primary text-app-text-inverse' : selectedDate === toDateKey(date) ? 'bg-app-secondary text-app-text' : ''"
              >
                {{ date.getDate() }}
              </span>

              <div class="mt-2 space-y-1.5 lg:mt-3">
                <span
                  v-for="item in itemsForDate(toDateKey(date)).slice(0, 3)"
                  :key="item.instance.id"
                  class="block h-1.5 rounded-full"
                  :class="item.instance.done_at ? 'bg-app-success' : 'bg-app-primary'"
                />
                <span v-if="itemsForDate(toDateKey(date)).length > 3" class="block text-center text-[0.65rem] font-bold text-app-text-muted">
                  +{{ itemsForDate(toDateKey(date)).length - 3 }}
                </span>
              </div>
            </button>
          </div>
        </article>

        <aside class="bg-app-surface shadow-2xl shadow-brand-ink/10 ring-1 ring-app-border p-5  lg:sticky lg:top-6 lg:rounded-4xl lg:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-extrabold uppercase tracking-[0.25em] text-app-text-muted">Día</p>
              <h2 class="mt-1 text-2xl font-extrabold capitalize text-app-text">{{ selectedLabel }}</h2>
            </div>
            <span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-app-primary text-app-text-inverse">
              <CalendarDays :size="22" />
            </span>
          </div>

          <button class="btn-primary mt-5 w-full" type="button" @click="taskModalOpen = true">
            <Plus class="mr-2 shrink-0" :size="20" />
            Nueva tarea
          </button>

          <p v-if="errorMessage" class="mt-3 rounded-2xl bg-app-danger/10 px-4 py-3 text-sm font-bold text-app-danger">
            {{ errorMessage }}
          </p>

          <div v-if="isInitialTasksLoading" class="mt-6 animate-pulse rounded-3xl bg-app-surface-muted/25 p-6" aria-label="Cargando tareas">
            <div class="h-5 w-2/3 rounded-full bg-app-surface-muted" />
            <div class="mt-3 h-3 w-full rounded-full bg-app-surface-muted/80" />
            <div class="mt-2 h-3 w-4/5 rounded-full bg-app-surface-muted/70" />
          </div>

          <div v-else-if="loading && taskSkeletonCount > 0" class="mt-6 space-y-3" aria-label="Cargando tareas">
            <div
              v-for="index in taskSkeletonCount"
              :key="index"
              class="animate-pulse rounded-3xl border border-app-border bg-white/70 p-4 shadow-lg shadow-brand-ink/5"
            >
              <div class="flex items-start gap-3">
                <div class="size-11 shrink-0 rounded-2xl bg-app-surface-muted" />
                <div class="min-w-0 flex-1 space-y-3 py-1">
                  <div class="h-4 w-3/4 rounded-full bg-app-surface-muted" />
                  <div class="h-3 w-1/2 rounded-full bg-app-surface-muted/80" />
                  <div class="h-3 w-20 rounded-full bg-app-surface-muted/70" />
                </div>
                <div class="size-11 shrink-0 rounded-2xl bg-app-surface-muted" />
              </div>
            </div>
          </div>

          <div v-else-if="selectedItems.length === 0" class="mt-6 rounded-3xl bg-app-surface-muted/25 p-6 text-center">
            <p class="font-extrabold">Día limpio.</p>
            <p class="mt-1 text-sm font-semibold text-app-text-muted">Crea tarea o navega otro día.</p>
          </div>

          <div v-else class="mt-5 space-y-3">
            <article
              v-for="item in selectedItems"
              :key="item.instance.id"
              class="rounded-3xl border bg-white/70 p-4 shadow-lg shadow-brand-ink/5 transition"
              :class="canEditTask(item.task) ? 'border-app-border' : 'border-app-border/60 opacity-75 saturate-[0.85]'"
            >
              <div class="flex items-start gap-3">
                <button
                  type="button"
                  class="grid size-11 shrink-0 place-items-center rounded-2xl border font-bold transition"
                  :class="[
                    item.instance.done_at ? 'border-app-success bg-app-success text-white' : 'border-app-border bg-app-surface text-app-text-muted',
                    canEditTask(item.task) ? '' : 'cursor-not-allowed opacity-60 grayscale',
                  ]"
                  :disabled="!canEditTask(item.task)"
                  :title="canEditTask(item.task) ? 'Marcar tarea' : 'No puedes editar esta tarea'"
                  @click="toggleDone(item)"
                >
                  <Check :size="20" />
                </button>
                <div class="min-w-0 flex-1">
                  <div class="flex min-w-0 items-center gap-2">
                    <h3 class="truncate text-lg font-extrabold">{{ item.task.title }}</h3>
                    <LockKeyhole v-if="!canEditTask(item.task)" class="shrink-0 text-app-text-muted/55" :size="14" aria-label="No editable" />
                  </div>
                  <p v-if="item.task.description" class="mt-1 text-sm font-semibold text-app-text-muted">{{ item.task.description }}</p>
                  <p class="mt-2 text-sm font-bold text-app-primary">{{ money(item.task.price_cents) }}</p>
                </div>
                <button
                  type="button"
                  class="grid size-11 shrink-0 place-items-center rounded-2xl border transition"
                  :class="[
                    item.instance.paid_at ? 'border-app-primary bg-app-primary text-white' : 'border-app-border bg-app-surface text-app-text-muted',
                    canEditTask(item.task) ? '' : 'cursor-not-allowed opacity-60 grayscale',
                  ]"
                  :disabled="!canEditTask(item.task)"
                  :title="canEditTask(item.task) ? 'Marcar pago' : 'No puedes editar esta tarea'"
                  @click="togglePaid(item)"
                >
                  <WalletCards :size="19" />
                </button>
              </div>
            </article>
          </div>
        </aside>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="taskModalOpen" class="fixed inset-0 z-50 grid place-items-center bg-brand-ink/55 p-4 backdrop-blur-sm" @click.self="taskModalOpen = false">
          <form class="w-full max-w-md rounded-[2rem] bg-app-surface p-5 shadow-2xl shadow-brand-ink/25 ring-1 ring-app-border sm:p-6" @submit.prevent="addTask">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-extrabold uppercase tracking-[0.25em] text-app-text-muted">Nueva tarea</p>
                <h2 class="mt-1 text-2xl font-extrabold text-app-text">Crear tarea diaria</h2>
                <p class="mt-1 text-sm font-semibold text-app-text-muted">Se agregará al calendario.</p>
              </div>
              <button class="grid size-11 shrink-0 place-items-center rounded-2xl bg-app-surface-muted/45 text-app-text transition hover:bg-app-primary hover:text-app-text-inverse" type="button" aria-label="Cerrar modal" @click="taskModalOpen = false">
                <X :size="20" />
              </button>
            </div>

            <div class="mt-5 grid gap-3">
              <input
                v-model="newTitle"
                class="min-w-0 w-full rounded-2xl border border-app-border bg-white/80 px-4 py-3 font-semibold outline-none focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                placeholder="Nueva tarea diaria"
                autofocus
              >
              <textarea
                v-model="newDescription"
                class="min-h-24 min-w-0 w-full resize-none rounded-2xl border border-app-border bg-white/80 px-4 py-3 font-semibold outline-none focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                placeholder="Descripción opcional"
              />
              <div class="grid grid-cols-2 gap-2">
                <label class="grid gap-1">
                  <span class="px-1 text-xs font-extrabold uppercase tracking-[0.16em] text-app-text-muted">Precio Bs</span>
                  <input
                    v-model.number="newPriceBs"
                    class="min-w-0 rounded-2xl border border-app-border bg-white/80 px-4 py-3 font-semibold outline-none focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                    min="0"
                    step="0.01"
                    type="number"
                    placeholder="0.00"
                  >
                </label>
                <label class="grid gap-1">
                  <span class="px-1 text-xs font-extrabold uppercase tracking-[0.16em] text-app-text-muted">Límite</span>
                  <input
                    v-model.number="newCompletionLimit"
                    class="min-w-0 rounded-2xl border border-app-border bg-white/80 px-4 py-3 font-semibold outline-none focus:border-app-focus focus:ring-4 focus:ring-app-focus/15"
                    min="1"
                    step="1"
                    type="number"
                  >
                </label>
              </div>
            </div>

            <button class="btn-primary mt-5 w-full" type="submit" :disabled="saving || !newTitle.trim()">
              <Plus class="mr-2 shrink-0" :size="20" />
              {{ saving ? 'Creando…' : 'Crear tarea' }}
            </button>
          </form>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
