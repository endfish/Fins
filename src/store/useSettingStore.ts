import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storage } from '../utils/storage'
// 1. 引入新 Store
import { useGridStore } from './useGridStore'
import { useToastStore } from './useToastStore'
import { useConfirmStore } from './useConfirmStore'
import LZString from 'lz-string'

export interface SearchEngine {
  name: string
  icon: string
  url: string
}

export const useSettingStore = defineStore('settings', () => {
  // --- 1. State: 基础设置 ---
  const title = ref('Fins')
  const bgMode = ref<'bing' | 'custom'>('bing')
  const customBgUrl = ref('')

  // --- 2. State: 搜索引擎 ---
  const searchEngines = ref<SearchEngine[]>([])
  const currentEngineIndex = ref(0)

  // --- 3. State: 同步相关 ---
  const syncEnabled = ref(false)
  const syncUsage = ref(0)
  const syncQuota = 102400 // Chrome Sync 限制 100KB

  const initialized = ref(false)
  const toast = useToastStore()
  const confirmStore = useConfirmStore()

  // =========================================================================
  // Actions: 初始化与基础操作
  // =========================================================================

  const init = async () => {
    if (initialized.value) return

    const keys = ['fins_title', 'fins_bg_mode', 'fins_custom_bg_url', 'fins_search_engines', 'fins_current_engine_index', 'fins_sync_enabled']
    const data = await storage.get(keys, 'local')

    // 恢复基础设置
    if (data.fins_title) title.value = data.fins_title
    if (data.fins_bg_mode) bgMode.value = data.fins_bg_mode
    if (data.fins_custom_bg_url) customBgUrl.value = data.fins_custom_bg_url

    // 恢复搜索引擎
    if (data.fins_search_engines && Array.isArray(data.fins_search_engines)) {
      searchEngines.value = data.fins_search_engines
    } else {
      searchEngines.value = [
        { name: 'Bing', icon: 'ri-search-2-line', url: 'https://www.bing.com/search?q=' },
        { name: 'Google', icon: 'ri-google-fill', url: 'https://www.google.com/search?q=' },
        { name: 'Baidu', icon: 'ri-baidu-fill', url: 'https://www.baidu.com/s?wd=' },
        { name: 'GitHub', icon: 'ri-github-fill', url: 'https://github.com/search?q=' },
      ]
    }

    if (typeof data.fins_current_engine_index === 'number') {
      currentEngineIndex.value = data.fins_current_engine_index
    }

    // 恢复同步状态
    if (data.fins_sync_enabled) {
      syncEnabled.value = true
      updateSyncUsage()
    }

    initialized.value = true
  }

  const updateSyncUsage = async () => {
    try {
      const bytes = await storage.getBytesInUse('sync')
      syncUsage.value = bytes
    } catch (e) {
      console.warn('Sync storage not available', e)
    }
  }

  // 基础 Setter
  const setTitle = (val: string) => {
    title.value = val || 'Fins'
  }
  const setBgMode = (val: 'bing' | 'custom') => {
    bgMode.value = val
  }
  const setCustomBgUrl = (val: string) => {
    customBgUrl.value = val
  }

  // 搜索引擎操作
  const addEngine = (engine: SearchEngine) => {
    searchEngines.value.push(engine)
  }
  const removeEngine = (index: number) => {
    if (searchEngines.value.length <= 1) {
      toast.info('Keep at least one engine.')
      return
    }
    searchEngines.value.splice(index, 1)
    if (index <= currentEngineIndex.value) currentEngineIndex.value = 0
  }
  const updateEngine = (index: number, engine: SearchEngine) => {
    searchEngines.value[index] = engine
  }
  const setCurrentEngine = (index: number) => {
    currentEngineIndex.value = index
  }

  // =========================================================================
  // Helper: 数据打包与解包 (适配 Fins 2.0)
  // =========================================================================

  const getFullData = () => {
    // 2. 使用 gridStore
    const gridStore = useGridStore()
    return {
      // Settings
      fins_title: title.value,
      fins_bg_mode: bgMode.value,
      fins_custom_bg_url: customBgUrl.value,
      fins_search_engines: JSON.parse(JSON.stringify(searchEngines.value)),
      fins_current_engine_index: currentEngineIndex.value,

      // Grid Data (V2)
      fins_v2_groups: JSON.parse(JSON.stringify(gridStore.groups)),
      fins_v2_items: JSON.parse(JSON.stringify(gridStore.items)),
      fins_current_group_id: gridStore.currentGroupId,

      // Meta
      timestamp: Date.now(),
      version: '0.0.2', // 升级版本号
      platform: 'fins-extension',
    }
  }

  const restoreFullData = (data: any) => {
    // 1. 恢复 Settings
    if (data.fins_title) title.value = data.fins_title
    if (data.fins_bg_mode) bgMode.value = data.fins_bg_mode
    if (data.fins_custom_bg_url) customBgUrl.value = data.fins_custom_bg_url

    if (data.fins_search_engines && Array.isArray(data.fins_search_engines)) {
      searchEngines.value = data.fins_search_engines
    }
    if (typeof data.fins_current_engine_index === 'number') {
      currentEngineIndex.value = data.fins_current_engine_index
    }

    // 2. 恢复 Grid Data (操作 GridStore)
    const gridStore = useGridStore()

    // 优先读取 V2 数据
    if (data.fins_v2_groups && Array.isArray(data.fins_v2_groups)) {
      gridStore.groups = data.fins_v2_groups
    } else if (data.fins_groups) {
      // 可选：在这里做 V1 -> V2 的迁移逻辑，或者直接忽略
      toast.warning('Old backup format detected. Some data structure might vary.')
    }

    if (data.fins_v2_items && Array.isArray(data.fins_v2_items)) {
      gridStore.items = data.fins_v2_items
    }

    if (data.fins_current_group_id) {
      gridStore.setCurrentGroup(data.fins_current_group_id) 
    }
  }

  // =========================================================================
  // Actions: 云同步逻辑 (LZ-String)
  // =========================================================================

  const pushToCloud = async () => {
    const isConfirmed = await confirmStore.show({
      title: 'Overwrite Cloud Data?',
      content: 'Overwrite cloud data with local data?',
      confirmText: 'Confirm',
      isDanger: false,
    })

    if (!isConfirmed) return

    try {
      const data = getFullData()
      const jsonString = JSON.stringify(data)
      const compressed = LZString.compressToUTF16(jsonString)

      await storage.clear('sync')
      await storage.set({ fins_compressed_data: compressed }, 'sync')

      await updateSyncUsage()
      toast.success(`Upload Success!`)
    } catch (e) {
      console.error(e)
      toast.warning('Upload failed. Data might be too large.')
    }
  }

  const pullFromCloud = async () => {
    const isConfirmed = await confirmStore.show({
      title: 'Overwrite Local Data?',
      content: 'Overwrite local data with cloud data?',
      confirmText: 'Confirm',
      isDanger: false,
    })

    if (!isConfirmed) return

    try {
      const result = await storage.get(null, 'sync')

      if (!result || Object.keys(result).length === 0) {
        toast.info('Cloud storage is empty.')
        return
      }

      let data = null

      if (result['fins_compressed_data']) {
        const decompressed = LZString.decompressFromUTF16(result['fins_compressed_data'])
        if (decompressed) data = JSON.parse(decompressed)
      } else {
        // 尝试直接读取散列数据 (兼容旧版或者未压缩的情况)
        data = result
      }

      if (!data) {
        toast.error('Unknown data format in cloud.')
        return
      }

      restoreFullData(data)
      toast.success('Download Success!')
    } catch (e) {
      console.error(e)
      toast.error('Download failed.')
    }
  }

  const clearCloudData = async () => {
    const isConfirmed = await confirmStore.show({
      title: 'Clear Cloud Data?',
      content: 'Permanently delete cloud data?',
      confirmText: 'Delete',
      isDanger: true,
    })

    if (!isConfirmed) return

    try {
      await storage.clear('sync')
      await updateSyncUsage()
      toast.success('Cloud storage cleared.')
    } catch (e) {
      console.error(e)
      toast.error('Failed to clear cloud storage.')
    }
  }

  // =========================================================================
  // Actions: 文件备份 (Import / Export)
  // =========================================================================

  const exportData = () => {
    const data = getFullData()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().slice(0, 10)
    a.download = `fins_backup_${date}.json`
    a.click()

    URL.revokeObjectURL(url)
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string
        const data = JSON.parse(json)

        // 简单校验
        if (!data.fins_v2_items && !data.fins_links && !data.version) {
          toast.error('Invalid Fins backup file.')
          return
        }

        const isConfirmed = await confirmStore.show({
          title: 'Restore Data?',
          content: 'Restore data from file? Current data will be overwritten.',
          confirmText: 'Confirm',
          isDanger: false,
        })

        if (isConfirmed) {
          restoreFullData(data)
          toast.success('Import Success!')
        }
      } catch (e) {
        console.error(e)
        toast.error('Failed to parse JSON file.')
      }
    }
    reader.readAsText(file)
  }

  // =========================================================================
  // Watchers
  // =========================================================================

  watch(
    [title, bgMode, customBgUrl, searchEngines, currentEngineIndex, syncEnabled],
    async () => {
      if (!initialized.value) return

      const localData = {
        fins_title: title.value,
        fins_bg_mode: bgMode.value,
        fins_custom_bg_url: customBgUrl.value,
        fins_search_engines: JSON.parse(JSON.stringify(searchEngines.value)),
        fins_current_engine_index: currentEngineIndex.value,
        fins_sync_enabled: syncEnabled.value,
      }
      storage.set(localData, 'local')
    },
    { deep: true }
  )

  return {
    title,
    bgMode,
    customBgUrl,
    searchEngines,
    currentEngineIndex,
    syncEnabled,
    syncUsage,
    syncQuota,
    initialized,
    init,
    setTitle,
    setBgMode,
    setCustomBgUrl,
    addEngine,
    removeEngine,
    updateEngine,
    setCurrentEngine,
    pushToCloud,
    pullFromCloud,
    clearCloudData,
    updateSyncUsage,
    exportData,
    importData,
  }
})
