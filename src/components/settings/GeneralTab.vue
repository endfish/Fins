<template>
  <div class="tab-pane">
    <h3>{{ t('section_customization') }}</h3>

    <div class="form-group">
      <label>{{ t('label_brand_title') }}</label>
      <input v-model="store.title" class="styled-input" placeholder="Fins" maxlength="12" />
      <p class="desc">{{ t('desc_brand_title') }}</p>
    </div>

    <div class="divider"></div>

    <h3>{{ t('section_wallpaper') }}</h3>
    <div class="bg-selector">
      <div class="mode-switch">
        <div class="mode-btn" :class="{ active: store.bgMode === 'bing' }" @click="store.setBgMode('bing')">{{ t('mode_bing') }}</div>
        <div class="mode-btn" :class="{ active: store.bgMode === 'custom' }" @click="store.setBgMode('custom')">{{ t('mode_custom') }}</div>
      </div>

      <div v-if="store.bgMode === 'custom'" class="custom-bg-input">
        <input v-model="store.customBgUrl" class="styled-input" placeholder="https://source.unsplash.com/random/1920x1080" />
        <p class="desc">{{ t('input_custom_bg_placeholder') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/store/useSettingStore'
  import { t } from '@/utils/i18n'
  
  const store = useSettingStore()

</script>

<style lang="less" scoped>
  h3 {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 16px 0;
  }

  .form-group {
    margin-bottom: 24px;
    label {
      display: block;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 8px;
    }
    .desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.3);
      margin-top: 6px;
    }
  }

  .styled-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px 12px;
    color: #fff;
    outline: none;
    font-size: 14px;
    box-sizing: border-box;
    &:focus {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .styled-select {
    width: 100%;
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 32px 0;
  }

  .mode-switch {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    .mode-btn {
      flex: 1;
      text-align: center;
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
      &:hover {
        border-color: rgba(255, 255, 255, 0.3);
      }
      &.active {
        background: #fff;
        color: #000;
        border-color: #fff;
        font-weight: 500;
      }
    }
  }
</style>
