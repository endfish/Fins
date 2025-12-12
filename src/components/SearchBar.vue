<template>
  <div class="search-container" :class="{ 'is-focused': isFocused }">
    <div class="glass-shell">
      <button class="engine-switch" @click="toggleEngine" @contextmenu.prevent="openEngineSettings" :title="t('search_switch_tooltip')">
        <i :class="currentEngine?.icon"></i>
      </button>

      <input
        type="text"
        v-model="searchText"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown.enter="handleSearch"
        :placeholder="t('search_placeholder', [currentEngine?.name ?? '?'])"
        class="search-input" />

      <button class="search-btn" @click="handleSearch">
        <i class="ri-arrow-right-line"></i>
      </button>

      <div class="shine-effect"></div>
    </div>
  </div>

  <SearchEngineModal :visible="showSettings" @close="showSettings = false" />
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useSettingStore } from '@/store/useSettingStore'
  import SearchEngineModal from './SearchEngineModal.vue'
  import { t } from '@/utils/i18n'

  const store = useSettingStore()

  const searchText = ref('')
  const isFocused = ref(false)
  const showSettings = ref(false)

  // 计算当前引擎对象
  const currentEngine = computed(() => {
    const engines = store.searchEngines
    // 安全防御：防止 index 越界
    if (engines.length === 0) return { name: '?', icon: 'ri-search-line', url: '' }
    return engines[store.currentEngineIndex] || engines[0]
  })

  // 切换引擎
  const toggleEngine = () => {
    const nextIndex = (store.currentEngineIndex + 1) % store.searchEngines.length
    store.setCurrentEngine(nextIndex)
  }

  // 打开设置
  const openEngineSettings = () => {
    showSettings.value = true
  }

  const handleSearch = () => {
    if (!searchText.value.trim()) return
    const url = currentEngine.value?.url + encodeURIComponent(searchText.value)

    // 使用 location.href 在当前页打开 (符合 NewTab 习惯)
    window.location.href = url
  }
</script>

<style lang="less" scoped>
  /* 样式保持不变，完美复用之前的流光玻璃风格 */
  .search-container {
    width: 100%;
    max-width: 600px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform: scale(0.98);
    &.is-focused {
      transform: scale(1);
      .glass-shell {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      }
    }
  }

  .glass-shell {
    position: relative;
    display: flex;
    align-items: center;
    height: 56px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.1), inset 0 0 12px rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
    overflow: hidden;

    .engine-switch {
      width: 48px;
      height: 100%;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.2rem;
      cursor: pointer;
      transition: color 0.2s;
      padding-left: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        color: #fff;
      }
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      height: 100%;
      color: #fff;
      font-size: 1.1rem;
      padding: 0 12px;
      outline: none;
      font-weight: 300;
      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
    }

    .search-btn {
      width: 56px;
      height: 100%;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        color: #fff;
        transform: translateX(2px);
      }
    }

    .shine-effect {
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
      transform: skewX(-25deg);
      pointer-events: none;
      animation: shine 6s infinite;
    }
  }

  @keyframes shine {
    0% {
      left: -100%;
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    40% {
      left: 200%;
      opacity: 0;
    }
    100% {
      left: 200%;
      opacity: 0;
    }
  }
</style>
