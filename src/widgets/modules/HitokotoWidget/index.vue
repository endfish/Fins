<template>
  <div class="hitokoto-wrapper" @click="handleClick">
    <WidgetShell :size="item.size">
      <div class="content-box" :style="{ backgroundColor: bgColor }">
        <div class="quote-symbol">“</div>
        <div class="text-area">
          <p class="sentence" v-if="displayText">{{ displayText }}</p>
          <p class="loading" v-else>Loading...</p>
        </div>
        <div class="author" v-if="!isCustom && from">—— {{ from }}</div>

        <div class="refresh-icon" v-if="!isCustom">
          <i class="ri-refresh-line" :class="{ spinning: loading }"></i>
        </div>
      </div>
    </WidgetShell>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue'
  import WidgetShell from '@/widgets/base/WidgetShell.vue'
  import type { GridItem } from '@/store/useGridStore'

  const props = defineProps<{
    item: GridItem
  }>()

  // Props 数据
  const widgetProps = computed(() => props.item.props || {})
  const customText = computed(() => widgetProps.value.customText || '')
  const bgColor = computed(() => widgetProps.value.bgColor || 'transparent') // 默认透明，由 Shell 接管，或者用户覆盖

  // 状态
  const apiText = ref('')
  const from = ref('')
  const loading = ref(false)

  // 判断是否是自定义模式
  const isCustom = computed(() => !!customText.value)

  // 最终显示的文字
  const displayText = computed(() => {
    return isCustom.value ? customText.value : apiText.value
  })

  const fetchHitokoto = async () => {
    // 如果有自定义文本，就不请求了
    if (isCustom.value || loading.value) return

    loading.value = true
    try {
      const res = await fetch('https://v1.hitokoto.cn/?c=i&c=d&c=k')
      const data = await res.json()
      apiText.value = data.hitokoto
      from.value = data.from_who || data.from
    } catch (e) {
      apiText.value = 'Life is code.'
      from.value = 'Fins'
    } finally {
      loading.value = false
    }
  }

  const handleClick = () => {
    // 只有非自定义模式下，点击才刷新
    if (!isCustom.value) {
      fetchHitokoto()
    }
  }

  // 监听自定义文本变化，如果是空，则去拉取
  watch(customText, (val) => {
    if (!val && !apiText.value) {
      fetchHitokoto()
    }
  })

  onMounted(() => {
    fetchHitokoto()
  })
</script>

<style lang="less" scoped>
  .hitokoto-wrapper {
    width: 100%;
    height: 100%;

    .content-box {
      width: 100%;
      height: 100%;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-sizing: border-box;
      // 允许背景色覆盖
      transition: background 0.3s;

      .quote-symbol {
        font-family: 'Times New Roman', serif;
        font-size: 60px;
        color: rgba(255, 255, 255, 0.1);
        position: absolute;
        top: 6px;
        left: 12px;
        line-height: 1;
        pointer-events: none;
      }

      .text-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 0;

        .sentence {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
          text-align: center;
          font-weight: 400;
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
          // 限制行数
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          white-space: pre-wrap; // 允许换行
        }
        .loading {
          font-size: 12px;
          opacity: 0.5;
        }
      }

      .author {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        text-align: right;
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .refresh-icon {
        position: absolute;
        bottom: 16px;
        left: 20px;
        color: rgba(255, 255, 255, 0.2);
        font-size: 16px;
        opacity: 0;
        transition: all 0.3s;

        .spinning {
          animation: spin 1s linear infinite;
        }
      }

      &:hover .refresh-icon {
        opacity: 1;
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
</style>
