<template>
  <div class="fins-app">
    <svg style="display: none; width: 0; height: 0">
      <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lighting-color="white" result="specLight">
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="50" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>

    <ToastContainer />
    <ConfirmModal />
    <Background />
    <Sidebar />

    <main class="main-stage">
      <div class="brand">
        <span class="text">{{ settingStore.title }}</span>
      </div>

      <div class="search-wrapper">
        <SearchBar />
      </div>

      <div class="links-wrapper">
        <SmartGrid />
      </div>

      <div class="settings-trigger" @click="showSettings = true">
        <i class="ri-settings-3-line"></i>
      </div>

      <SettingsModal :visible="showSettings" @close="showSettings = false" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Background from './components/Background.vue'
  import SearchBar from './components/SearchBar.vue'
  import Sidebar from './components/Sidebar.vue'
  import SettingsModal from './components/SettingsModal.vue'
  import ToastContainer from './components/ToastContainer.vue'
  import ConfirmModal from './components/ConfirmModal.vue'
  import SmartGrid from './components/SmartGrid.vue'
  import { useGridStore } from '@/store/useGridStore'
  import { useSettingStore } from '@/store/useSettingStore'

  const gridStore = useGridStore()
  const settingStore = useSettingStore()
  const showSettings = ref(false)

  onMounted(() => {
    gridStore.init()
    settingStore.init()
  })
</script>

<style lang="less" scoped>
  /* 样式保持不变 */
  .fins-app {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .main-stage {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5vh;
      padding-bottom: 5vh;

      .brand {
        color: #fff;
        font-size: 3rem;
        font-weight: 200;
        letter-spacing: 2px;
        display: flex;
        align-items: center;
        gap: 12px;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        user-select: none;
        animation: fade-down 0.8s ease-out;
      }

      .search-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 0 20px;
        animation: fade-down 0.8s ease-out 0.1s backwards;
      }

      .links-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        animation: fade-up 0.8s ease-out 0.2s backwards;
      }
    }

    .settings-trigger {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 50;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all 0.3s;
      font-size: 18px;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        transform: rotate(90deg);
      }
    }
  }

  @keyframes fade-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
