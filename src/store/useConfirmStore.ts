import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

interface ConfirmOptions {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean // 是否是危险操作（显示红色按钮）
}

export const useConfirmStore = defineStore('confirm', () => {
  const visible = ref(false)

  // 弹窗内容
  const state = reactive<ConfirmOptions>({
    title: 'Confirm',
    content: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
  })

  // 存储 Promise 的 resolve 函数
  // 当用户点击按钮时，调用这个函数告诉等待的代码 "结果出来了"
  const resolveFn = ref<(result: boolean) => void>(() => {})

  // --- 核心方法：唤起弹窗 ---
  // 返回一个 Promise<boolean>，让调用者可以使用 await
  const show = (options: ConfirmOptions): Promise<boolean> => {
    state.title = options.title || 'Confirm'
    state.content = options.content || ''
    state.confirmText = options.confirmText || 'Confirm'
    state.cancelText = options.cancelText || 'Cancel'
    state.isDanger = options.isDanger || false

    visible.value = true

    return new Promise((resolve) => {
      resolveFn.value = resolve
    })
  }

  // 用户点击确定
  const handleConfirm = () => {
    visible.value = false
    resolveFn.value(true)
  }

  // 用户点击取消
  const handleCancel = () => {
    visible.value = false
    resolveFn.value(false)
  }

  return { visible, state, show, handleConfirm, handleCancel }
})
