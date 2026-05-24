import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  const square = computed(() => count.value * count.value)
  const increment = () => {
    count.value++
  }

  const $reset = () => {
    count.value = 0
  }

  return { count, doubleCount, square, increment, $reset }
})
