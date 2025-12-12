<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ editingItem ? t('widget_link_edit_title') : t('widget_link_add_title') }}</h3>

        <button v-if="editingItem" class="delete-btn" @click="emit('delete')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>

      <div class="form-group">
        <label>{{ t('label_url') }}</label>
        <div class="input-wrapper">
          <input v-model="formData.url" placeholder="ex: github.com" @keydown.enter="handleSave" @blur="autoFillName" autofocus class="styled-input" />
        </div>
      </div>

      <div class="form-group">
        <label>{{ t('label_title') }}</label> <input v-model="formData.name" placeholder="ex: GitHub" class="styled-input" maxlength="12" />
      </div>

      <div class="form-group">
        <label>{{ t('label_icon_style') }}</label>
        <div class="type-selector">
          <div v-for="type in ['api', 'remix', 'text']" :key="type" class="type-option" :class="{ active: formData.iconType === type }" @click="formData.iconType = type as any">
            {{ type === 'api' ? t('option_auto') : type.toUpperCase() }}
          </div>
        </div>
      </div>

      <div class="form-group" v-if="formData.iconType === 'api'">
        <div class="info-box">
          <i class="ri-google-fill"></i>
          <div class="text-content">
            <span class="main">{{ t('link_auto_fetch_main') }}</span> <span class="sub">{{ t('link_auto_fetch_sub') }}</span>
          </div>
        </div>
      </div>

      <div class="form-group" v-if="formData.iconType === 'remix'">
        <label>{{ t('label_select_icon') }}</label>
        <div class="selected-preview" v-if="formData.iconValue">{{ t('text_selected') }}: <i :class="formData.iconValue"></i> {{ formData.iconValue }}</div>
        <IconSelector v-model="formData.iconValue" />
      </div>

      <div class="form-group" v-if="formData.iconType === 'text'">
        <label>{{ t('label_short_text') }}</label> <input v-model="formData.iconValue" placeholder="GH" maxlength="2" class="styled-input center-text" />
      </div>

      <div class="form-group">
        <label>{{ t('label_bg_color') }}</label> <ColorSelector v-model="formData.bgColor" />
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="emit('close')">{{ t('common_cancel') }}</button> <button class="save-btn" @click="handleSave">{{ t('common_save') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import IconSelector from '@/components/IconSelector.vue'
  import ColorSelector from '@/components/ColorSelector.vue'
  import { t } from '@/utils/i18n'

  // 定义一个松散的接口，适配 GridItem 的 props
  interface WidgetFormData {
    url?: string
    name?: string
    iconType: 'api' | 'remix' | 'text'
    iconValue: string
    bgColor: string
  }

  const props = defineProps<{
    visible: boolean
    editingItem: any | null // 接收 { id, ...props }
  }>()

  const emit = defineEmits(['close', 'save', 'delete', 'switch-to-widget'])

  // 默认值
  const defaultData: WidgetFormData = {
    url: '',
    name: '',
    iconType: 'remix',
    iconValue: '',
    bgColor: 'rgba(255,255,255,0.1)',
  }

  const formData = ref<WidgetFormData>({ ...defaultData })

  // 监听打开，填充数据
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.editingItem) {
          // 深拷贝，防止修改 props
          formData.value = JSON.parse(JSON.stringify(props.editingItem))
          // 确保 bgColor 存在（兼容旧数据）
          if (!formData.value.bgColor) formData.value.bgColor = 'rgba(255,255,255,0.1)'
        } else {
          // 重置
          formData.value = { ...defaultData }
        }
      }
    },
    { immediate: true }
  )

  const autoFillName = () => {
    if (!formData.value.url) return
    if (!formData.value.name) {
      try {
        let domain = formData.value.url
        if (!domain.startsWith('http')) domain = 'https://' + domain
        const hostname = new URL(domain).hostname
        const namePart = hostname.replace('www.', '').split('.')[0] || ''
        if (namePart) {
          formData.value.name = namePart.charAt(0).toUpperCase() + namePart.slice(1)
        }
      } catch (e) {
        // ignore
      }
    }
  }

  const handleSave = () => {
    if (!formData.value.url) return
    if (!formData.value.url?.startsWith('http')) {
      formData.value.url = 'https://' + formData.value.url
    }
    if (!formData.value.name) formData.value.name = 'Link'

    // 直接把数据抛出去，由 SmartGrid 决定怎么存
    emit('save', formData.value)
  }
</script>

<style lang="less" scoped>
  /* 样式保持不变，完美复用 */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fade-in 0.2s;
  }

  .modal-card {
    width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    background: rgba(30, 30, 35, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    color: #fff;
    animation: zoom-in 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);

    &::-webkit-scrollbar {
      width: 0;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-weight: 500;
      }

      .delete-btn {
        background: rgba(255, 80, 80, 0.1);
        color: #ff5050;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #ff5050;
          color: #fff;
        }
      }
    }

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        font-size: 12px;
        opacity: 0.6;
        margin-bottom: 6px;
      }

      .styled-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 10px;
        color: #fff;
        outline: none;
        font-family: monospace;
        box-sizing: border-box;

        &:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        &.center-text {
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
      }

      .type-selector {
        display: flex;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 2px;

        .type-option {
          flex: 1;
          text-align: center;
          font-size: 12px;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.2s;

          &.active {
            background: rgba(255, 255, 255, 0.1);
            opacity: 1;
            font-weight: bold;
          }
        }
      }

      .info-box {
        background: rgba(52, 199, 89, 0.1);
        color: #34c759;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 12px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        line-height: 1.4;

        i {
          font-size: 16px;
          margin-top: 2px;
        }

        .text-content {
          display: flex;
          flex-direction: column;
          .main {
            font-weight: 600;
          }
          .sub {
            font-size: 11px;
            opacity: 0.8;
            margin-top: 2px;
            b {
              opacity: 1;
              font-weight: 600;
            }
          }
        }
      }

      .selected-preview {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        i {
          color: #fff;
        }
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;

      button {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }

      .cancel-btn {
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
        &:hover {
          color: #fff;
        }
      }

      .save-btn {
        background: #fff;
        color: #000;
        font-weight: 600;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }
      }
    }
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
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
