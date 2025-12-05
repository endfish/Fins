<template>
  <div class="color-selector">
    <div class="preset-grid">
      <div
        v-for="color in presets"
        :key="color.name"
        class="color-circle"
        :style="{ background: color.value }"
        :class="{ active: modelValue === color.value }"
        @click="selectPreset(color.value)"
        :title="color.name">
        <i v-if="modelValue === color.value" class="ri-check-line check-icon"></i>
      </div>

      <div class="custom-btn" :class="{ active: isCustomMode }" @click="toggleCustom" title="Custom Color">
        <i class="ri-palette-line"></i>
      </div>
    </div>

    <div v-if="isCustomMode" class="custom-panel">
      <div class="control-row">
        <div class="color-picker-wrapper">
          <div class="picker-preview" :style="{ backgroundColor: hexValue }"></div>
          <input type="color" v-model="hexValue" class="native-picker" />
        </div>

        <div class="alpha-slider-wrapper">
          <div class="slider-track" :style="sliderTrackStyle"></div>
          <input type="range" min="0" max="1" step="0.01" v-model.number="alphaValue" class="native-slider" />
        </div>

        <div class="value-display">{{ Math.round(alphaValue * 100) }}%</div>
      </div>

      <div class="code-preview">
        {{ modelValue }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { parseRgba, rgbToHex, hexToRgb, toRgbaString } from '@/utils/color'

  const props = defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 预设 (保持不变)
  const presets = [
    { name: 'Glass', value: 'rgba(255, 255, 255, 0.1)' },
    { name: 'Dark', value: 'rgba(0, 0, 0, 0.5)' },
    { name: 'Red', value: 'rgba(255, 0, 0, 0.5)' },
    { name: 'Orange', value: 'rgba(255, 149, 0, 0.5)' },
    { name: 'Yellow', value: 'rgba(255, 204, 0, 0.5)' },
    { name: 'Green', value: 'rgba(52, 199, 89, 0.5)' },
    { name: 'Teal', value: 'rgba(48, 176, 199, 0.5)' },
    { name: 'Blue', value: 'rgba(0, 122, 255, 0.5)' },
    { name: 'Indigo', value: 'rgba(88, 86, 214, 0.5)' },
    { name: 'Purple', value: 'rgba(175, 82, 222, 0.5)' },
    { name: 'Pink', value: 'rgba(255, 45, 85, 0.5)' },
    { name: 'Slate', value: 'rgba(142, 142, 147, 0.5)' },
  ]

  // --- 内部状态 ---
  const isCustomMode = ref(false)

  // 拆分状态：Hex (#ffffff) 和 Alpha (0-1)
  const hexValue = ref('#ffffff')
  const alphaValue = ref(1)

  // --- 逻辑 ---

  // 1. 初始化：当 modelValue 外部变化时，解析并同步到内部状态
  watch(
    () => props.modelValue,
    (val) => {
      const { r, g, b, a } = parseRgba(val)
      hexValue.value = rgbToHex(r, g, b)
      alphaValue.value = a

      // 如果当前值不在预设里，自动打开自定义面板
      // const isPreset = presets.some((p) => p.value === val)
      // if (!isPreset && val && !isCustomMode.value) {
      //   isCustomMode.value = true
      // }
    },
    { immediate: true }
  )

  // 2. 合成：当内部状态变化时，合成 rgba 并 emit
  const updateColor = () => {
    const { r, g, b } = hexToRgb(hexValue.value)
    const rgba = toRgbaString(r, g, b, alphaValue.value)
    emit('update:modelValue', rgba)
  }

  // 监听内部变化
  watch([hexValue, alphaValue], () => {
    updateColor()
  })

  const selectPreset = (color: string) => {
    emit('update:modelValue', color)
    // 选预设时，不需要关闭自定义面板，甚至可以同步更新面板状态
    const { r, g, b, a } = parseRgba(color)
    hexValue.value = rgbToHex(r, g, b)
    alphaValue.value = a
  }

  const toggleCustom = () => {
    isCustomMode.value = !isCustomMode.value
  }

  // 动态计算滑块背景，让它看起来像是在调整当前颜色的透明度
  const sliderTrackStyle = computed(() => {
    const { r, g, b } = hexToRgb(hexValue.value)
    return {
      background: `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`,
    }
  })
</script>

<style lang="less" scoped>
  .color-selector {
    margin-top: 8px;
  }

  // 预设网格 (复用原有样式，微调)
  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 8px;

    .color-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, border-color 0.2s;
      position: relative; // 保证 check-icon 居中

      &:hover {
        transform: scale(1.1);
        border-color: rgba(255, 255, 255, 0.5);
      }
      &.active {
        border: 2px solid #fff;
        transform: scale(1.1);
      }
      .check-icon {
        font-size: 16px;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
    }

    .custom-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.2s;

      &:hover,
      &.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
        border-color: #fff;
        transform: scale(1.05);
      }
    }
  }

  // 自定义面板
  .custom-panel {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: slide-down 0.2s;

    .control-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;

      // A. 取色器
      .color-picker-wrapper {
        position: relative;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.2);
        cursor: pointer;
        flex-shrink: 0;

        .picker-preview {
          width: 100%;
          height: 100%;
        }

        .native-picker {
          position: absolute;
          inset: -5px; // 放大一点以覆盖
          width: 150%;
          height: 150%;
          opacity: 0; // 隐藏原生控件
          cursor: pointer;
        }
      }

      // B. 透明度滑块
      .alpha-slider-wrapper {
        flex: 1;
        height: 16px; // 增加触控区域
        position: relative;
        display: flex;
        align-items: center;

        .slider-track {
          position: absolute;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          // 棋盘格背景，体现透明度
          background-color: #333;
          z-index: 0;
        }

        .native-slider {
          position: relative;
          z-index: 1;
          width: 100%;
          -webkit-appearance: none;
          background: transparent;
          margin: 0;

          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #fff;
            border: 2px solid rgba(0, 0, 0, 0.1);
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            margin-top: -5px; // 对齐
          }

          // 滑轨背景设为透明，因为我们有自定义的 .slider-track
          &::-webkit-slider-runnable-track {
            width: 100%;
            height: 6px;
            cursor: pointer;
            background: transparent;
          }
        }
      }

      // C. 数值
      .value-display {
        font-size: 12px;
        font-family: monospace;
        color: rgba(255, 255, 255, 0.6);
        width: 32px;
        text-align: right;
      }
    }

    .code-preview {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      background: rgba(0, 0, 0, 0.2);
      padding: 6px;
      border-radius: 6px;
      text-align: center;
      user-select: all; // 允许一键复制
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
