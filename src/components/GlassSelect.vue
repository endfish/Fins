<template>
  <div class="glass-select" ref="target">
    <div class="trigger" :class="{ active: isOpen }" @click="toggle">
      <span class="label">{{ currentLabel }}</span>
      <i class="ri-arrow-down-s-line arrow" :class="{ rotate: isOpen }"></i>
    </div>

    <Transition name="dropdown">
      <div class="options-list custom-scrollbar" v-if="isOpen">
        <div v-for="opt in options" :key="opt.value" class="option-item" :class="{ selected: modelValue === opt.value }" @click="handleSelect(opt.value)">
          {{ opt.label }}
          <i v-if="modelValue === opt.value" class="ri-check-line check"></i>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { onClickOutside } from '@vueuse/core'

  interface Option {
    label: string
    value: string
  }

  const props = defineProps<{
    modelValue: string
    options: Option[]
  }>()

  const emit = defineEmits(['update:modelValue', 'change'])

  const isOpen = ref(false)
  const target = ref(null)

  // 自动查找当前 label
  const currentLabel = computed(() => {
    const found = props.options.find((o) => o.value === props.modelValue)
    return found ? found.label : props.modelValue
  })

  const toggle = () => (isOpen.value = !isOpen.value)

  const handleSelect = (val: string) => {
    emit('update:modelValue', val)
    emit('change', val)
    isOpen.value = false
  }

  // 点击组件外部自动关闭
  onClickOutside(target, () => {
    isOpen.value = false
  })
</script>

<style lang="less" scoped>
  .glass-select {
    position: relative;
    width: 100%;
    user-select: none;

    .trigger {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #fff;
      font-size: 14px;
      box-sizing: border-box;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }
      &.active {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .arrow {
        transition: transform 0.3s;
        opacity: 0.6;
        &.rotate {
          transform: rotate(180deg);
        }
      }
    }

    .options-list {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 100%;
      max-height: 200px;
      overflow-y: auto;
      background: rgba(30, 30, 35, 0.95); // 深色背景防止透视混乱
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 6px;
      z-index: 100;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

      .option-item {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        &.selected {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          font-weight: 500;
          .check {
            color: #4ade80; // 极客绿
          }
        }
      }
    }
  }

  // 动画
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }

  // 滚动条复用
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
</style>
