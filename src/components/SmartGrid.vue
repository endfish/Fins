<template>
  <div class="smart-grid-container">
    <draggable v-model="draggableItems" item-key="id" :animation="300" ghost-class="ghost-widget" class="grid-layout" handle=".widget-shell">
      <template #item="{ element: item }">
        <component :is="getWidgetComponent(item.type)?.view" :item="item" @contextmenu="openItemContextMenu($event, item)" :class="`grid-item span-${item.size}`" />
      </template>

      <template #footer>
        <div class="add-btn grid-item span-1x1" @click="handleAddLinkDirectly" @contextmenu.prevent="showGallery = true">
          <i class="ri-add-line"></i>
        </div>
      </template>
    </draggable>

    <WidgetGalleryModal :visible="showGallery" @close="showGallery = false" @add="handleGallerySelect" />

    <component
      v-if="currentEditSession.visible"
      :is="currentEditSession.component"
      :visible="currentEditSession.visible"
      :editing-item="currentEditSession.data"
      @close="closeEditSession"
      @save="handleSaveItem"
      @delete="handleDeleteItem" />

    <ContextMenu
      :visible="menuState.visible"
      :x="menuState.x"
      :y="menuState.y"
      :has-target="!!menuState.targetItem"
      @close="closeContextMenu"
      @edit="handleMenuEdit"
      @delete="handleMenuDelete"
      @add-link="handleAddLinkDirectly"
      @add-widget="handleAddWidget" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, markRaw } from 'vue'
  import { storeToRefs } from 'pinia'
  import draggable from 'vuedraggable'
  import { useGridStore, type GridItem } from '@/store/useGridStore'
  import { useConfirmStore } from '@/store/useConfirmStore'
  import { useToastStore } from '@/store/useToastStore'
  import { t } from '@/utils/i18n'

  import ContextMenu from '@/components/ContextMenu.vue'
  import WidgetGalleryModal from '@/components/WidgetGalleryModal.vue'

  import LinkIndex from '@/widgets/modules/LinkWidget/index.vue'
  import LinkEdit from '@/widgets/modules/LinkWidget/edit.vue'
  import HitokotoIndex from '@/widgets/modules/HitokotoWidget/index.vue'
  import HitokotoEdit from '@/widgets/modules/HitokotoWidget/edit.vue'
  import AnniversaryIndex from '@/widgets/modules/AnniversaryWidget/index.vue'
  import AnniversaryEdit from '@/widgets/modules/AnniversaryWidget/edit.vue'
  import CountdownIndex from '@/widgets/modules/CountdownWidget/index.vue'
  import CountdownEdit from '@/widgets/modules/CountdownWidget/edit.vue'

  type WidgetDef = { view: any; edit: any; defaultSize: GridItem['size'] }

  // Requirement 1: Link Card 已经标准化，只是 Registry 中的一项
  const WIDGET_REGISTRY: Record<string, WidgetDef> = {
    'link-card': {
      view: LinkIndex,
      edit: LinkEdit,
      defaultSize: '1x1',
    },
    hitokoto: {
      view: HitokotoIndex,
      edit: HitokotoEdit,
      defaultSize: '3x2',
    },
    anniversary: {
      view: AnniversaryIndex,
      edit: AnniversaryEdit,
      defaultSize: '3x2', // 按照需求，默认 3x2
    },
    countdown: {
      view: CountdownIndex,
      edit: CountdownEdit,
      defaultSize: '2x2',
    },
  }

  const getWidgetComponent = (type: string) => {
    return WIDGET_REGISTRY[type] || WIDGET_REGISTRY['link-card']
  }

  const store = useGridStore()
  const confirmStore = useConfirmStore()
  const toast = useToastStore()
  const { currentItems } = storeToRefs(store)

  const draggableItems = computed({
    get: () => currentItems.value,
    set: (val) => store.reorderCurrentItems(val),
  })

  const showGallery = ref(false)

  const currentEditSession = reactive({
    visible: false,
    component: null as any,
    data: null as any,
    targetId: null as string | null,
    targetType: '' as string,
  })

  // --- 动作：通用打开编辑窗口 ---
  const openEditModal = (type: string, data: any = null, id: string | null = null) => {
    const def = WIDGET_REGISTRY[type]
    if (!def) {
      toast.error(t('toast_unknown_widget_type', [type]))
      return
    }

    currentEditSession.targetId = id
    currentEditSession.targetType = type
    currentEditSession.component = markRaw(def.edit)
    // 如果没有数据，传 null 让组件自己处理默认值
    currentEditSession.data = data ? JSON.parse(JSON.stringify(data)) : null
    currentEditSession.visible = true
  }

  const handleAddWidget = () => {
    showGallery.value = true
    closeContextMenu()
  }

  // --- 动作：新增流程 ---

  // 1. [Gallery] 选择了某种类型
  const handleGallerySelect = (type: string) => {
    openEditModal(type, null, null)
  }

  // 2. [Direct] 直接添加 Link (用于加号左键、背景右键)
  const handleAddLinkDirectly = () => {
    // 关闭菜单（如果是因为右键触发的）
    closeContextMenu()
    // 直接打开 Link 类型的编辑窗
    openEditModal('link-card', null, null)
  }

  // --- 动作：编辑流程 ---
  const handleMenuEdit = () => {
    if (!menuState.targetItem) return
    const item = menuState.targetItem

    // 把 size 混合进 props 传给 edit.vue
    const editData = { ...item.props, size: item.size }
    openEditModal(item.type, editData, item.id)
    closeContextMenu()
  }

  const handleSaveItem = (formData: any) => {
    const def = WIDGET_REGISTRY[currentEditSession.targetType]

    // 解构出 size (如果 edit 组件传了 size 字段)
    const { size, ...widgetProps } = formData

    // 如果是新增，必须有个尺寸；如果是编辑，formData 里没 size 就不更新
    const newSize = size || def?.defaultSize

    if (currentEditSession.targetId) {
      // Update
      const updates: any = { props: widgetProps }
      if (size) updates.size = size // 只有当明确传了 size 时才更新它

      store.updateItem(currentEditSession.targetId, updates)
      toast.success(t('toast_widget_updated'))
    } else {
      // Create
      store.addItem({
        type: currentEditSession.targetType,
        size: newSize,
        props: widgetProps,
      })
      toast.success(t('toast_widget_added'))
    }
    closeEditSession()
  }

  const handleDeleteItem = async () => {
    if (!currentEditSession.targetId) {
      closeEditSession()
      return
    }

    const ok = await confirmStore.show({
      title: t('confirm_delete_widget_title'),
      content: t('confirm_delete_widget_content'),
      confirmText: t('common_delete'),
      cancelText: t('common_cancel'),
      isDanger: true,
    })

    if (ok) {
      store.removeItem(currentEditSession.targetId)
      closeEditSession()
    }
  }

  const closeEditSession = () => {
    currentEditSession.visible = false
    setTimeout(() => {
      currentEditSession.component = null
      currentEditSession.data = null
    }, 300)
  }

  // --- 右键菜单逻辑 ---
  const menuState = reactive({
    visible: false,
    x: 0,
    y: 0,
    targetItem: null as GridItem | null,
  })

  // 场景 A: 右键点击了组件
  const openItemContextMenu = (e: MouseEvent, item: GridItem) => {
    // 阻止冒泡，防止触发背景右键
    e.stopPropagation()

    if (!WIDGET_REGISTRY[item.type]) return

    menuState.x = e.clientX
    menuState.y = e.clientY
    menuState.targetItem = item
    menuState.visible = true
  }

  // 场景 B: 右键点击了背景
  // const handleBackgroundContextMenu = (e: MouseEvent) => {
  //   menuState.x = e.clientX
  //   menuState.y = e.clientY
  //   // [!code ++] 关键：targetItem 设为 null，ContextMenu 组件会据此判断显示 "Add" 菜单
  //   menuState.targetItem = null
  //   menuState.visible = true
  // }

  const closeContextMenu = () => {
    menuState.visible = false
  }

  const handleMenuDelete = () => {
    if (menuState.targetItem) {
      const id = menuState.targetItem.id
      closeContextMenu()
      confirmStore
        .show({
          title: t('confirm_delete_widget_title'),
          content: t('confirm_remove_widget_content'),
          confirmText: t('common_remove'),
          cancelText: t('common_cancel'),
          isDanger: true,
        })
        .then((ok) => {
          if (ok) store.removeItem(id)
        })
    }
  }
</script>

<style lang="less" scoped>
  .smart-grid-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  /* 核心修改：切换为 CSS Grid 布局 */
  .grid-layout {
    display: grid;
    // 自动填充列，每列宽 80px
    grid-template-columns: repeat(auto-fill, 80px);
    // 固定行高 80px
    grid-auto-rows: 110px;
    // 间距 24px
    gap: 24px;

    justify-content: center;
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    padding-bottom: 80px;
  }

  /* 定义 Grid 跨度 (Spans) */
  .grid-item {
    // 默认 1x1
    grid-column-end: span 1;
    grid-row-end: span 1;

    &.span-1x1 {
      grid-column-end: span 1;
      grid-row-end: span 1;
    }
    &.span-2x1 {
      grid-column-end: span 2;
      grid-row-end: span 1;
    }
    &.span-2x2 {
      grid-column-end: span 2;
      grid-row-end: span 2;
    }
    &.span-3x2 {
      grid-column-end: span 3;
      grid-row-end: span 2;
    }
    &.span-4x2 {
      grid-column-end: span 4;
      grid-row-end: span 2;
    }
  }

  .add-btn {
    // 移除之前的固定 width/height，由 Grid 单元格决定大小
    width: 80px;
    height: 80px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.4);
    font-size: 32px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
      color: #fff;
      transform: scale(1.05);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  :deep(.ghost-widget) {
    opacity: 0.2;
    transform: scale(0.95);
    filter: grayscale(100%);
    border: 2px dashed rgba(255, 255, 255, 0.5);
    background: transparent;
    * {
      visibility: hidden;
    }
  }
</style>
