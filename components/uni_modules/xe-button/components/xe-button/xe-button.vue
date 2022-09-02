<template>
  <button
    :class="['xe-button', `${props.type}`]"
    :disabled="props.disabled"
    :loading="props.loading"
    :formType="props.formType"
    :openType="props.openType"
    :hoverClass="props.hoverClass"
    :hoverStayTime="props.hoverStayTime"
    :hoverStartTime="props.hoverStartTime"
    :hoverStopPropagation="props.hoverStopPropagation"
    :style="props.styles"
    @getphonenumber="getPhoneNumber"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, withDefaults } from 'vue'
const props = withDefaults(
  defineProps<{
    disabled?: boolean // 是否禁用
    loading?: boolean // 是否加载中
    formType?: string // 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件
    openType?: string // 开放能力
    hoverClass?: string // 指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果
    hoverStartTime?: number // 按住后多久出现点击态，单位毫秒
    hoverStayTime?: number // 手指松开后点击态保留时间，单位毫秒
    hoverStopPropagation?: boolean // 指定是否阻止本节点的祖先节点出现点击态
    type?: 'default' | 'primary' | 'warning' // 按钮类型
    styles?: string // 按钮样式
  }>(),
  {
    disabled: false,
    loading: false,
    formType: '',
    openType: '',
    hoverClass: 'hover',
    hoverStartTime: 20,
    hoverStayTime: 70,
    hoverStopPropagation: false,
    type: 'default',
    styles: ''
  }
)

const emit = defineEmits<{
  (e: 'getphonenumber', target: any): void
  (e: 'click', target: any): void
}>()

const getPhoneNumber = (e: any) => {
  emit('getphonenumber', e)
}

const handleClick = (e: any) => {
  emit('click', e)
}
</script>
<style lang="scss" scoped>
.xe-button {
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: 28rpx;
}
.xe-button::after {
  border: none;
}
.xe-button.default {
  background-color: #fff;
  border: 1rpx solid #ccc;
  color: #333;
}
.xe-button.default.hover {
  background-color: rgba(219, 220, 220, 1);
  border-color: rgba(219, 220, 220, 1);
}
.xe-button.primary {
  background-color: #1472ff;
  border-color: #1472ff;
  color: #fff;
}
.xe-button.primary.hover {
  background-color: #096dd9;
  border-color: #096dd9;
}
.xe-button.warning {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #fff;
}
.xe-button.warning.hover {
  background-color: #d9363e;
  border-color: #d9363e;
}
</style>
