<template>
  <div class="modal-overlay" v-if="visible" @click.self="emit('close')">
    <div class="gallery-card">
      <div class="header">
        <h3>Add Widget</h3>
        <button class="close-btn" @click="emit('close')"><i class="ri-close-line"></i></button>
      </div>

      <div class="grid-list custom-scrollbar">
        <div class="widget-item" @click="select('hitokoto')">
          <div class="preview hito">
            <div class="lines"><span></span><span></span></div>
          </div>
          <div class="info">
            <div class="name">Hitokoto</div>
            <div class="desc">Daily quote / Custom text</div>
          </div>
          <div class="add-icon"><i class="ri-add-line"></i></div>
        </div>

        <div class="widget-item" @click="select('anniversary')">
          <div class="preview anniversary">
            <span class="day">365</span>
          </div>
          <div class="info">
            <div class="name">Days Matter</div>
            <div class="desc">Track important dates</div>
          </div>
          <div class="add-icon"><i class="ri-add-line"></i></div>
        </div>

        <div class="widget-item" @click="select('countdown')">
          <div class="preview countdown">
            <i class="ri-hourglass-fill"></i>
          </div>
          <div class="info">
            <div class="name">Countdown</div>
            <div class="desc">Recurring events</div>
          </div>
          <div class="add-icon"><i class="ri-add-line"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ visible: boolean }>()
  const emit = defineEmits(['close', 'add'])

  const select = (type: string) => {
    emit('add', type)
    emit('close')
  }
</script>

<style lang="less" scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 110; // 比 LinkModal 高
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fade-in 0.2s;
  }

  .gallery-card {
    width: 320px;
    background: rgba(30, 30, 35, 0.9);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 20px;
    color: #fff;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    animation: slide-up 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      .close-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        font-size: 20px;
        &:hover {
          color: #fff;
        }
      }
    }

    .grid-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .widget-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.02);
          .add-icon {
            opacity: 1;
            transform: translateX(0);
          }
        }
        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          &:hover {
            transform: none;
            background: rgba(255, 255, 255, 0.05);
          }
        }

        .preview {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: rgba(255, 255, 255, 0.8);

          &.hito {
            background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
            .lines {
              display: flex;
              flex-direction: column;
              gap: 4px;
              width: 24px;
              span {
                height: 2px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 2px;
                &:first-child {
                  width: 100%;
                }
                &:last-child {
                  width: 60%;
                }
              }
            }
          }
          &.clock {
            background: #333;
          }
        }

        .info {
          flex: 1;
          .name {
            font-size: 14px;
            font-weight: 600;
          }
          .desc {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 2px;
          }
        }

        .add-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.2s;
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
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
