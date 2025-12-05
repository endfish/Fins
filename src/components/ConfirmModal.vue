<template>
  <Transition name="fade">
    <div class="confirm-overlay" v-if="store.visible" @click.self="store.handleCancel">
      <div class="confirm-card glass-panel">
        <div class="content-box">
          <h3 class="title">{{ store.state.title }}</h3>
          <p class="message">{{ store.state.content }}</p>
        </div>

        <div class="action-row">
          <button class="btn cancel" @click="store.handleCancel">
            {{ store.state.cancelText }}
          </button>

          <div class="divider-v"></div>

          <button class="btn confirm" :class="{ danger: store.state.isDanger }" @click="store.handleConfirm">
            {{ store.state.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { useConfirmStore } from '@/store/useConfirmStore'
  const store = useConfirmStore()
</script>

<style lang="less" scoped>
  .confirm-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .confirm-card {
    width: 320px;
    background: rgba(30, 30, 35, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    animation: zoom-in 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

    .content-box {
      padding: 24px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }
      .message {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .action-row {
      display: flex;
      height: 48px; // iOS 标准高度

      .btn {
        flex: 1;
        background: transparent;
        border: none;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
        height: 100%;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        &:active {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .cancel {
        color: rgba(255, 255, 255, 0.6);
        font-weight: 400;
      }

      .confirm {
        color: #2997ff; // iOS Blue
        font-weight: 600;

        &.danger {
          color: #ff3b30; // iOS Red
        }
      }

      .divider-v {
        width: 1px;
        background: rgba(255, 255, 255, 0.1);
        height: 100%;
      }
    }
  }

  // 动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  @keyframes zoom-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
