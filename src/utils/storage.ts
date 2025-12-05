/**
 * Chrome Storage 封装，支持 Local 和 Sync
 */
export const storage = {
  // 获取数据 (优先从 area 读取，默认为 local)
  get: (keys: string | string[] | Object | null, area: 'local' | 'sync' = 'local') => {
    return new Promise<any>((resolve) => {
      chrome.storage[area].get(keys, (result) => {
        resolve(result)
      })
    })
  },

  // 保存数据
  set: (items: Object, area: 'local' | 'sync' = 'local') => {
    return new Promise<void>((resolve) => {
      chrome.storage[area].set(items, () => {
        // 检查错误（例如配额超限）
        if (chrome.runtime.lastError) {
          console.error('Storage Error:', chrome.runtime.lastError)
        }
        resolve()
      })
    })
  },

  // 删除数据
  remove: (keys: string | string[], area: 'local' | 'sync' = 'local') => {
    return new Promise<void>((resolve) => {
      chrome.storage[area].remove(keys, () => {
        resolve()
      })
    })
  },

  // 清空
  clear: (area: 'local' | 'sync' = 'local') => {
    return new Promise<void>((resolve) => {
      chrome.storage[area].clear(() => {
        resolve()
      })
    })
  },

  // 获取已用容量 (Bytes) - 用于极客的配额显示
  getBytesInUse: (area: 'local' | 'sync' = 'sync') => {
    return new Promise<number>((resolve) => {
      chrome.storage[area].getBytesInUse(null, (bytes) => {
        resolve(bytes)
      })
    })
  },
}
