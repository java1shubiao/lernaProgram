<template>
  <view
    v-show="visible"
    class="xe-alert-tips"
    :style="{ 'background-color': `${props.backgroundColor}`, color: `${props.fontColor}` }"
  >
    <XeIcon v-show="showIcon" :type="prefixIconType" size="24" :color="props.fontColor" @click="close" />
    <view class="xe-alert-title" @click="handleClick">
      <view :class="['xe-alert-content', showScrollAlert && 'alert-scroll-text']">
        {{ title }}
      </view>
      <view :class="['xe-alert-content', showScrollAlert && 'alert-scroll-text']">
        <slot name="content"></slot>
      </view>
    </view>
    <XeIcon v-show="closeable" type="close" size="24" :color="props.fontColor" @click="close" />
  </view>
</template>

<script setup lang="ts">
import XeIcon from '@xiaoe/uni-ui/lib/xe-icons/xe-icons.vue';
import { getWidth } from '@xiaoe/uni-ui/lib/xe-page/utils';

import { defineProps, withDefaults, Ref, ref, onBeforeMount, defineEmits } from 'vue';
const props = withDefaults(
  defineProps<{
    title?: string; // 标题 string | slot
    showIcon?: boolean; // 是否显示前缀图标
    prefixIconType?: string; // 前缀的icon图标类型
    backgroundColor?: string; // 背景颜色
    fontColor?: string; // 文字颜色
    closeable?: boolean; // 是否有关闭按钮
  }>(),
  {
    title: '',
    showIcon: false,
    prefixIconType: 'alert',
    backgroundColor: '#EBF3FF',
    fontColor: '#1472FF',
    closeable: false
  }
);

const visible: Ref<boolean> = ref(true);

const showScrollAlert: Ref<boolean> = ref(false);

// 判断是否滚动
onBeforeMount(async () => {
  const alertWrapWidth = await getWidth('.xe-alert-title');
  const alertTextWidth = await getWidth('.xe-alert-content');
  if (alertTextWidth > alertWrapWidth) {
    showScrollAlert.value = true;
  }
});

const close = () => {
  visible.value = false;
};

const emit = defineEmits<{
  (e: 'click', target: any): void;
}>();

const handleClick = (e: any) => {
  emit('click', e);
};
</script>

<style lang="scss" scoped>
.xe-alert-tips {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  padding: 0 32rpx;
  width: 750rpx;
}
.xe-alert-title {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  margin: 0 16rpx;
  .xe-alert-content {
    white-space: nowrap;
    display: inline-block;
  }
  .alert-scroll-text {
    animation: notableAnimation 35s linear infinite;
  }
}
@keyframes notableAnimation {
  0% {
    left: 30%;
  }
  100% {
    transform: translateX(-100%);
    left: 0;
  }
}
</style>
