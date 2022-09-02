<template>
  <text :style="iStyle" :class="['iconfont', iClass]" @click="_onClick"></text>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, withDefaults, computed } from 'vue';
const getVal = (val: any) => {
  const reg = /^[0-9]*$/g;
  return typeof val === 'number' || reg.test(val) ? val + 'rpx' : val;
};

const props = withDefaults(
  defineProps<{
    type?: string;
    color?: string;
    size?: number | string;
    customPrefix?: string;
    styles?: object;
  }>(),
  {
    type: '',
    color: '#333',
    size: 16,
    customPrefix: '',
    styles: () => ({})
  }
);

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const iconSize = computed(() => {
  return getVal(props.size);
});

const iStyle = computed(() => {
  return { color: props.color, 'font-size': iconSize.value, ...props.styles };
});

const iClass = computed(() => {
  return `xe-${props.type} ${props.customPrefix} ${props.customPrefix ? props.type : ''}`;
});

const _onClick = () => {
  emit('click');
};
</script>

<style lang="scss">
@import './xeIcons.css';
</style>
