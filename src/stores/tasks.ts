import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const server = import.meta.env.VITE_API_URL ?? 'https://checkco.onrender.com'

export type TaskPeriod = 'daily' | 'weekly' | 'monthly'

export interface TaskInstance {
  id: number
  task_id: number
  period_key: string
  due_date: string
  done_at?: string | null
  paid_at?: string | null
  created_at: string
}

export interface Task {
  id: number
  couple_id: number
  creator_user_id: number
  title: string
  description?: string | null
  period: TaskPeriod
  price_cents: number
  completion_limit: number
  created_at: string
  instances: TaskInstance[]
  debt_cents: number
}

const TASKS_LOADING_DELAY_MS = 900

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error?.message ?? data?.message ?? `Error ${response.status}`)
  }

  return data
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const period = ref<TaskPeriod>('daily')
  const title = ref('')
  const description = ref('')
  const priceCents = ref(0)
  const completionLimit = ref(1)
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')
  const events = ref<EventSource | null>(null)
  const reconnectTimer = ref<ReturnType<typeof setTimeout> | null>(null)
  const suppressedRealtimeReloads = ref(0)

  const dailyTasks = computed(() => tasks.value.filter(task => task.period === 'daily'))

  async function loadTasks(nextPeriod = period.value) {
    loading.value = true
    errorMessage.value = ''
    period.value = nextPeriod

    try {
      const [data] = await Promise.all([
        request(`/tasks?period=${nextPeriod}`),
        wait(TASKS_LOADING_DELAY_MS),
      ])
      const incoming = (data?.tasks ?? []) as Task[]
      const other = tasks.value.filter(task => task.period !== nextPeriod)
      tasks.value = [...other, ...incoming]
      return incoming
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar las tareas.'
      return []
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload?: {
    title?: string
    description?: string
    period?: TaskPeriod
    price_bs?: number
    price_cents?: number
    completion_limit?: number
  }) {
    const taskTitle = (payload?.title ?? title.value).trim()
    if (!taskTitle) return null

    const taskPeriod = payload?.period ?? period.value
    const taskDescription = (payload?.description ?? description.value).trim()
    const taskPriceCents = payload?.price_cents ?? Math.round((payload?.price_bs ?? priceCents.value / 100) * 100)
    const taskCompletionLimit = Math.max(1, Number((payload?.completion_limit ?? completionLimit.value) || 1))

    saving.value = true
    errorMessage.value = ''

    try {
      const data = await request('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          period: taskPeriod,
          price_cents: taskPriceCents,
          completion_limit: taskCompletionLimit,
        }),
      })

      title.value = ''
      description.value = ''
      priceCents.value = 0
      completionLimit.value = 1

      await loadTasks(taskPeriod)
      return data
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'No se pudo crear la tarea.'
      return null
    } finally {
      saving.value = false
    }
  }

  function patchLocalInstance(taskId: number, instanceId: number, patch: Partial<Pick<TaskInstance, 'done_at' | 'paid_at'>>) {
    const task = tasks.value.find(item => item.id === taskId)
    const instance = task?.instances.find(item => item.id === instanceId)
    if (!instance) return

    Object.assign(instance, patch)
  }

  async function setDone(task: Task, instance: TaskInstance, done: boolean) {
    const previous = instance.done_at ?? null
    const next = done ? new Date().toISOString() : null

    errorMessage.value = ''
    patchLocalInstance(task.id, instance.id, { done_at: next })
    suppressedRealtimeReloads.value += 1

    try {
      await request(`/tasks/${task.id}/instances/${instance.id}/done`, {
        method: 'PATCH',
        body: JSON.stringify({ done }),
      })
    } catch (error) {
      suppressedRealtimeReloads.value = Math.max(0, suppressedRealtimeReloads.value - 1)
      patchLocalInstance(task.id, instance.id, { done_at: previous })
      errorMessage.value = error instanceof Error ? error.message : 'No se pudo actualizar la tarea.'
    }
  }

  async function setPaid(task: Task, instance: TaskInstance, paid: boolean) {
    const previous = instance.paid_at ?? null
    const next = paid ? new Date().toISOString() : null

    errorMessage.value = ''
    patchLocalInstance(task.id, instance.id, { paid_at: next })
    suppressedRealtimeReloads.value += 1

    try {
      await request(`/tasks/${task.id}/instances/${instance.id}/paid`, {
        method: 'PATCH',
        body: JSON.stringify({ paid }),
      })
    } catch (error) {
      suppressedRealtimeReloads.value = Math.max(0, suppressedRealtimeReloads.value - 1)
      patchLocalInstance(task.id, instance.id, { paid_at: previous })
      errorMessage.value = error instanceof Error ? error.message : 'No se pudo actualizar el pago.'
    }
  }

  function connectRealtime() {
    if (events.value) return

    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }

    events.value = new EventSource(`${server}/events`, {
      withCredentials: true,
    })

    events.value.onopen = () => {
      console.log('SSE conectado')
    }

    const handleTaskEvent = async (event: MessageEvent) => {
      console.log('SSE task event', event.type, event.data)

      let payload: { type?: string } | null = null
      try {
        payload = JSON.parse(event.data)
      } catch (error) {
        console.log('SSE payload inválido', error)
      }

      const type = payload?.type ?? event.type
      if (type.startsWith('task.')) {
        if (suppressedRealtimeReloads.value > 0) {
          suppressedRealtimeReloads.value -= 1
          return
        }

        await loadTasks(period.value)
      }
    }

    ;[
      'task.created',
      'task.updated',
      'task.deleted',
      'task.done',
      'task.undone',
      'task.paid',
      'task.unpaid',
    ].forEach(type => events.value?.addEventListener(type, handleTaskEvent))
    events.value.onmessage = handleTaskEvent

    events.value.onerror = (event) => {
      console.log('SSE error', event)
      events.value?.close()
      events.value = null
      reconnectTimer.value = setTimeout(connectRealtime, 2000)
    }
  }

  function disconnectRealtime() {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }

    events.value?.close()
    events.value = null
  }

  return {
    tasks,
    dailyTasks,
    period,
    title,
    description,
    priceCents,
    completionLimit,
    loading,
    saving,
    errorMessage,
    loadTasks,
    createTask,
    setDone,
    setPaid,
    connectRealtime,
    disconnectRealtime,
  }
})
