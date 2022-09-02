<template>
  <view class="xe-empty">
    <image
      class="xe-empty-img"
      mode="aspectFit"
      :src="props.emptyImgUrl"
      :style="{
        width: typeof props.width === 'string' ? props.width : `${props.width}rpx`,
        height: typeof props.height === 'string' ? props.height : `${props.height}rpx`
      }"
    />
    <text v-if="!slots.text" class="xe-empty-text">{{ props.emptyText }}</text>
    <slot v-else name="text" />
  </view>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, useSlots } from 'vue'
const props = withDefaults(
  defineProps<{
    emptyText?: string
    emptyImgUrl?: string
    height?: string | number
    width?: string | number
  }>(),
  {
    emptyText: '暂无数据',
    emptyImgUrl: 'https://commonresource-1252524126.cdn.xiaoeknow.com/image/l0rvhehp02xx.png',
    height: '176rpx',
    width: '176rpx'
  }
)
const slots = useSlots()
</script>
<style lang="scss" scoped>
view {
  box-sizing: border-box;
}
.xe-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  .xe-empty-text {
    height: 40rpx;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    color: #999;
    margin-top: 48rpx;
  }
}
</style>
