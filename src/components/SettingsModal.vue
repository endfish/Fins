<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="settings-card glass-panel">
      <div class="sidebar">
        <div class="nav-title">Settings</div>

        <div class="nav-item" :class="{ active: currentTab === 'general' }" @click="currentTab = 'general'"><i class="ri-settings-4-line"></i> General</div>

        <div class="nav-item" :class="{ active: currentTab === 'sync' }" @click="currentTab = 'sync'"><i class="ri-cloud-line"></i> Sync</div>

        <div class="nav-item" :class="{ active: currentTab === 'about' }" @click="currentTab = 'about'"><i class="ri-information-line"></i> About</div>
      </div>

      <div class="content-area custom-scrollbar">
        <KeepAlive>
          <component :is="activeComponent" />
        </KeepAlive>
      </div>

      <button class="close-btn" @click="emit('close')">
        <i class="ri-close-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  // 引入拆分后的组件
  import GeneralTab from './settings/GeneralTab.vue'
  import SyncTab from './settings/SyncTab.vue'
  import AboutTab from './settings/AboutTab.vue'

  defineProps<{
    visible: boolean
  }>()

  const emit = defineEmits(['close'])

  const currentTab = ref('general')

  // 动态切换组件
  const activeComponent = computed(() => {
    switch (currentTab.value) {
      case 'general':
        return GeneralTab
      case 'sync':
        return SyncTab
      case 'about':
        return AboutTab
      default:
        return GeneralTab
    }
  })
</script>

<style lang="less" scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 900;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade-in 0.3s;
  }

  .settings-card {
    width: 700px;
    height: 500px;
    display: flex;
    background: rgba(30, 30, 35, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    position: relative;
    color: #fff;
    animation: zoom-in 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }

  // 左侧边栏
  .sidebar {
    width: 200px;
    background: rgba(0, 0, 0, 0.2);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .nav-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 12px;
      padding-left: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.2s;
      font-size: 14px;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }
      &.active {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-weight: 500;
      }
      i {
        font-size: 18px;
      }
    }
  }

  // 右侧容器
  .content-area {
    flex: 1;
    padding: 32px 40px;
    overflow-y: auto;
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: all 0.2s;
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes zoom-in {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
