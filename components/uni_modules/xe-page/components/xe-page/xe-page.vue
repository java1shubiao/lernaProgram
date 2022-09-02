<template>
  <view :class="classNams">
    <view v-if="slots.title" class="xe-page-title-container">
      <slot name="title" />
    </view>
    <view class="xe-page-content">
      <slot />
      <view v-if="isNeedStatus" class="status-container">{{ statusText }}</view>
    </view>
    <view v-if="slots.foot" :class="['xe-page-foot']">
      <slot name="foot" />
    </view>
    <XePageFoot
      v-else
      :is-show-site-domain="props.isShowSiteDomain"
      :is-relative="props.isRelative"
      :grey="props.grey"
      :light="props.light"
      @get-foot-height="handleGetFootHeight"
    />
  </view>
</template>

<script setup lang="ts">
import { useSlots, withDefaults, defineProps, onBeforeMount, ref, Ref, computed, ComputedRef } from 'vue';
import XePageFoot from '@xiaoe/uni-ui/lib/xe-page/xe-page-foot.vue';
import { getHeight, COMPLETE, LOADING, START, EMPTY, status, statusType } from '@xiaoe/uni-ui/lib/xe-page/utils';

const heightTitle: Ref<number> = ref(0);

const heightFoot: Ref<number> = ref(0);

const classNams: Ref<string> = ref('xe-page');

const minContentHeight: ComputedRef<string> = computed(() => {
  return `calc(100vh - ${heightFoot.value + heightTitle.value}px)`;
});

const handleGetFootHeight = (height: number) => {
  heightFoot.value = height > heightFoot.value ? height : heightFoot.value;
};

const props = withDefaults(
  defineProps<{
    isShowSiteDomain?: boolean; // 是否展示页脚的域名
    grey?: boolean; // 页脚是否背景为grey
    light?: boolean; // 页脚背景是否为白色
    isRelative?: boolean; // 页脚是否使用fixed固定在最下方
    backType: string;
    status: statusType;
    isNeedStatus?: boolean; // 是否需要加载状态
  }>(),
  {
    isShowSiteDomain: false,
    grey: false,
    light: false,
    isRelative: false,
    backType: 'default',
    status: 3,
    isNeedStatus: true
  }
);

const statusText = computed(() => {
  switch (status[props.status]) {
    case LOADING:
      return '加载中...';
    case COMPLETE:
      return '没有更多数据了';
    case START:
      return '上拉加载更多';
    case EMPTY:
      return '暂无数据';
    default:
      return '上拉加载更多';
  }
});

// * 计算页脚是否回到最下方
onBeforeMount(async () => {
  heightTitle.value = await getHeight('.xe-page-title-container');
  const curHeightFoot = await getHeight('.xe-page-foot');
  heightFoot.value = curHeightFoot > heightFoot.value ? curHeightFoot : heightFoot.value;
  if (props.backType === 'grey') classNams.value = `${classNams.value} xe-page-grayBk`;
});

const slots = useSlots();
</script>
<style lang="scss" scoped>
.xe-page-grayBk {
  background-color: #f5f5f5;
}
.xe-page-content {
  min-height: v-bind(minContentHeight);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 32rpx 0 32rpx;
}
.xe-page-foot-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
}

.status-container {
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  margin-top: 48rpx;
  margin-bottom: 32rpx;
  color: #b2b2b2;
  text-align: center;
  font-size: 28rpx;
}
</style>
