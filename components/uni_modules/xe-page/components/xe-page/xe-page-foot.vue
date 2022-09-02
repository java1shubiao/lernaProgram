<template>
  <view
    :class="[
      'bottom-site-market',
      { 'bottom-site-market-abs': isRelative },
      grey ? 'bg-grey' : '',
      light ? 'bg-white' : ''
    ]"
  >
    <view class="bottom-site-marke-wrapper xe-flex-box">
      <image
        class="image"
        src="https://commonresource-1252524126.cdn.xiaoeknow.com/image/l0t78ehd0rr2.png"
        mode="aspectFit"
        style="width: 24rpx; height: 24rpx"
      />
      <text class="site-name"> 小鹅通提供技术支持 </text>
    </view>
    <view v-if="showSiteDomain" class="site-domain"> www.xiaoe-tech.com </view>
    <slot />
  </view>
</template>

<script lang="ts">
// import { defineComponent } from 'vue'
import { getHeight } from '@xiaoe/uni-ui/lib/xe-page/utils'
export default {
  props: {
    isRelative: {
      type: Boolean,
      default: false
    },
    grey: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    },
    showSiteDomain: {
      type: Boolean,
      default: false
    }
  },
  emits: ['getFootHeight'],
  async beforeMount() {
    const footHeight = await getHeight('.bottom-site-market')
    this.$emit('getFootHeight', footHeight)
  }
}
</script>

<style lang="scss" scoped>
.bottom-site-market {
  width: 100%;
  justify-content: space-evenly;
  box-sizing: border-box;
  text-align: center;
  font-size: 24rpx;
  color: #c8c8c8;
  padding-top: 80rpx;
  // 设计说16px, 但是设计稿上是24, 持保留态度
  // padding-bottom: 32rpx;
  padding-bottom: 48rpx;
  &.bottom-site-market-abs {
    position: fixed;
    bottom: 0;
    left: 0;
  }
  .bottom-site-marke-wrapper {
    .image {
      margin-right: 8rpx;
    }
  }
  .site-domain {
    padding-bottom: 10rpx;
  }
}
.xe-flex-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-grey {
  background-color: #f5f5f5;
}
.bg-white {
  background-color: #fff;
}
</style>
