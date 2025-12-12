<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="engine-card glass-panel">
      <div class="card-header">
        <h3>{{ t('search_engines_title') }}</h3>
        <button class="add-btn" @click="startAdd" v-if="!isEditing"><i class="ri-add-line"></i> {{ t('common_add') }}</button>
        <button class="back-btn" @click="isEditing = false" v-else><i class="ri-arrow-left-line"></i> {{ t('common_back') }}</button>
      </div>

      <div class="engine-list custom-scrollbar" v-if="!isEditing">
        <div v-for="(engine, index) in store.searchEngines" :key="index" class="engine-item">
          <div class="icon-box">
            <i :class="engine.icon"></i>
          </div>
          <div class="info">
            <div class="name">{{ engine.name }}</div>
            <div class="url">{{ engine.url }}</div>
          </div>
          <button class="del-btn" @click="store.removeEngine(index)">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>

      <div class="edit-form custom-scrollbar" v-else>
        <div class="form-group">
          <label>{{ t('label_name') }}</label>
          <input v-model="formData.name" :placeholder="t('placeholder_engine_name')" class="styled-input" />
        </div>

        <div class="form-group">
          <label>{{ t('label_url_prefix') }}</label>
          <input v-model="formData.url" :placeholder="t('placeholder_engine_url')" class="styled-input" />
          <p class="tip">{{ t('tip_engine_query') }}</p>
        </div>

        <div class="form-group">
          <label>{{ t('label_icon') }}</label>
          <div class="selected-preview" v-if="formData.icon"><i :class="formData.icon"></i> {{ t('text_selected') }}</div>
          <IconSelector v-model="formData.icon" />
        </div>

        <div class="form-footer">
          <button class="save-btn" @click="handleSave">{{ t('btn_save_engine') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useSettingStore, type SearchEngine } from '@/store/useSettingStore'
  import IconSelector from './IconSelector.vue'
  import { t } from '@/utils/i18n'

  defineProps<{
    visible: boolean
  }>()

  const emit = defineEmits(['close'])
  const store = useSettingStore()

  const isEditing = ref(false)
  const formData = reactive<SearchEngine>({
    name: '',
    url: '',
    icon: '',
  })

  const startAdd = () => {
    formData.name = ''
    formData.url = ''
    formData.icon = ''
    isEditing.value = true
  }

  const handleSave = () => {
    if (!formData.name || !formData.url) return
    if (!formData.icon) formData.icon = 'ri-search-line'

    store.addEngine({ ...formData })
    isEditing.value = false
  }
</script>

<style lang="less" scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fade-in 0.2s;
  }

  .engine-card {
    width: 380px;
    height: 500px;
    background: rgba(30, 30, 35, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    color: #fff;
    animation: zoom-in 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }

  .card-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 {
      margin: 0;
      font-weight: 500;
      font-size: 16px;
    }

    button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      transition: all 0.2s;
      &:hover {
        background: #fff;
        color: #000;
      }
    }
  }

  .engine-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;

    .engine-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 4px;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .icon-box {
        width: 32px;
        height: 32px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: rgba(255, 255, 255, 0.8);
      }

      .info {
        flex: 1;
        overflow: hidden;
        .name {
          font-size: 14px;
          font-weight: 500;
        }
        .url {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .del-btn {
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        &:hover {
          background: rgba(255, 50, 50, 0.1);
          color: #ff5050;
        }
      }
    }
  }

  .edit-form {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    .form-group {
      margin-bottom: 16px;
      label {
        display: block;
        font-size: 12px;
        opacity: 0.6;
        margin-bottom: 6px;
      }
      .tip {
        font-size: 11px;
        opacity: 0.4;
        margin-top: 4px;
      }

      .styled-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 10px;
        color: #fff;
        outline: none;
        box-sizing: border-box;
        &:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }
      }
      .selected-preview {
        font-size: 12px;
        color: #4ade80;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .form-footer {
      margin-top: auto;
      padding-top: 20px;
      display: flex;
      justify-content: flex-end;
      .save-btn {
        background: #fff;
        color: #000;
        border: none;
        padding: 8px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }

  // 滚动条样式
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

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
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
</style>
