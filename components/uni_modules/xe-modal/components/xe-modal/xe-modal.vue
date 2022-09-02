<template>
  <view class="xe-modal xe-modal-body" :style="{ display: visible ? 'block' : 'none' }" :catchtouchmove="true">
    <view class="xe-modal-mask" @click="handleClose(true)" />
    <view
      class="xe-modal-container"
      :style="`
        width: ${typeof props.width === 'string' ? props.width : `${props.width}rpx`};
        min-height: ${typeof props.height === 'string' ? props.height : `${props.height}rpx`};
        ${
        position === 'center'
          ? `top: 50%; left: 50%; transform: translate(-50%, -50%); border-bottom-left-radius: 20rpx; border-bottom-right-radius: 20rpx;`
          : `bottom: 0;`
      }
      ${containerStyles}
      `"
      @click="props?.clickContainer"
    >
      <view v-if="!slots.title" class="modal-title">
        {{ props.title }}
      </view>
      <slot name="title" />
      <view v-if="!slots.content" class="modal-content">
        {{ props.contentText }}
      </view>
      <slot name="content" />
      <slot name="beforeBtn" />
      <view v-if="props.isShowBtn" class="button-container">
        <XeButton type="default" :styles="btnStyles" @click="handleCancel">
          {{ props.cancelText }}
        </XeButton>
        <XeButton type="primary" :styles="btnStyles" @click="handleConfirm">
          {{ props.confirmText }}
        </XeButton>
      </view>
      <slot name="afterBtn" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, withDefaults, ref, Ref, watchEffect, useSlots } from 'vue';
import XeButton from '@xiaoe/uni-ui/lib/xe-button/xe-button.vue';

const slots = useSlots();

const visible: Ref<boolean> = ref(false);

const btnStyles: string = 'width: 320rpx; height: 80rpx';

const props = withDefaults(
  defineProps<{
    value?: boolean; // 是否弹出弹窗
    containerStyles?: string; // 弹窗容器样式扩展
    width?: number | string; // 容器宽度
    height?: number | string; // 容器高度
    position?: 'center' | 'bottom'; // 容器位置
    isShowBtn?: boolean; // 是否展示按钮
    cancelText?: string; // 取消文案
    confirmText?: string; // 确认文案
    title?: string; // 弹窗标题
    contentText?: string; // 内容文案
    isShowTitle?: boolean; // 是否展示标题
    isMaskClose?: boolean; // 是否可以点击遮罩层关闭弹窗
    clickContainer?: () => void;
  }>(),
  {
    value: false,
    containerStyles: '',
    width: '400rpx',
    height: '400rpx',
    position: 'bottom',
    isShowBtn: false,
    cancelText: '取消',
    confirmText: '确定',
    title: '弹窗',
    contentText: '内容',
    isShowTitle: true,
    isMaskClose: true,
    clickContainer: () => {}
  }
);

watchEffect(() => {
  visible.value = props.value;
});

const emit = defineEmits<{
  (e: 'close', target: boolean): void;
  (e: 'update:value', target: boolean): void;
  (e: 'cancel'): void;
  (e: 'confirm'): void;
  (e: 'clickMask'): void;
}>();

const handleClose = (isMaskClose: boolean) => {
  if (isMaskClose && props.isMaskClose) {
    emit('close', false);
    emit('update:value', false);
  }
  emit('clickMask');
};

const handleCancel = () => {
  handleClose(false);
  emit('cancel');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>
<style lang="scss" scoped>
.xe-modal {
  view {
    box-sizing: border-box;
  }
  display: none;
  &.xe-modal-body {
    position: fixed;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    top: 0;
    left: 0;
    z-index: 999;
    .xe-modal-mask {
      position: fixed;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.3);
    }
    .xe-modal-container {
      position: fixed;
      background-color: #fff;
      border-top-left-radius: 20rpx;
      border-top-right-radius: 20rpx;
      z-index: 9999;
      padding: 40rpx 32rpx 48rpx 32rpx;
    }
  }
  .button-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .modal-title {
    min-height: 116rpx;
    font-size: 28rpx;
  }
  .modal-content {
    font-size: 28rpx;
    min-height: 116rpx;
  }
}
</style>
