<template>
  <view
    class="xe-card"
    :style="{
      width: typeof props.width === 'string' ? props.width : `${props.width}rpx`,
      minHeight: typeof props.height === 'string' ? props.height : `${props.height}rpx`,
      ...props.styles
    }"
    @click="handleClick"
  >
    <view v-if="props.isNeedTitle" class="xe-card-title">
      <slot v-if="slots.title" name="title" />
      <text v-else class="xe-card-title-text normal-text">
        <slot v-if="slots.title" name="title-prefix" />
        {{ props.title }}
      </text>
    </view>
    <view class="xe-card-content">
      <slot v-if="slots.content" name="content" />
      <text v-else class="xe-card-content-text weight-text">{{ props.content }}</text>
    </view>
    <view v-if="props.isNeedFoot" class="xe-card-foot">
      <slot v-if="slots.foot" name="foot" />
      <text v-else class="xe-card-foot-text normal-text">
        {{ props.content }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, defineEmits, useSlots } from 'vue'

const emits = defineEmits<{
  (e: 'click', target: any): void
}>()

const props = withDefaults(
  defineProps<{
    title?: string // 标题 string | slot
    content?: string // 内容 string | slot
    foot?: string // 底部内容 string | slot
    height?: string | number // 高度
    width?: string | number // 宽度
    isNeedTitle?: boolean // 是否需要标题
    isNeedFoot?: boolean // 是否需要卡片脚
    styles?: any // 样式
  }>(),
  {
    title: '标题',
    content: '内容',
    foot: '卡片底部内容',
    height: '304rpx',
    width: '686rpx',
    isNeedTitle: true,
    isNeedFoot: true,
    styles: () => ({})
  }
)

const slots = useSlots()

const handleClick = (e: any) => {
  emits('click', e)
}
</script>
<style lang="scss" scoped>
view {
  box-sizing: border-box;
}
.xe-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 24rpx 16rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  .normal-text {
    color: #666666;
    font-size: 24rpx;
  }
  .weight-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 900;
  }
  .xe-card-title {
    width: 100%;
    height: 24rpx;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .xe-card-content {
    width: 100%;
    min-height: 128rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24rpx;
  }

  .xe-card-foot {
    width: 100%;
    height: 72rpx;
    border-top: 1px solid #ebebeb;
    padding-top: 14rpx;
    display: flex;
    align-items: center;
  }
}
</style>
