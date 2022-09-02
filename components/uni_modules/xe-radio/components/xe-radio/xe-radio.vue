<template>
  <view class="xe-radio" :style="props.styles" @click="handleChange">
    <XeIcon :type="iconType" :size="iconSize" :color="iconColor" />
    <text class="radio-text" :style="{ color: props.value ? '#333' : '#ccc' }">{{ content }}</text>
  </view>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, defineEmits, computed, ComputedRef } from 'vue';
import XeIcon from '@xiaoe/uni-ui/lib/xe-icons/xe-icons.vue';

const props = withDefaults(
  defineProps<{
    value?: boolean; // 是否选中
    content?: string; // 文案
    styles?: string; // 样式
    iconSize?: string; // 图标大小
  }>(),
  {
    value: false,
    content: '内容',
    styles: '',
    iconSize: '32rpx'
  }
);

const iconType: ComputedRef<string> = computed(() => {
  return props.value ? 'radio-checked' : 'radio-uncheck';
});

const iconColor: ComputedRef<string> = computed(() => {
  return props.value ? '#1472ff' : '#ccc';
});

const emit = defineEmits<{
  (e: 'change', value: boolean): void;
  (e: 'update:value', value: boolean): void;
}>();

const handleChange = () => {
  emit('change', !props.value);
  emit('update:value', !props.value);
};
</script>
<style lang="scss" scoped>
.xe-radio {
  height: 40rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  .radio-text {
    margin-left: 8rpx;
    font-size: 24rpx;
    height: 24rpx;
    line-height: 24rpx;
  }
}
</style>
