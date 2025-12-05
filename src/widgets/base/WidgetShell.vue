<template>
  <div class="widget-shell" :class="[`size-${size}`, { 'is-editing': isEditing }]" @contextmenu.prevent="emit('contextmenu', $event)">
    <div class="liquid-effect"></div>

    <div class="liquid-tint"></div>

    <div class="liquid-shine"></div>

    <div class="shine-animation"></div>

    <div class="liquid-border"></div>

    <div class="widget-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    size: string
    isEditing?: boolean
  }>()

  const emit = defineEmits(['contextmenu'])
</script>

<style lang="less" scoped>
  .widget-shell {
    position: relative;
    border-radius: 22px; // 圆角保持一致
    overflow: hidden;
    cursor: pointer;

    // 基础阴影
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);

    // 弹性过渡
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    // 强制开启 GPU 避免动画时模糊失效
    transform: translate3d(0, 0, 0);

    // --- 尺寸定义 ---
    &.size-1x1 {
      width: 80px;
      height: 80px;
    }
    &.size-2x1 {
      width: 184px;// 80*2 + 24
      height: 80px;
    }
    &.size-2x2 {
      width: 184px;// 80*2 + 24
      height: 220px;
    }
    &.size-3x2 {
      width: 288px; // 80*3 + 24*2 = 240 + 48
      height: 220px;
    }
    &.size-4x2 {
      width: 392px; // 80*4 + 24*3 = 320 + 72
      height: 220px;
    }

    // 编辑模式
    &.is-editing {
      animation: jiggle 0.3s infinite linear;
      cursor: move;
    }

    // --- 核心层级 ---

    .liquid-border {
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 3;
      width: calc(100% - 1px);
      height: calc(100% - 2px);
      border: 1px solid #fff;
      border-radius: 22px;
    }

    .liquid-effect {
      position: absolute;
      inset: 0;
      z-index: 0;
      backdrop-filter: blur(2px);
      filter: url(#glass-distortion); // 应用 SVG 滤镜
      opacity: 0.8;
    }

    .liquid-tint {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: rgba(255, 255, 255, 0.08); // 基础体色
    }

    .liquid-shine {
      position: absolute;
      inset: 0;
      z-index: 2;
      // 内部厚度高光
      box-shadow: inset 1px 1px 2px 0 rgba(255, 255, 255, 0.3), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1);

      // 静态光泽
      background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 40%);
    }

    // --- 流光动画层 ---
    .shine-animation {
      position: absolute;
      top: 0;
      left: -150%;
      width: 100%;
      height: 100%;
      z-index: 3; // 在高光层之上，内容层之下
      background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
      transform: skewX(-25deg);
      pointer-events: none;
      transition: none;
    }

    .widget-content {
      position: relative;
      z-index: 4; // 确保内容最高
      width: 100%;
      height: 100%;
    }

    // --- Hover 交互 ---
    &:hover {
      transform: translateY(-6px) scale(1.05) translate3d(0, 0, 0);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);

      // 边框高光变亮
      border-top-color: rgba(255, 255, 255, 0.4);
      border-left-color: rgba(255, 255, 255, 0.3);

      // 内部高光加深
      .liquid-shine {
        box-shadow: inset 2px 2px 4px 0 rgba(255, 255, 255, 0.4), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.2);
        background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 50%);
      }

      .liquid-tint {
        background: rgba(255, 255, 255, 0.12);
      }

      // 触发流光动画
      .shine-animation {
        animation: shine-card 0.8s;
      }
    }
  }

  @keyframes shine-card {
    0% {
      left: -150%;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      left: 150%;
      opacity: 0;
    }
  }

  @keyframes jiggle {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(1deg);
    }
    75% {
      transform: rotate(-1deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
</style>
