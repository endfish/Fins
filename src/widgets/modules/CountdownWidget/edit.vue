<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ editingItem ? 'Edit Countdown' : 'Add Countdown' }}</h3>
        <button v-if="editingItem" class="delete-btn" @click="emit('delete')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>

      <div class="form-group">
        <label>Title</label>
        <div class="input-wrapper">
          <input v-model="formData.title" placeholder="e.g. Salary Day" class="styled-input" maxlength="12" autofocus />
        </div>
      </div>

      <div class="form-group">
        <label>Target Date</label>
        <div class="input-wrapper">
          <input type="date" v-model="formData.date" class="styled-input" />
        </div>
      </div>

      <div class="form-group">
        <label>Repeat Cycle</label>
        <div class="cycle-selector">
          <div v-for="opt in cycles" :key="opt.value" class="cycle-opt" :class="{ active: formData.recurrence === opt.value }" @click="formData.recurrence = opt.value">
            {{ opt.label }}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Background Image</label>
        <ImagePicker v-model="formData.bgUrl" />
      </div>

      <div class="form-group">
        <label>Theme Color</label>
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
  import ImagePicker from '@/components/ImagePicker.vue'

  const props = defineProps<{
    visible: boolean
    editingItem: any | null
  }>()

  const emit = defineEmits(['close', 'save', 'delete'])

  const cycles = [
    { label: 'None', value: 'none' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ]

  const formData = ref({
    title: '',
    date: '',
    recurrence: 'none',
    bgUrl: '',
    bgColor: 'rgba(74, 144, 226, 0.6)', // 默认蓝色系
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.editingItem) {
          formData.value = JSON.parse(JSON.stringify(props.editingItem))
        } else {
          formData.value = {
            title: 'Event',
            date: new Date().toISOString().split('T')[0] ?? '',
            recurrence: 'none',
            bgUrl: '',
            bgColor: 'rgba(74, 144, 226, 0.6)',
          }
        }
      }
    },
    { immediate: true }
  )

  const handleSave = () => {
    if (!formData.value.title) formData.value.title = 'Countdown'
    if (!formData.value.date) formData.value.date = new Date().toISOString().split('T')[0] ?? ''
    emit('save', formData.value)
  }
</script>

<style lang="less" scoped>
  /* 复用通用弹窗样式 */
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

      // Cycle Selector Style
      .cycle-selector {
        display: flex;
        background: rgba(0, 0, 0, 0.2);
        padding: 2px;
        border-radius: 8px;
        .cycle-opt {
          flex: 1;
          text-align: center;
          font-size: 11px;
          padding: 6px 0;
          cursor: pointer;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.2s;
          &.active {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
            font-weight: 600;
          }
          &:hover:not(.active) {
            color: #fff;
          }
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
