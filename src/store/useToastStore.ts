import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  // 核心添加方法
  const add = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = nextId++
    const toast = { id, message, type, duration }
    toasts.value.push(toast)

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  // 快捷方法 (Sugar)
  const success = (msg: string) => add(msg, 'success')
  const error = (msg: string) => add(msg, 'error')
  const warning = (msg: string) => add(msg, 'warning')
  const info = (msg: string) => add(msg, 'info')

  return { toasts, add, remove, success, error, warning, info }
})
