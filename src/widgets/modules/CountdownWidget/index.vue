<template>
  <div class="countdown-wrapper" @contextmenu.prevent>
    <WidgetShell :size="item.size">
      <div class="bg-layer" :style="bgStyle">
        <div class="mask"></div>
      </div>

      <div class="content-layer">
        <div class="header">
          <span class="title">{{ title }}</span>
          <span class="cycle-badge" v-if="cycleLabel">{{ cycleLabel }}</span>
        </div>

        <div class="main-count">
          <span class="number">{{ formatNumber(diffDays) }}</span>
          <span class="label">{{ t('countdown_days_left') }}</span>
        </div>

        <div class="footer">
          <div class="target-date">
            <i class="ri-calendar-event-line"></i>
            {{ formattedNextDate }}
          </div>
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

  // --- 数据获取 ---
  const title = computed(() => widgetProps.value.title || 'Countdown')
  const baseDateStr = computed(() => widgetProps.value.date || new Date().toISOString().split('T')[0])
  const recurrence = computed(() => widgetProps.value.recurrence || 'none') // 'none', 'weekly', 'monthly', 'yearly'

  // --- 核心：周期计算逻辑 ---
  const nextTargetDate = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 解析用户设定的基准日期
    // 注意：直接 new Date('2023-04-26') 可能会有少许时区偏差，最好显式解析
    const [y, m, d] = baseDateStr.value.split('-').map(Number)
    // 构造基准日期对象 (月份需 -1)
    const base = new Date(y, m - 1, d)
    base.setHours(0, 0, 0, 0)

    if (recurrence.value === 'none') {
      return base
    }

    // 如果基准日期在未来，且有循环，我们也先以基准日期为准。
    // 只有当基准日期已经是“过去”时，才计算下一个循环。
    if (base >= today) {
      return base
    }

    // --- 计算下一个循环 ---
    const next = new Date(base)

    if (recurrence.value === 'weekly') {
      // 算出今天是周几(0-6)，目标是周几
      // 简单粗暴法：不断 +7 天直到 > today
      // 优化算法：计算差值
      const dayDiff = Math.ceil((today.getTime() - base.getTime()) / (1000 * 60 * 60 * 24))
      const weeksPassed = Math.floor(dayDiff / 7)
      next.setDate(base.getDate() + weeksPassed * 7)
      // 如果还没到今天，就再加一周
      if (next < today) {
        next.setDate(next.getDate() + 7)
      }
    } else if (recurrence.value === 'monthly') {
      // 设置为今年的当前月份，保留基准日期的“日”
      next.setFullYear(today.getFullYear())
      next.setMonth(today.getMonth())

      // 如果这个日期已经过去了（比如今天是15号，目标是5号），就推到下个月
      if (next < today) {
        next.setMonth(next.getMonth() + 1)
      }
      // 边缘情况处理：如果目标是31号，但下个月只有30天，Date会自动顺延到下下月1号
      // 这里为了简单，我们接受 Date 的默认行为（或者你可以做更复杂的校正）
    } else if (recurrence.value === 'yearly') {
      next.setFullYear(today.getFullYear())
      if (next < today) {
        next.setFullYear(next.getFullYear() + 1)
      }
    }

    return next
  })

  // --- 倒计时天数 ---
  const diffDays = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const target = nextTargetDate.value
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  // --- 格式化显示 ---
  const formattedNextDate = computed(() => {
    return nextTargetDate.value.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  })

  const cycleLabel = computed(() => {
    const map: Record<string, string> = {
      weekly: t('cycle_weekly'),
      monthly: t('cycle_monthly'),
      yearly: t('cycle_yearly'),
    }
    return map[recurrence.value]
  })

  // --- 样式 ---
  const bgStyle = computed(() => {
    const rawUrl = widgetProps.value.bgUrl
    const color = widgetProps.value.bgColor || '#4A90E2' // 默认极客蓝
    const resolvedUrl = resolveWallpaperUrl(rawUrl)

    if (resolvedUrl) {
      return {
        backgroundImage: `url(${resolvedUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    } else {
      return {
        backgroundColor: color,
        backgroundImage: `linear-gradient(160deg, ${color} 0%, #000 120%)`,
      }
    }
  })
</script>

<style lang="less" scoped>
  .countdown-wrapper {
    width: 100%;
    height: 100%;
    color: #fff;
    user-select: none;

    .bg-layer {
      position: absolute;
      inset: 0;
      z-index: 0;
      transition: transform 0.5s ease;
      .mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.3); // 稍微暗一点，突显文字
        backdrop-filter: blur(0px); // 可选：如果想要背景模糊
        transition: background 0.3s;
      }
    }

    &:hover .bg-layer {
      transform: scale(1.05);
      .mask {
        background: rgba(0, 0, 0, 0.4);
      }
    }

    .content-layer {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);

      .header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%;
        }
        .cycle-badge {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
      }

      .main-count {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 4px;

        .number {
          font-size: 56px; // 2x2 卡片比较紧凑，字体稍微控制一下
          font-weight: 300;
          line-height: 1;
          letter-spacing: -2px;
        }
        .label {
          font-size: 12px;
          opacity: 0.8;
          text-transform: uppercase;
          margin-top: 4px;
          letter-spacing: 1px;
        }
      }

      .footer {
        width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 10px;
        display: flex;
        justify-content: center;

        .target-date {
          font-size: 12px;
          font-family: monospace;
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }
  }
</style>
