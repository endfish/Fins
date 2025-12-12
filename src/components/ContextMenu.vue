<template>
  <Transition name="menu-scale">
    <div v-if="visible" class="context-menu glass-panel" :style="{ top: `${y}px`, left: `${x}px` }" @contextmenu.prevent>
      
      <template v-if="hasTarget">
        <div class="menu-item" @click="emit('edit')">
          <i class="ri-edit-line"></i>
          <span>{{ t('common_edit') }}</span>
        </div>

        <div class="divider"></div>

        <div class="menu-item danger" @click="emit('delete')">
          <i class="ri-delete-bin-line"></i>
          <span>{{ t('common_delete') }}</span>
        </div>
      </template>

      <template v-else>
        <div class="menu-item" @click="emit('add-link')">
          <i class="ri-link"></i>
          <span>{{ t('ctx_add_link') }}</span>
        </div>
        <div class="menu-item" @click="emit('add-widget')">
          <i class="ri-apps-line"></i>
          <span>{{ t('ctx_add_widget') }}</span>
        </div>
      </template>

    </div>
  </Transition>

  <div v-if="visible" class="menu-overlay" @click="emit('close')" @contextmenu.prevent="emit('close')"></div>
</template>

<script setup lang="ts">
  import { t } from '@/utils/i18n'
  defineProps<{
    visible: boolean
    x: number
    y: number
    hasTarget: boolean // [!code ++] 新增属性：判断是否有目标
  }>()

  // [!code ++] 新增事件：add-link, add-widget
  const emit = defineEmits(['close', 'edit', 'delete', 'add-link', 'add-widget'])
</script>

<style lang="less" scoped>
  /* 样式保持不变 */
  .context-menu {
    position: fixed;
    z-index: 9999;
    width: 160px;
    background: rgba(30, 30, 35, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transform-origin: top left;

    .menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
      font-weight: 500;
      transition: all 0.1s;

      i {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.6);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        i {
          color: #fff;
        }
      }

      &.danger {
        color: #ff5050;
        i {
          color: #ff5050;
        }
        &:hover {
          background: rgba(255, 80, 80, 0.15);
        }
      }
    }

    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 4px 6px;
    }
  }

  .menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: transparent;
  }

  .menu-scale-enter-active,
  .menu-scale-leave-active {
    transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .menu-scale-enter-from,
  .menu-scale-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }
</style>