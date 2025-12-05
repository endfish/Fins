<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Edit Hitokoto</h3>
        <button class="delete-btn" @click="emit('delete')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>

      <div class="form-group">
        <label>Custom Text</label>
        <div class="input-wrapper">
          <textarea v-model="formData.customText" placeholder="Leave empty to use random quote..." class="styled-input textarea" rows="4" maxlength="100"></textarea>
        </div>
        <p class="tip">If set, this text will replace the daily quote.</p>
      </div>

      <div class="form-group">
        <label>Background Color</label>
        <ColorSelector v-model="formData.bgColor" />
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="emit('close')">Cancel</button>
        <button class="save-btn" @click="handleSave">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import ColorSelector from '@/components/ColorSelector.vue'

  const props = defineProps<{
    visible: boolean
    editingItem: any
  }>()

  const emit = defineEmits(['close', 'save', 'delete'])

  const formData = ref({
    customText: '',
    bgColor: 'rgba(255,255,255,0.1)',
  })

  watch(
    () => props.visible,
    (val) => {
      if (val && props.editingItem) {
        formData.value = {
          customText: props.editingItem.customText || '',
          bgColor: props.editingItem.bgColor || 'rgba(255,255,255,0.1)',
        }
      }
    },
    { immediate: true }
  )

  const handleSave = () => {
    emit('save', formData.value)
  }
</script>

<style lang="less" scoped>
  /* 完全复用 LinkModal 的样式 */
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
    width: 360px;
    background: rgba(30, 30, 35, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 24px;
    color: #fff;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    animation: zoom-in 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);

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
      margin-bottom: 20px;
      label {
        display: block;
        font-size: 12px;
        opacity: 0.6;
        margin-bottom: 8px;
      }
      .styled-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 12px;
        color: #fff;
        outline: none;
        box-sizing: border-box;
        font-family: inherit;
        resize: none;
        &:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }
      }
      .tip {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 6px;
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
      button {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 13px;
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
