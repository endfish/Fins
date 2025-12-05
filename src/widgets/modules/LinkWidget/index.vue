<template>
  <div class="link-widget-wrapper" @click="openLink" @contextmenu.prevent>
    <WidgetShell :size="item.size" class="icon-shell">
      <div class="link-content" :style="{ backgroundColor: bgColor }">
        <div class="icon-layer">
          <img v-if="props.iconType === 'api'" :src="apiIconUrl" class="icon-img" loading="lazy" />
          <i v-else-if="props.iconType === 'remix'" :class="props.iconValue" class="icon-font"></i>
          <span v-else class="icon-text">{{ (props.iconValue || '').slice(0, 2).toUpperCase() }}</span>
        </div>
      </div>
    </WidgetShell>

    <span class="app-name">{{ props.name }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import WidgetShell from '@/widgets/base/WidgetShell.vue'
  import type { GridItem } from '@/store/useGridStore'

  const { item } = defineProps<{
    item: GridItem
  }>()

  const props = computed(() => item.props || {})
  const bgColor = computed(() => props.value.bgColor || 'rgba(255,255,255,0.1)')

  const apiIconUrl = computed(() => {
    try {
      const domain = new URL(props.value.url).hostname
      return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
    } catch {
      return ''
    }
  })

  const openLink = () => {
    const url = props.value.url
    if (!url) return
    // @ts-ignore
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      // @ts-ignore
      chrome.tabs.create({ url, active: true })
    } else {
      window.open(url, '_blank')
    }
  }
</script>

<style lang="less" scoped>
  .link-widget-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px; // 图标与文字的间距
    cursor: pointer;
    width: 90px; // 限制宽度，确保文字截断生效

    // 核心交互：Hover 整个组件时，触发内部图标的动效
    &:hover {
      .icon-shell {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        z-index: 2;
      }

      .app-name {
        color: #fff;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
      }
    }
  }

  // 对 WidgetShell 的样式微调（作为子组件时）
  :deep(.icon-shell) {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    // 移除 WidgetShell 自身的 hover 效果，交由父级 .link-widget-wrapper 控制
    // 这样避免只有鼠标指在图标上才放大的割裂感
    &:hover {
      transform: none;
    }
  }

  .link-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-layer {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .icon-img {
        width: 44px; // 稍微调大一点图标
        height: 44px;
        border-radius: 10px;
        object-fit: contain;
      }
      .icon-font {
        font-size: 40px;
        color: rgba(255, 255, 255, 0.95);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }
      .icon-text {
        font-size: 28px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.95);
        font-family: 'Inter', sans-serif;
        letter-spacing: 1px;
      }
    }
  }

  .app-name {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); // 增加阴影，防止壁纸太亮看不清
    text-align: center;

    // 文字截断三件套
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    letter-spacing: 0.3px;
    transition: all 0.3s;
  }
</style>
