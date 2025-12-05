<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ editingItem ? 'Edit Anniversary' : 'Add Anniversary' }}</h3>
        <button v-if="editingItem" class="delete-btn" @click="emit('delete')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>

      <div class="form-group">
        <label>Title</label>
        <div class="input-wrapper">
          <input v-model="formData.title" placeholder="e.g. Project Launch" class="styled-input" maxlength="20" autofocus />
        </div>
      </div>

      <div class="form-group">
        <label>Date</label>
        <div class="input-wrapper">
          <input type="date" v-model="formData.date" class="styled-input" />
        </div>
      </div>

      <div class="form-group">
        <label>Card Size</label>
        <div class="size-selector">
          <div class="size-opt" :class="{ active: formData.size === '3x2' }" @click="formData.size = '3x2'">
            <div class="rect rect-3x2"></div>
            <span>Standard (3x2)</span>
          </div>

          <div class="size-opt" :class="{ active: formData.size === '4x2' }" @click="formData.size = '4x2'">
            <div class="rect rect-4x2"></div>
            <span>Wide (4x2)</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Background Image URL</label>
        <ImagePicker v-model="formData.bgUrl" />
        <p class="tip">
          Select a local preset or enter a direct link. <br>
          Images are synced as URLs/Paths.
        </p>
      </div>

      <div class="form-group">
        <label>Fallback Color (If no image)</label>
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

  const formData = ref({
    title: '',
    date: '',
    bgUrl: '',
    bgColor: 'rgba(0,0,0,0.5)',
    size: '3x2', // [!code ++] 默认为 3x2
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.editingItem) {
          // 如果是编辑，SmartGrid 会把 item.size 传进来
          const data = JSON.parse(JSON.stringify(props.editingItem))
          formData.value = {
            ...data,
            // 确保 size 有值，旧数据可能没有
            size: data.size || '3x2',
          }
        } else {
          // 默认值
          formData.value = {
            title: 'My Day',
            date: new Date().toISOString().split('T')[0],
            bgUrl: '',
            bgColor: 'rgba(0,0,0,0.5)',
            size: '3x2',
          }
        }
      }
    },
    { immediate: true }
  )

  const handleSave = () => {
    if (!formData.value.title) formData.value.title = 'Anniversary'
    if (!formData.value.date) formData.value.date = new Date().toISOString().split('T')[0]
    emit('save', formData.value)
  }
</script>

<style lang="less" scoped>
  /* 样式复用 LinkModal / HitokotoEdit 的样式 */
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
        &:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }
      }
      .tip {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 6px;
        line-height: 1.4;
        .action-link {
          color: #4ade80;
          cursor: pointer;
          text-decoration: underline;
          &:hover {
            color: #fff;
          }
        }
      }

      .size-selector {
        display: flex;
        gap: 12px;
        .size-opt {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;

          .rect {
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          .rect-3x2 {
            width: 36px;
            height: 24px;
          }
          .rect-4x2 {
            width: 48px;
            height: 24px;
          }

          span {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
          }

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          &.active {
            background: rgba(255, 255, 255, 0.15);
            border-color: #4ade80;
            .rect {
              background: #4ade80;
              border-color: #4ade80;
            }
            span {
              color: #fff;
            }
          }
        }
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
