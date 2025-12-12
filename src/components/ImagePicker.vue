<template>
  <div class="image-picker-wrapper">
    <div class="input-group">
      <input :value="modelValue" @input="handleInput" :placeholder="t('img_input_placeholder')" class="styled-input" />
      <div class="picker-btn" @click="showModal = true" :title="t('img_btn_tooltip')">
        <i class="ri-image-2-line"></i>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="picker-overlay" @click.self="showModal = false">
          <div class="picker-card glass-panel">
            <div class="header">
              <h3>{{ t('img_modal_title') }}</h3>
              <button class="close-btn" @click="showModal = false">
                <i class="ri-close-line"></i>
              </button>
            </div>

            <div class="gallery-grid custom-scrollbar" ref="scrollEl">
              <div v-for="img in displayWallpapers" :key="img.name" class="img-item" :class="{ active: modelValue === img.name }" @click="selectImage(img.name)">
                <img :src="img.url" loading="lazy" decoding="async" />
                <div class="check-mark"><i class="ri-check-line"></i></div>
                <div class="img-name">{{ img.name }}</div>
              </div>

              <div v-if="localWallpapers.length === 0" class="empty-tip">{{ t('img_empty_tip') }}</div>

              <div v-if="displayWallpapers.length < localWallpapers.length" class="loading-trigger">{{ t('img_loading_more') }}</div>
            </div>

            <div class="footer-tip">{{ t('img_storage_tip') }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { getLocalWallpapers } from '@/utils/wallpapers'
  // [!code ++] 引入无限滚动工具
  import { useInfiniteScroll } from '@vueuse/core'
  import { t } from '@/utils/i18n'

  defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits(['update:modelValue'])
  const showModal = ref(false)
  const scrollEl = ref<HTMLElement | null>(null) // [!code ++] 滚动容器引用

  // 获取全量列表
  const localWallpapers = getLocalWallpapers()

  // [!code ++] 分页逻辑
  const PAGE_SIZE = 9 // 每次只渲染9张 (3行)
  const currentPage = ref(1)

  const displayWallpapers = computed(() => {
    return localWallpapers.slice(0, currentPage.value * PAGE_SIZE)
  })

  // [!code ++] 监听滚动到底部
  useInfiniteScroll(
    scrollEl,
    () => {
      if (displayWallpapers.value.length < localWallpapers.length) {
        currentPage.value++
      }
    },
    { distance: 50 }
  )

  // [!code ++] 每次打开弹窗重置分页，防止上次滚到底部导致这次直接全量渲染
  watch(showModal, (val) => {
    if (val) {
      currentPage.value = 1
      if (scrollEl.value) scrollEl.value.scrollTop = 0
    }
  })

  const handleInput = (e: Event) => {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
  }

  const selectImage = (name: string) => {
    emit('update:modelValue', name)
    showModal.value = false
  }
</script>

<style lang="less" scoped>
  /* 样式复用之前的，保持一致 */
  .input-group {
    display: flex;
    gap: 8px;
    width: 100%;
    .styled-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 12px;
      color: #fff;
      outline: none;
      font-family: inherit;
      transition: all 0.2s;
      &:focus {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.08);
      }
    }
    .picker-btn {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.8);
      transition: all 0.2s;
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
      i {
        font-size: 18px;
      }
    }
  }

  .picker-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .picker-card {
    width: 600px;
    max-height: 80vh;
    background: rgba(30, 30, 35, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: zoom-in 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);

    .header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #fff;
      }
      .close-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        font-size: 20px;
        &:hover {
          color: #fff;
        }
      }
    }

    .gallery-grid {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      // [!code ++] 增加最小高度，防止内容少时塌陷
      min-height: 200px;

      .img-item {
        position: relative;
        aspect-ratio: 16/9;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;

        // [!code ++] 优化：给图片容器一个背景色，在图片加载出来前占位
        background: rgba(255, 255, 255, 0.05);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
          // [!code ++] 优化：防止图片作为块级元素影响布局
          display: block;
        }
        .check-mark {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          i {
            font-size: 24px;
            color: #fff;
          }
        }
        .img-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.6);
          color: rgba(255, 255, 255, 0.7);
          font-size: 10px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover {
          border-color: rgba(255, 255, 255, 0.5);
          img {
            transform: scale(1.1);
          }
          .img-name {
            opacity: 1;
          }
        }
        &.active {
          border-color: #4ade80;
          .check-mark {
            opacity: 1;
          }
        }
      }

      .empty-tip {
        grid-column: span 3;
        text-align: center;
        padding: 40px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 13px;
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
      }

      .loading-trigger {
        grid-column: span 3;
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.3);
      }
    }

    .footer-tip {
      padding: 10px 20px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: right;
    }
  }

  // 动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
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
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
</style>
