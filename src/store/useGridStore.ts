import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storage } from '../utils/storage'
import { useSettingStore } from './useSettingStore'

// --- 类型定义 ---

export interface Group {
  id: string
  name: string
  icon: string
  isDefault?: boolean
}

// 核心：通用组件数据结构
export interface GridItem {
  id: string
  groupId: string
  type: string // 组件类型，例如 'link-card', 'clock-card'
  size: '1x1' | '2x1' | '2x2' | '4x2' // 尺寸定义
  // 核心：泛型属性，存放具体组件的数据 (如 url, name, timezone 等)
  props: Record<string, any>
}

export const useGridStore = defineStore('grid', () => {
  const items = ref<GridItem[]>([])
  const groups = ref<Group[]>([])
  const currentGroupId = ref<string>('default_home')
  const initialized = ref(false)
  const settingStore = useSettingStore()

  // --- 初始化逻辑 ---
  const init = async () => {
    if (initialized.value) return

    // 1. 加载 Groups (沿用原有逻辑，但 Key 建议换新以隔离旧版本)
    const groupRes = await storage.get('fins_v2_groups')
    let loadedGroups = groupRes?.['fins_v2_groups']

    if (loadedGroups && Array.isArray(loadedGroups) && loadedGroups.length > 0) {
      groups.value = loadedGroups
    } else {
      // 默认分组
      groups.value = [
        { id: 'default_home', name: 'Home', icon: 'ri-home-4-line', isDefault: true },
        { id: 'default_work', name: 'Work', icon: 'ri-briefcase-4-line', isDefault: false },
      ]
    }

    // 2. 加载 Items
    const itemRes = await storage.get('fins_v2_items')
    let loadedItems = itemRes?.['fins_v2_items']

    if (loadedItems && Array.isArray(loadedItems)) {
      items.value = loadedItems
    } else {
      // 默认组件：几个 LinkWidget
      items.value = [
        {
          id: '1',
          groupId: 'default_home',
          type: 'link-card',
          size: '1x1',
          props: { name: 'GitHub', url: 'https://github.com', iconType: 'remix', iconValue: 'ri-github-fill', bgColor: 'rgba(0,0,0,0.5)' },
        },
        {
          id: '2',
          groupId: 'default_home',
          type: 'link-card',
          size: '1x1',
          props: { name: 'YouTube', url: 'https://youtube.com', iconType: 'remix', iconValue: 'ri-youtube-fill', bgColor: 'rgba(255,0,0,0.4)' },
        },
        {
          id: '3',
          groupId: 'default_home',
          type: 'link-card',
          size: '1x1',
          props: { name: 'Fins Repo', url: 'https://github.com', iconType: 'text', iconValue: 'FN', bgColor: 'rgba(41, 151, 255, 0.5)' },
        },
      ]
    }

    // 恢复上次选中的分组
    const lastGroup = await storage.get('fins_current_group_id')
    if (lastGroup?.['fins_current_group_id']) {
      if (groups.value.find((g) => g.id === lastGroup['fins_current_group_id'])) {
        currentGroupId.value = lastGroup['fins_current_group_id']
      }
    }

    initialized.value = true
  }

  // --- Getters ---
  const currentItems = computed(() => {
    return items.value.filter((i) => i.groupId === currentGroupId.value)
  })

  // --- Actions (通用 CRUD) ---

  const setCurrentGroup = (id: string) => {
    currentGroupId.value = id
    storage.set({ fins_current_group_id: id })
  }

  // 添加组件 (如果不传 id，自动生成)
  const addItem = (item: Omit<GridItem, 'id' | 'groupId'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6)
    items.value.push({ ...item, id, groupId: currentGroupId.value })
  }

  const removeItem = (id: string) => {
    items.value = items.value.filter((i) => i.id !== id)
  }

  // 通用更新：只更新 props 或 size
  const updateItem = (id: string, updates: Partial<GridItem>) => {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx !== -1) {
      // 深度合并 props，防止覆盖未传的属性
      const oldItem = items.value[idx]
      items.value[idx] = {
        ...oldItem,
        ...updates,
        props: { ...oldItem.props, ...(updates.props || {}) },
      }
    }
  }

  // 分组操作 (简化版，逻辑与 v1 类似)
  const addGroup = (group: Omit<Group, 'id'>) => {
    const id = Date.now().toString()
    groups.value.push({ ...group, id })
  }

  const removeGroup = (id: string) => {
    const target = groups.value.find((g) => g.id === id)
    if (target?.isDefault) return
    groups.value = groups.value.filter((g) => g.id !== id)
    // 级联删除：该组下的所有组件也删除 (或移动到 Home，这里选直接删除更干净)
    items.value = items.value.filter((i) => i.groupId !== id)
    if (currentGroupId.value === id) setCurrentGroup('default_home')
  }

  const reorderGroups = (val: Group[]) => {
    groups.value = val
  }

  // 排序当前页面的 items
  const reorderCurrentItems = (sortedItems: GridItem[]) => {
    const otherItems = items.value.filter((i) => i.groupId !== currentGroupId.value)
    items.value = [...otherItems, ...sortedItems]
  }

  // --- Watchers (持久化) ---
  watch(
    items,
    async (newVal) => {
      if (!initialized.value) return
      const data = JSON.parse(JSON.stringify(newVal))
      storage.set({ fins_v2_items: data }, 'local')
      if (settingStore.syncEnabled) {
        await storage.set({ fins_v2_items: data }, 'sync')
        settingStore.updateSyncUsage()
      }
    },
    { deep: true }
  )

  watch(
    groups,
    async (newVal) => {
      if (!initialized.value) return
      const data = JSON.parse(JSON.stringify(newVal))
      storage.set({ fins_v2_groups: data }, 'local')
      if (settingStore.syncEnabled) {
        await storage.set({ fins_v2_groups: data }, 'sync')
        settingStore.updateSyncUsage()
      }
    },
    { deep: true }
  )

  return {
    items,
    groups,
    currentGroupId,
    currentItems,
    initialized,
    init,
    setCurrentGroup,
    addItem,
    removeItem,
    updateItem,
    addGroup,
    removeGroup,
    reorderGroups,
    reorderCurrentItems,
  }
})
