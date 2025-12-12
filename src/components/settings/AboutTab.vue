<template>
  <div class="tab-pane about-pane">
    <img src="/logo.svg" class="logo" />
    <h2>Fins</h2>
    <p class="version">v0.0.1 Beta</p>

    <div class="desc-box">
      {{ t('app_desc') }}
    </div>

    <div class="poetry">“ Code is Poetry ”</div>

    <div class="credits">
      Designed by
      <a href="https://tianbianyu.com" target="_blank" class="author-link">Endfish</a>
      &
      <span class="ai-name">Gemini</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { t } from '@/utils/i18n'
</script>

<style lang="less" scoped>
  .about-pane {
    text-align: center;
    padding-top: 20px;

    .logo {
      width: 64px;
      height: 64px;
      opacity: 0.9;
    }
    h2 {
      margin: 16px 0 8px;
      font-weight: 300;
      letter-spacing: 2px;
    }
    .version {
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;
      margin-bottom: 32px;
      font-family: monospace;
    }

    .desc-box {
      background: rgba(255, 255, 255, 0.05);
      padding: 16px;
      border-radius: 12px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin-bottom: 40px;
    }

    .poetry {
      font-family: 'Times New Roman', serif;
      font-style: italic;
      color: rgba(255, 255, 255, 0.5);
      font-size: 16px;
      letter-spacing: 1px;
    }

    .credits {
      margin-top: 40px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 0.5px;

      .author-link {
        color: #fff;
        text-decoration: none;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
        padding-bottom: 2px;
        transition: all 0.2s;
        &:hover {
          color: #4ade80;
          border-color: #4ade80;
        }
      }

      .ai-name {
        background: linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: bold;
      }
    }
  }
</style>
