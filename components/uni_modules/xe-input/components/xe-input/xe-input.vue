<template>
  <view
    class="xe-input"
    :style="{ width: numToRpx(props.width), height: numToRpx(props.height), ...props.inputStyles }"
    @tap="handleInputClick(true)"
  >
    <slot name="prefix" />
    <input
      ref="inputRef"
      class="xe-input-inner"
      :placeholder="props.placeholder"
      :placeholderStyle="props.placeholderStyle"
      :placeholderClass="props.placeholderClass"
      :disabled="props.disabled"
      :maxlength="props.maxlength"
      :cursorSpacing="props.cursorSpacing"
      :focus="props.focus || focus"
      :confirmType="props.confirmType"
      :confirmHold="props.confirmHold"
      :cursor="props.cursor"
      :selectionStart="props.selectionStart"
      :selectionEnd="props.selectionEnd"
      :adjustPosition="props.adjustPosition"
      :holdKeyboard="props.holdKeyboard"
      :autoBlur="props.autoBlur"
      :value="props.value"
      :type="props.type"
      :password="props.password"
      :style="{
        fontSize: `${props.fontSize}rpx`,
        width: `${props.inputWidth}rpx`,
        backgroundColor: props?.inputStyles?.backgroundColor || ''
      }"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @confirm="handleConfirm"
    />
    <XeIcon
      v-show="props.allowClear && isShowClear"
      type="clear"
      size="32rpx"
      color="#999"
      :styles="{
        position: 'absolute',
        right: '32rpx',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '999'
      }"
      @tap.stop="handleClear"
    />
    <slot name="suffix" />
  </view>
</template>

<script setup lang="ts">
import {
  defineEmits,
  defineProps,
  withDefaults,
  ref,
  Ref,
  nextTick,
  useSlots,
  computed,
  watch,
  getCurrentInstance
} from 'vue';
import XeIcon from '@xiaoe/uni-ui/lib/xe-icons/xe-icons.vue';
import { useInjectFormItemContext, IFormItemContext } from '@xiaoe/uni-ui/lib/xe-form/formItemContext';
import useState from '@xiaoe/uni-ui/lib/xe-hooks/useState';
import { numToRpx } from '@xiaoe/uni-ui/lib/xe-utils/utils';

const props = withDefaults(
  defineProps<{
    value?: string; // input的值
    type?: 'text' | 'number' | 'idcard' | 'digit' | 'tel'; // 输入框类型
    password?: boolean; // 密码
    placeholder?: string; // 占位字符
    placeholderStyle?: string; // 指定placeholder样式
    placeholderClass?: string; // 指定placeholder的class名
    disabled?: boolean; // 是否禁用
    maxlength?: number; // 最大长度, 设置为-1不限制
    cursorSpacing?: number; // 指定光标与键盘的距离
    focus?: boolean; // 获取焦点
    confirmType?: string; // 设置键盘右下角按钮的文字，仅在 type="text" 时生效。
    confirmHold?: boolean; // 点击键盘右下角按钮时是否保持键盘不收起
    cursor?: number; // 指定focus时的光标位置
    selectionStart?: number; // 光标起始位置，自动聚集时有效，需与selection-end搭配使用
    selectionEnd?: number; // 光标结束位置，自动聚集时有效，需与selection-start搭配使用
    adjustPosition?: boolean; // 键盘弹起时，是否自动上推页面
    holdKeyboard?: boolean; // focus时，点击页面的时候不收起键盘
    autoBlur?: boolean; // 键盘收起时，是否自动失去焦点
    allowClear?: boolean; // 是否允许清除
    fontSize?: number; // input输入框字体大小
    width?: string | number; // 整体宽度
    height?: string | number; // 整体高度
    inputWidth?: string;
    isFocusWidthFull?: boolean; // 是否拉宽focus范围
    // ! 主要在于字节小程序确认父子关系较晚, setup阶段无法获取父组件信息, 导致inject失败, 因此, Provide在字节小程序中将provide到全局
    isValidate?: boolean; // 是否需要校验错误(由于provide在字节小程序下是提供到全局的, 会导致inject时, 直接拿到前一次provide中更新的错误值)
    inputStyles?: Record<string, any>; // 外部自定义style
    inputPaddingLeft?: string | number; // 输入框左侧padding
    inputPaddingRight?: string | number; // 输入框右侧padding
    maskLeftOffset?: number | string; // 遮罩层左侧移动距离(字节专用)
  }>(),
  {
    value: '',
    type: 'text',
    password: false,
    placeholder: '请输入',
    placeholderStyle: 'color: #b2b2b2',
    placeholderClass: '',
    disabled: false,
    maxlength: 140,
    cursorSpacing: 0,
    focus: undefined,
    confirmType: '确认',
    confirmHold: false,
    cursor: undefined,
    selectionStart: -1,
    selectionEnd: -1,
    adjustPosition: true,
    holdKeyboard: false,
    autoBlur: false,
    fontSize: 28,
    width: 400,
    height: 96,
    allowClear: false,
    inputWidth: '',
    isFocusWidthFull: false,
    isValidate: true,
    inputPaddingLeft: 32,
    inputPaddingRight: 32,
    maskLeftOffset: 0,
    inputStyles: () => ({})
  }
);

const isShowClear: Ref<boolean> = ref(false);

const inputRef = ref();

const [focus, setFocus] = useState(false);

const [isCleared, setIsCleared] = useState<boolean>(false);

const formItemContext: IFormItemContext = useInjectFormItemContext();

const instance = getCurrentInstance();

const inputBorderColor = computed(() => {
  return props.isValidate && formItemContext?.hasErrorList?.value ? '#FF4747' : '#ebebeb';
});

const handleInputClick = (isNeedFocusWidthFull = true) => {
  if (isNeedFocusWidthFull) {
    props.isFocusWidthFull && setFocus(true);
  }
};

const emit = defineEmits<{
  (e: 'input', value: string): void; // 输入
  (e: 'change', value: string): void; // 改变
  (e: 'focus', target: any): void; // 聚焦
  (e: 'blur', target: any): void; // 失焦
  (e: 'confirm', target: any): void; // 点击确认
  (e: 'update:value', value: string): void;
  (e: 'clear', value: ''): void;
}>();

const handleInput = (e: any) => {
  emit('input', e.target.value);
  emit('update:value', e.target.value);
  // * 字节小程序双向绑定体验极差
  isShowClear.value = !!e.target.value.length;
  nextTick(() => {
    emit('change', e.target.value);
  });
};

watch(
  () => props.value,
  () => {
    // * 需等待formItem中响应式更新, 否则无法获取最新数据导致校验错误
    nextTick(() => {
      formItemContext?.onFieldChange();
      if (isCleared.value) {
        setIsCleared(false);
        formItemContext?.onFieldBlur();
      }
    });
  }
);

const handleFocus = (e: any) => {
  emit('focus', e);
};

const handleBlur = (e: any) => {
  emit('blur', e);
  setFocus(false);
  (instance as any)?.proxy?.$forceUpdate?.();
  nextTick(() => {
    formItemContext?.onFieldBlur();
  });
};

const handleConfirm = (e: any) => {
  emit('confirm', e);
  setFocus(false);
};

const handleClear = (event?: Event) => {
  event?.stopPropagation?.();
  const e = { target: { value: '' } };
  handleInput(e);
  emit('clear', '');
  setIsCleared(true);
  setFocus(false);
};

const slots = useSlots();
const paddingLeft = computed(() => {
  return slots.prefix ? '0' : numToRpx(props.inputPaddingLeft);
});

const paddingRight = computed(() => {
  return slots.suffix ? '0' : numToRpx(props.inputPaddingRight);
});

const maskWidth = computed(() => {
  const slotsArr = [!!slots.prefix, !!slots.suffix, !!(props.allowClear && isShowClear.value)];
  return props.inputWidth ? `${props.inputWidth}rpx` : `${100 - slotsArr.filter((item) => item).length * 15}%`;
});
</script>
<style lang="scss" scoped>
.xe-input {
  box-sizing: border-box;
  height: 96rpx;
  border: 1rpx solid v-bind(inputBorderColor);
  background-color: #fff;
  color: #333;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  position: relative;
  width: 400rpx;
  position: relative;
  .xe-input-inner {
    box-sizing: border-box;
    background-color: #fff;
    height: 40rpx;
    color: #333;
    width: v-bind(maskWidth);
    padding-right: v-bind(paddingRight);
    padding-left: v-bind(paddingLeft);
    font-size: 28rpx;
    box-sizing: border-box;
  }
}
</style>
