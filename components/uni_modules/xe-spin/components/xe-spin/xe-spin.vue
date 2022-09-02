<template>
  <view
    class="xe-spin"
    :style="{
      width: typeof props.width === 'string' ? props.width : `${props.width}rpx`,
      height: typeof props.height === 'string' ? props.height : `${props.height}rpx`,
      display: props.isLoading ? 'block' : 'none'
    }"
  >
    <view class="container">
      <view class="load-line rotate-0">
        <view class="left"></view>
        <view class="right"></view>
      </view>
      <view class="load-line rotate-30">
        <view class="left"></view>
        <view class="right"></view>
      </view>
      <view class="load-line rotate-60">
        <view class="left"></view>
        <view class="right"></view>
      </view>
      <view class="load-line rotate-90">
        <view class="left"></view>
        <view class="right"></view>
      </view>
      <view class="load-line rotate-120">
        <view class="left"></view>
        <view class="right"></view>
      </view>
      <view class="load-line rotate-150">
        <view class="left"></view>
        <view class="right"></view>
      </view>
    </view>
    <text class="xe-spin-text">{{ props.loadingText }}</text>
  </view>
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from 'vue'
const props = withDefaults(
  defineProps<{
    width?: string | number
    height?: string | number
    isLoading?: boolean
    loadingText?: string
  }>(),
  {
    width: '750rpx',
    height: '300rpx',
    isLoading: false,
    loadingText: '加载中..'
  }
)
</script>
<style lang="scss" scoped>
view {
  box-sizing: border-box;
}
.xe-spin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}
.load-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 66rpx;
  height: 8rpx;
}
.load-line > view {
  display: inline-block;
  width: 20%;
  height: 100%;
  border-radius: 40rpx;
  background: #000;
}
.left {
  float: left;
}
.right {
  float: right;
}
.rotate-0 {
  transform: translate(-50%, -50%) rotate(0);
}
.rotate-0 > .left {
  animation: load-effect 1.2s linear 0s infinite;
}
.rotate-0 > .right {
  animation: load-effect 1.2s linear 0.6s infinite;
}
.rotate-30 {
  transform: translate(-50%, -50%) rotate(30deg);
}
.rotate-30 > .left {
  animation: load-effect 1.2s linear 0.1s infinite;
}
.rotate-30 > .right {
  animation: load-effect 1.2s linear 0.7s infinite;
}
.rotate-60 {
  transform: translate(-50%, -50%) rotate(60deg);
}
.rotate-60 > .left {
  animation: load-effect 1.2s linear 0.2s infinite;
}
.rotate-60 > .right {
  animation: load-effect 1.2s linear 0.8s infinite;
}
.rotate-90 {
  transform: translate(-50%, -50%) rotate(90deg);
}
.rotate-90 > .left {
  animation: load-effect 1.2s linear 0.3s infinite;
}
.rotate-90 > .right {
  animation: load-effect 1.2s linear 0.9s infinite;
}
.rotate-120 {
  transform: translate(-50%, -50%) rotate(120deg);
}
.rotate-120 > .left {
  animation: load-effect 1.2s linear 0.4s infinite;
}
.rotate-120 > .right {
  animation: load-effect 1.2s linear 1s infinite;
}
.rotate-150 {
  transform: translate(-50%, -50%) rotate(150deg);
}
.rotate-150 > .left {
  animation: load-effect 1.2s linear 0.5s infinite;
}
.rotate-150 > .right {
  animation: load-effect 1.2s linear 1.1s infinite;
}
@keyframes load-effect {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}
.xe-spin-text {
  height: 40rpx;
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #999;
  display: block;
  position: absolute;
  left: 50%;
  top: 60%;
  transform: translateX(-50%);
}
</style>
