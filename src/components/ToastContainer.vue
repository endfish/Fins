<template>
  <div class="toast-container">
    <TransitionGroup name="toast-pop">
      <div v-for="toast in store.toasts" :key="toast.id" class="toast-item glass-panel" :class="toast.type" @click="store.remove(toast.id)">
        <i :class="getIcon(toast.type)"></i>
        <span class="message">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
  import { useToastStore, type ToastType } from '@/store/useToastStore'
  const store = useToastStore()

  // 根据类型返回图标
  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'ri-checkbox-circle-fill'
      case 'error':
        return 'ri-close-circle-fill'
      case 'warning':
        return 'ri-error-warning-fill'
      default:
        return 'ri-information-fill'
    }
  }
</script>

<style lang="less" scoped>
  .toast-container {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999; // 永远在最顶层
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none; // 容器穿透点击，只让里面的 Item 响应
    align-items: center;
  }

  .toast-item {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    border-radius: 99px; // 胶囊形状

    // 深色玻璃质感
    background: rgba(20, 20, 25, 0.75);
    backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1);

    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    user-select: none;

    // 图标颜色定义
    &.success i {
      color: #4ade80;
    } // Green
    &.error i {
      color: #ff5050;
    } // Red
    &.warning i {
      color: #ffcc00;
    } // Yellow
    &.info i {
      color: #2997ff;
    } // Blue

    i {
      font-size: 18px;
    }
  }

  // 极客弹跳动画 (Pop-in)
  .toast-pop-enter-active,
  .toast-pop-leave-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .toast-pop-enter-from,
  .toast-pop-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
</style>
