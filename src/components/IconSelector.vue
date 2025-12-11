<template>
  <div class="icon-selector">
    <div class="toolbar">
      <div class="search-box">
        <i class="ri-search-line search-icon"></i>
        <input v-model="searchQuery" placeholder="Search icons & brands..." class="search-input" autofocus />
        <i v-if="searchQuery" class="ri-close-line clear-icon" @click="searchQuery = ''"></i>
      </div>

      <div class="filter-tabs">
        <div
          v-for="type in ['all', 'line', 'fill', 'brands']"
          :key="type"
          class="tab"
          :class="{ active: filterType === type }"
          @click="filterType = type as any"
          :title="type.toUpperCase()">
          <i v-if="type === 'all'" class="ri-apps-line"></i>
          <i v-else-if="type === 'line'" class="ri-checkbox-blank-circle-line"></i>
          <i v-else-if="type === 'fill'" class="ri-checkbox-blank-circle-fill"></i>
          <i v-else class="ri-google-play-line"></i>
        </div>
      </div>
    </div>

    <div class="icon-grid custom-scrollbar" ref="scrollEl">
      <div v-for="icon in displayIcons" :key="getIconKey(icon)" class="icon-item" :class="{ active: isSelected(icon) }" @click="selectIcon(icon)" :title="getIconName(icon)">
        <i v-if="typeof icon === 'string'" :class="icon"></i>

        <svg v-else viewBox="0 0 24 24" class="brand-svg">
          <path :d="icon.p" />
        </svg>
      </div>

      <div class="status-bar">
        <span v-if="displayIcons.length === 0 && searchQuery">No icons found.</span>
        <span v-else-if="displayIcons.length < filteredTotal" class="loading-text">
          <i class="ri-loader-4-line spin"></i>
        </span>
        <span v-else class="end-text">{{ filteredTotal }} icons loaded.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useInfiniteScroll } from '@vueuse/core'

  import remixIconsData from '@/assets/icons.json'
  import brandIconsData from '@/assets/brands.json' // 导入生成的 JSON

  const props = defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits(['update:modelValue', 'select-brand'])

  // 类型定义
  type BrandIcon = { n: string; s: string; h: string; p: string }
  type IconItem = string | BrandIcon

  // --- 状态 ---
  const searchQuery = ref('')
  const filterType = ref<'all' | 'line' | 'fill' | 'brands'>('all')
  const scrollEl = ref<HTMLElement | null>(null)

  const PAGE_SIZE = 100
  const currentPage = ref(1)

  // --- 计算属性 ---
  const filteredAllIcons = computed<IconItem[]>(() => {
    const q = searchQuery.value.toLowerCase().trim()

    // 1. 如果选了 Brands，只返回品牌图标
    if (filterType.value === 'brands') {
      let res = brandIconsData as BrandIcon[]
      if (q) res = res.filter((i) => i.n.toLowerCase().includes(q) || i.s.includes(q))
      return res
    }

    // 2. 否则处理 Remix Icons
    let res = remixIconsData as string[]
    // 混合模式下，不显示品牌图标，因为数量太多(3000+)，会淹没系统图标
    // 如果用户明确搜了内容，也许可以混合？暂时保持分离以保持干净。

    if (filterType.value === 'line') {
      res = res.filter((i) => i.endsWith('-line'))
    } else if (filterType.value === 'fill') {
      res = res.filter((i) => i.endsWith('-fill'))
    }

    if (q) {
      res = res.filter((i) => i.includes(q))
    }

    return res
  })

  const filteredTotal = computed(() => filteredAllIcons.value.length)

  const displayIcons = computed(() => {
    return filteredAllIcons.value.slice(0, currentPage.value * PAGE_SIZE)
  })

  // --- 辅助函数 ---
  const getIconKey = (icon: IconItem) => (typeof icon === 'string' ? icon : icon.s)
  const getIconName = (icon: IconItem) => (typeof icon === 'string' ? icon : icon.n)

  const isSelected = (icon: IconItem) => {
    if (typeof icon === 'string') return props.modelValue === icon
    // 品牌图标选中逻辑：比如 modelValue 是 "si:github"
    return props.modelValue === `si:${icon.s}`
  }

  // --- 动作 ---
  const selectIcon = (icon: IconItem) => {
    if (typeof icon === 'string') {
      emit('update:modelValue', icon)
    } else {
      // 核心：品牌图标使用 "si:" 前缀
      const val = `si:${icon.s}`
      emit('update:modelValue', val)
      // 额外发射一个事件，把颜色传出去（用于 LinkWidget 自动填色）
      emit('select-brand', { color: icon.h })
    }
  }

  const loadMore = () => {
    if (displayIcons.value.length >= filteredTotal.value) return
    currentPage.value++
  }

  useInfiniteScroll(
    scrollEl,
    () => {
      loadMore()
    },
    { distance: 50 }
  )

  watch([searchQuery, filterType], () => {
    currentPage.value = 1
    if (scrollEl.value) scrollEl.value.scrollTop = 0
  })
</script>

<style lang="less" scoped>
  /* 复用原有样式，增加 svg 样式 */
  .icon-selector {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 12px;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .toolbar {
      display: flex;
      gap: 10px;
      .search-box {
        flex: 1;
        position: relative;
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }
        .clear-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          &:hover {
            color: #fff;
          }
        }
        .search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 30px 8px 32px;
          color: #fff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          &:focus {
            border-color: rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
      .filter-tabs {
        display: flex;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 2px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        .tab {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.4);
          border-radius: 6px;
          transition: all 0.2s;
          &:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
          }
          &.active {
            color: #000;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      max-height: 240px;
      overflow-y: auto;
      padding-right: 4px;
      min-height: 100px;

      .icon-item {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.6);
        transition: all 0.2s;
        background: rgba(255, 255, 255, 0.02);

        .brand-svg {
          width: 20px;
          height: 20px;
          transition: fill 0.2s;
          fill: #FFF;
          // fill 颜色由行内样式控制 (icon.hex)
        }

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: scale(1.15);
          z-index: 1;
        }
        &.active {
          background: #fff;
          color: #000;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
          z-index: 2;
          .brand-svg {
            fill: #000 !important; // 选中时强制变黑
          }
        }
      }

      .status-bar {
        grid-column: span 6;
        text-align: center;
        padding: 10px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 12px;
        .spin {
          animation: spin 1s linear infinite;
          font-size: 16px;
          display: inline-block;
        }
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  // 滚动条样式保持不变
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
</style>
