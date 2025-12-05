<template>
  <div class="icon-selector">
    <div class="toolbar">
      <div class="search-box">
        <i class="ri-search-line search-icon"></i>
        <input v-model="searchQuery" placeholder="Search 2000+ icons..." class="search-input" autofocus />
        <i v-if="searchQuery" class="ri-close-line clear-icon" @click="searchQuery = ''"></i>
      </div>

      <div class="filter-tabs">
        <div v-for="type in ['all', 'line', 'fill']" :key="type" class="tab" :class="{ active: filterType === type }" @click="filterType = type as any" :title="type.toUpperCase()">
          <i v-if="type === 'all'" class="ri-apps-line"></i>
          <i v-else-if="type === 'line'" class="ri-checkbox-blank-circle-line"></i>
          <i v-else class="ri-checkbox-blank-circle-fill"></i>
        </div>
      </div>
    </div>

    <div class="icon-grid custom-scrollbar" ref="scrollEl">
      <div v-for="icon in displayIcons" :key="icon" class="icon-item" :class="{ active: modelValue === icon }" @click="selectIcon(icon)" :title="icon">
        <i :class="icon"></i>
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
  import { ref, computed, watch, nextTick } from 'vue'
  import { useInfiniteScroll } from '@vueuse/core'

  // 导入刚才生成的全量图标数据
  // 如果报错 "Cannot find module"，请确保你运行了 node scripts/gen-icons.js
  import allIconsData from '@/assets/icons.json'

  const props = defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // --- 状态 ---
  const searchQuery = ref('')
  const filterType = ref<'all' | 'line' | 'fill'>('all')
  const scrollEl = ref<HTMLElement | null>(null)

  // 分页控制
  const PAGE_SIZE = 100
  const currentPage = ref(1)

  // --- 计算属性：过滤逻辑 (极快) ---
  const filteredAllIcons = computed(() => {
    let result = allIconsData as string[]

    // 1. 类型过滤
    if (filterType.value === 'line') {
      result = result.filter((i) => i.endsWith('-line'))
    } else if (filterType.value === 'fill') {
      result = result.filter((i) => i.endsWith('-fill'))
    }

    // 2. 搜索关键词过滤
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      result = result.filter((i) => i.includes(q))
    }

    return result
  })

  // 总数
  const filteredTotal = computed(() => filteredAllIcons.value.length)

  // --- 计算属性：当前显示的部分 (Pagination) ---
  const displayIcons = computed(() => {
    return filteredAllIcons.value.slice(0, currentPage.value * PAGE_SIZE)
  })

  // --- 动作 ---

  const selectIcon = (icon: string) => {
    emit('update:modelValue', icon)
  }

  // 加载更多
  const loadMore = () => {
    if (displayIcons.value.length >= filteredTotal.value) return
    currentPage.value++
  }

  // 使用 VueUse 的无限滚动
  useInfiniteScroll(
    scrollEl,
    () => {
      loadMore()
    },
    { distance: 50 }
  )

  // 当搜索或筛选变化时，重置分页并滚动到顶部
  watch([searchQuery, filterType], () => {
    currentPage.value = 1
    if (scrollEl.value) {
      scrollEl.value.scrollTop = 0
    }
  })
</script>

<style lang="less" scoped>
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
          padding: 8px 30px 8px 32px; // 留出左右图标位置
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
      max-height: 240px; // 稍微加高一点，视野更好
      overflow-y: auto;
      padding-right: 4px;
      // 保持内容的最小高度，防止搜索无结果时塌陷太难看
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
