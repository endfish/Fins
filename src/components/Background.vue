<template>
  <div class="bg-wrapper">
    <div class="bg-layer" :style="{ backgroundImage: `url(${currentBgUrl})` }" :class="{ 'is-loaded': loaded }"></div>

    <div class="mask-layer"></div>

    <div class="copyright" v-if="loaded && settingStore.bgMode === 'bing' && copyright"><i class="ri-map-pin-2-line"></i> {{ copyright }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue'
  import { storage } from '@/utils/storage.ts'
  import { useSettingStore } from '@/store/useSettingStore'

  const settingStore = useSettingStore()

  // --- 状态 ---
  const bingBgUrl = ref('')
  const copyright = ref('')
  const loaded = ref(false)

  // --- 计算属性：最终决定显示哪张图 ---
  const currentBgUrl = computed(() => {
    if (settingStore.bgMode === 'custom') {
      return settingStore.customBgUrl || '' // 如果用户没填，就是空的（黑背景）
    }
    return bingBgUrl.value
  })

  // --- 逻辑 ---

  // 1. 加载 Bing 壁纸 (复用原有逻辑)
  const loadBingWallpaper = async () => {
    // ... (保留你原有的缓存和 Fetch 逻辑，此处省略重复代码，只写关键变动) ...
    // ... 原有逻辑 ...
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = 'fins_wallpaper_cache'

    // 简写：读缓存
    const cached = await storage.get(cacheKey)
    const data = cached[cacheKey]
    if (data && data.date === today) {
      bingBgUrl.value = data.url
      copyright.value = data.copyright
      loaded.value = true
      return
    }

    // 请求 API
    try {
      const res = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
      const json = await res.json()
      const image = json.images[0]
      const fullUrl = `https://www.bing.com${image.url}`

      bingBgUrl.value = fullUrl
      copyright.value = image.copyright
      loaded.value = true

      storage.set({ [cacheKey]: { date: today, url: fullUrl, copyright: image.copyright } })
    } catch (e) {
      console.error(e)
    }
  }

  // 2. 监听模式变化，处理 loaded 状态
  // 当从 bing 切到 custom 时，如果 custom 链接有效，也应该视为 loaded
  watch(
    () => settingStore.bgMode,
    (mode) => {
      if (mode === 'custom') {
        // 简单处理：只要切到 custom，就认为“显示中”，因为可能是纯色或用户正在输入
        loaded.value = true
      } else {
        // 切回 bing，如果 bing 还没加载好，可能需要重新 load
        if (!bingBgUrl.value) loadBingWallpaper()
      }
    }
  )

  onMounted(() => {
    loadBingWallpaper()
  })
</script>

<style lang="less" scoped>
  // 样式保持不变，复用原来的即可
  .bg-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: #0f0f11;

    .bg-layer {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 0.8s ease-in-out;
      transform: scale(1.05);
      transition: transform 10s ease, opacity 0.8s ease;

      &.is-loaded {
        opacity: 1;
        transform: scale(1);
      }
    }

    .mask-layer {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1;
    }

    .copyright {
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 2;
      // ... 样式不变
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: default;
      &:hover {
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
      }
    }
  }
</style>
