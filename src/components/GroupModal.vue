<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Add Group</h3>
      </div>

      <div class="form-group">
        <label>Group Name</label>
        <div class="input-wrapper">
          <input v-model="formData.name" placeholder="ex: Work" @keydown.enter="handleSave" autofocus class="styled-input" maxlength="10" />
        </div>
      </div>

      <div class="form-group">
        <label>Select Icon</label>
        <div class="selected-preview" v-if="formData.icon">Selected: <i :class="formData.icon"></i></div>
        <IconSelector v-model="formData.icon" />
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="emit('close')">Cancel</button>
        <button class="save-btn" @click="handleSave">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import IconSelector from './IconSelector.vue'

  const props = defineProps<{
    visible: boolean
  }>()

  const emit = defineEmits(['close', 'save'])

  const formData = ref({
    name: '',
    icon: '',
  })

  // 重置表单
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        formData.value = { name: '', icon: '' }
      }
    }
  )

  const handleSave = () => {
    if (!formData.value.name) return
    // 默认图标
    if (!formData.value.icon) formData.value.icon = 'ri-folder-line'
    emit('save', formData.value)
  }
</script>

<style lang="less" scoped>
  // 复用 LinkModal 的样式逻辑，保持一致性
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 200; // 比 LinkModal 更高一点，或者相同
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
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    color: #fff;
    animation: zoom-in 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);

    .modal-header {
      margin-bottom: 20px;
      h3 {
        margin: 0;
        font-weight: 500;
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
        box-sizing: border-box;
        &:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }
      }
      .selected-preview {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
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
