<template>
  <div class="tab-pane">
    <div class="sync-header">
      <h3>Cloud Sync</h3>
      <div class="toggle-wrapper" @click="store.syncEnabled = !store.syncEnabled">
        <div class="toggle-track" :class="{ active: store.syncEnabled }">
          <div class="toggle-thumb"></div>
        </div>
        <span class="status-text">{{ store.syncEnabled ? 'Enabled' : 'Disabled' }}</span>
      </div>
    </div>

    <p class="desc-text">
      Sync data across devices using Google/Microsoft account. <br />
      Enabled LZ-String compression for max efficiency.
    </p>

    <div class="quota-box">
      <div class="quota-labels">
        <span>Cloud Storage Usage</span>
        <span>{{ (store.syncUsage / 1024).toFixed(2) }} KB / {{ store.syncQuota / 1024 }} KB</span>
      </div>
      <div class="progress-bg">
        <div
          class="progress-bar"
          :style="{ width: Math.min((store.syncUsage / store.syncQuota) * 100, 100) + '%' }"
          :class="{ warning: store.syncUsage > store.syncQuota * 0.8 }"></div>
      </div>
    </div>

    <div class="divider"></div>

    <h3>Cloud Actions</h3>
    <div class="action-grid">
      <div class="action-card" @click="store.pushToCloud">
        <div class="icon-circle"><i class="ri-upload-cloud-2-line"></i></div>
        <div class="text">
          <div class="title">Upload</div>
          <div class="sub">Local ➔ Cloud</div>
        </div>
      </div>

      <div class="action-card" @click="store.pullFromCloud">
        <div class="icon-circle"><i class="ri-download-cloud-2-line"></i></div>
        <div class="text">
          <div class="title">Download</div>
          <div class="sub">Cloud ➔ Local</div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <h3>File Backup</h3>
    <div class="action-grid">
      <div class="action-card" @click="store.exportData">
        <div class="icon-circle"><i class="ri-file-download-line"></i></div>
        <div class="text">
          <div class="title">Export JSON</div>
          <div class="sub">Save backup file</div>
        </div>
      </div>

      <div class="action-card" @click="triggerFileInput">
        <div class="icon-circle"><i class="ri-file-upload-line"></i></div>
        <div class="text">
          <div class="title">Import JSON</div>
          <div class="sub">Restore from file</div>
        </div>
        <input type="file" ref="fileInput" accept=".json" style="display: none" @change="handleFileImport" />
      </div>
    </div>

    <div class="divider"></div>

    <h3>Danger Zone</h3>
    <div class="danger-box">
      <div class="danger-info">
        <div class="d-title">Clear Cloud Data</div>
        <div class="d-desc">Permanently remove all data from the cloud server.</div>
      </div>
      <button class="danger-btn" @click="store.clearCloudData">Clear</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useSettingStore } from '@/store/useSettingStore'

  const store = useSettingStore()
  const fileInput = ref<HTMLInputElement | null>(null)

  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  const handleFileImport = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      const file = target.files[0]
      store.importData(file)
      // 清空 value 允许重复选择同一文件
      target.value = ''
    }
  }
</script>

<style lang="less" scoped>
  h3 {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 16px 0;
  }
  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 24px 0;
  }

  // Header & Toggle
  .sync-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .toggle-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      .toggle-track {
        width: 40px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        position: relative;
        transition: all 0.3s;
        &.active {
          background: #4ade80;
        }
        .toggle-thumb {
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }
      }
      .toggle-track.active .toggle-thumb {
        transform: translateX(20px);
      }
      .status-text {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        width: 50px;
      }
    }
  }

  .desc-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.5;
    margin-bottom: 24px;
  }

  // Quota Bar
  .quota-box {
    background: rgba(0, 0, 0, 0.2);
    padding: 16px;
    border-radius: 12px;
    .quota-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 8px;
    }
    .progress-bg {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      .progress-bar {
        height: 100%;
        background: #2997ff;
        border-radius: 3px;
        transition: width 0.5s ease;
        &.warning {
          background: #ffcc00;
        }
      }
    }
  }

  // Action Grid
  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    .action-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      .icon-circle {
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }

      .text {
        .title {
          font-size: 14px;
          font-weight: 600;
        }
        .sub {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 2px;
        }
      }
    }
  }

  // Danger Zone
  .danger-box {
    border: 1px solid rgba(255, 59, 48, 0.3);
    background: rgba(255, 59, 48, 0.05);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .danger-info {
      .d-title {
        font-size: 14px;
        font-weight: 600;
        color: #ff3b30;
      }
      .d-desc {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 2px;
      }
    }

    .danger-btn {
      background: transparent;
      border: 1px solid #ff3b30;
      color: #ff3b30;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
      &:hover {
        background: #ff3b30;
        color: #fff;
      }
    }
  }
</style>
