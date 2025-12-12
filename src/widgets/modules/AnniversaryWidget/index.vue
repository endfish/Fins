<template>
  <div class="anniversary-wrapper" @contextmenu.prevent>
    <WidgetShell :size="item.size">
      <div class="bg-layer" :style="bgStyle">
        <div class="mask"></div>
      </div>

      <div class="content-layer">
        <div class="header">
          <span class="icon" v-if="days >= 0"><i class="ri-calendar-check-line"></i></span>
          <span class="icon" v-else><i class="ri-timer-flash-line"></i></span>
          <span class="title">{{ title }}</span>
        </div>

        <div class="main-count">
          <span class="number">{{ formatNumber(Math.abs(days)) }}</span>
          <span class="unit">{{ days >= 0 ? t('anniversary_days_since') : t('anniversary_days_left') }}</span>
        </div>

        <div class="footer-date">
          <i class="ri-calendar-event-line"></i>
          {{ formattedDate }}
        </div>
      </div>
    </WidgetShell>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import WidgetShell from '@/widgets/base/WidgetShell.vue'
  import type { GridItem } from '@/store/useGridStore'
  import { formatNumber } from '@/utils/format'
  import { resolveWallpaperUrl } from '@/utils/wallpapers'
  import { t } from '@/utils/i18n'

  const props = defineProps<{
    item: GridItem
  }>()

  const widgetProps = computed(() => props.item.props || {})

  // 1. 标题
  const title = computed(() => widgetProps.value.title || 'Anniversary')

  // 2. 日期计算
  const targetDateStr = computed(() => widgetProps.value.date || new Date().toISOString().split('T')[0])

  const days = computed(() => {
    const target = new Date(targetDateStr.value).setHours(0, 0, 0, 0)
    const now = new Date().setHours(0, 0, 0, 0)
    const diff = now - target
    // 向上取整，算出天数差
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  })

  const formattedDate = computed(() => {
    return new Date(targetDateStr.value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // 3. 背景样式处理
  const bgStyle = computed(() => {
    const url = widgetProps.value.bgUrl
    const color = widgetProps.value.bgColor || '#333' // 默认兜底色
    const rawUrl = widgetProps.value.bgUrl
    const resolvedUrl = resolveWallpaperUrl(rawUrl)

    if (url) {
      return {
        backgroundImage: `url(${resolvedUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    } else {
      // 如果没有图，给一个漂亮的渐变兜底，或者用户选的纯色
      return {
        backgroundColor: color,
        // 如果用户选的是半透明色，这里叠加一个渐变增加质感
        backgroundImage: `linear-gradient(135deg, ${color} 0%, rgba(0,0,0,0.8) 100%)`,
      }
    }
  })
</script>

<style lang="less" scoped>
  .anniversary-wrapper {
    width: 100%;
    height: 100%;
    color: #fff;
    user-select: none;

    .bg-layer {
      position: absolute;
      inset: 0;
      z-index: 0;
      transition: all 0.5s ease;

      .mask {
        position: absolute;
        inset: 0;
        // 渐变遮罩：左下角深，右上角浅，保证左侧文字清晰
        background: linear-gradient(to top right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
      }
    }

    // Hover 效果：背景轻微放大
    &:hover .bg-layer {
      transform: scale(1.05);
    }

    .content-layer {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;

      // 文字阴影，增强在图片上的可读性
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0.9;

        .icon {
          font-size: 16px;
          color: #4ade80; // 极客绿点缀
        }
        .title {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      }

      .main-count {
        margin-top: auto; // 挤到底部
        margin-bottom: 20px;
        line-height: 1;

        .number {
          font-size: 60px; // 超大数字
          font-weight: 300;
          letter-spacing: -2px;
          display: block;
          margin-bottom: 10px;
        }
        .unit {
          font-size: 14px;
          font-weight: 400;
          opacity: 0.7;
          margin-left: 4px;
        }
      }

      .footer-date {
        font-size: 12px;
        font-family: monospace; // 极客感
        opacity: 0.5;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 8px;
        width: 100%;
      }
    }
  }
</style>
