<template>
  <div class="sidebar-container">
    <draggable v-model="draggableGroups" item-key="id" :animation="200" ghost-class="ghost-item" class="group-list">
      <template #item="{ element: group }">
        <div
          class="sidebar-item"
          :class="{ active: currentGroupId === group.id }"
          @click="handleGroupClick(group.id)"
          @contextmenu.prevent="handleContextMenu($event, group)"
          :title="group.name">
          <i :class="group.icon"></i>
          <div class="tooltip">{{ group.name }}</div>
        </div>
      </template>
    </draggable>

    <div class="divider"></div>

    <div class="sidebar-item add-btn" @click="showModal = true" title="Add Group">
      <i class="ri-add-line"></i>
    </div>
  </div>

  <GroupModal :visible="showModal" @close="showModal = false" @save="saveGroup" />
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import draggable from 'vuedraggable'
  // 核心变更：引入新的 Store 和 Type
  import { useGridStore, type Group } from '@/store/useGridStore'
  import { useConfirmStore } from '@/store/useConfirmStore'
  import GroupModal from './GroupModal.vue'

  const store = useGridStore()
  const { groups, currentGroupId } = storeToRefs(store)
  const showModal = ref(false)
  const confirmStore = useConfirmStore()

  // 这里的逻辑和之前一样，只是底层数据源变了
  const draggableGroups = computed({
    get: () => groups.value,
    set: (val) => store.reorderGroups(val),
  })

  const handleGroupClick = (id: string) => {
    store.setCurrentGroup(id)
  }

  const saveGroup = (groupData: any) => {
    store.addGroup(groupData)
    showModal.value = false
  }

  const handleContextMenu = async (_e: MouseEvent, group: Group) => {
    if (group.isDefault) return

    const ok = await confirmStore.show({
      title: 'Delete Group',
      content: `Delete "${group.name}"? Widgets inside will be removed.`, // 提示语微调
      confirmText: 'Delete',
      isDanger: true,
    })

    if (ok) {
      store.removeGroup(group.id)
    }
  }
</script>

<style lang="less" scoped>
  /* 样式完全复用，无需改动 */
  .sidebar-container {
    position: fixed;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 50;

    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 8px;

    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 99px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    .group-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 4px 8px;
    }

    .sidebar-item {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.5);
      font-size: 20px;
      transition: all 0.2s ease;

      i {
        transition: transform 0.3s;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        i {
          transform: scale(1.1);
        }
        .tooltip {
          opacity: 1;
          transform: translateX(0);
        }
      }

      &.active {
        background: #fff !important;
        color: #000 !important;
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
        i {
          transform: scale(1);
        }
        .tooltip {
          display: none;
        }
      }

      &.add-btn {
        border: 1px dashed rgba(255, 255, 255, 0.2);
        &:hover {
          border-color: rgba(255, 255, 255, 0.6);
        }
      }

      .tooltip {
        position: absolute;
        left: 60px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        color: #fff;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.2s;
        border: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 60;
      }
    }

    :deep(.ghost-item) {
      opacity: 0.5;
      background: rgba(255, 255, 255, 0.1);
      border: 1px dashed rgba(255, 255, 255, 0.5);
      i {
        opacity: 0;
      }
    }
  }
</style>
