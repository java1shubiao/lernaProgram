<template>
  <view
    :class="{
      'xe-fab': true,
      'position-top': isTop,
      'position-bottom': !isTop,
      'position-left': isLeft,
      'position-right': !isLeft
    }"
    :style="{ display: props.visible ? 'block' : 'none' }"
    @click="handleClick"
  >
    <XeIcon
      v-if="!slots.content"
      :type="props.iconType"
      size="64rpx"
      color="#fff"
      :styles="{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }"
    />
    <slot v-else name="content" />
  </view>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, withDefaults, useSlots } from 'vue'
import XeIcon from '@xiaoe/uni-ui/lib/xe-icons/xe-icons.vue'
const TOP = 'top'
const LEFT = 'left'
// const RIGHT = 'right';
// const BOTTOM = 'bottom'

const slots = useSlots()

const props = withDefaults(
  defineProps<{
    horizontal?: 'left' | 'right' // 水平位置
    vertical?: 'top' | 'bottom' // 纵向位置
    visible?: boolean
    iconType?: string
    width?: string
    height?: string
    verticalPosition?: string | number // 纵向距离
    horizontalPosition?: string | number // 水平距离
  }>(),
  {
    horizontal: 'left',
    vertical: 'top',
    visible: false,
    iconType: 'add',
    width: '160rpx',
    height: '160rpx',
    verticalPosition: 0,
    horizontalPosition: 0
  }
)

const emit = defineEmits<{
  (e: 'click', target: any): void // 点击事件
}>()

const handleClick = (e: any) => {
  emit('click', e)
}

const isTop = computed(() => {
  return props.vertical === TOP
})

const isLeft = computed(() => {
  return props.horizontal === LEFT
})

const width = computed(() => {
  return typeof props.width === 'string' ? props.width : `${props.width}rpx`
})

const height = computed(() => {
  return typeof props.height === 'string' ? props.height : `${props.height}rpx`
})

// * 纵向移动距离
const verticalDistance = computed(() => {
  return typeof props.verticalPosition === 'string' ? props.verticalPosition : `${props.verticalPosition}rpx`
})

// * 水平移动距离
const horizontalDistance = computed(() => {
  return typeof props.horizontalPosition === 'string' ? props.horizontalPosition : `${props.horizontalPosition}rpx`
})
</script>
<style lang="scss" scoped>
view {
  box-sizing: border-box;
}
.xe-fab {
  position: fixed;
  width: v-bind(width);
  height: v-bind(height);
  background-color: #1472ff;
  box-shadow: 0 1px 5px 2px rgb(0 0 0 / 30%);
  border-radius: 50%;
}
.position-top {
  top: v-bind(verticalDistance);
}

.position-bottom {
  bottom: v-bind(verticalDistance);
}

.position-right {
  right: v-bind(horizontalDistance);
}

.position-left {
  left: v-bind(horizontalDistance);
}
</style>
