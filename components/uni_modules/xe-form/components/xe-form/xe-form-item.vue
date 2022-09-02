<template>
  <view :class="itemClassName">
    <label v-if="props.label" :class="labelClassName" @click="onLabelClick">{{ props.label }}</label>
    <view class="xe-form-item-container" :style="props.itemStyle">
      <view class="xe-form-item-content">
        <slot />
      </view>
      <template v-for="(error, index) in debounceErrors" :key="index">
        <view class="message-container">
          {{ Array.isArray(error) ? error?.[0] : error }}
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import {
  ref,
  defineProps,
  defineEmits,
  defineExpose,
  watch,
  watchEffect,
  computed,
  nextTick,
  withDefaults,
  useAttrs,
  toRaw
} from 'vue';
import cloneDeep from 'lodash-es/cloneDeep';
import { toArray } from '@xiaoe/uni-ui/lib/xe-utils/utils';
import find from 'lodash-es/find';
import { validateRules as validateRulesUtil } from './utils/validateUtils';
import { getNamePath } from './utils/valueUtils';
import { ValidateStatus, useInjectForm, IFormContextProps } from './context';
import { FormLabelAlign, IValidationRule, RuleObject, ValidateOptions, RuleError } from './types';
import { getId } from './utils/getId';
import useDebounce from '@xiaoe/uni-ui/lib/xe-hooks/useDebounce';
import { useProvideFormItemContext } from './formItemContext';

const VALIDATING = 'validating';
const ERROR = 'error';
const SUCCESS = 'success';
const WARNING = 'warning';

// * 获取规则等绑定的信息
const getPropByPath = (obj: any, namePathList: any, strict?: boolean) => {
  let tempObj = obj;
  const keyArr = namePathList;
  let i = 0;
  try {
    for (let len = keyArr.length; i < len - 1; ++i) {
      // * 如果tempObj不存在直接退出循环
      if (!tempObj && !strict) break;
      // 取出字段
      const key = keyArr[i];
      if (key in tempObj) {
        tempObj = tempObj[key];
      } else {
        if (strict) {
          throw Error('需要一个有效的名称路径');
        }
        break;
      }
    }
    if (strict && !tempObj) {
      throw Error('需要一个有效的名称路径');
    }
  } catch (err) {
    console.error('需要一个有效的名称路径');
  }

  return {
    origin: tempObj, // 原始数据(表单数据, form.model)
    key: keyArr[i], // 校验的键名
    value: tempObj ? tempObj[keyArr[i]] : undefined // 校验的键值
  };
};

const props = withDefaults(
  defineProps<{
    colon?: boolean; // 是否有冒号
    label?: string; // label标签文本
    labelAlign?: FormLabelAlign; // 对齐方式
    name?: string; // 表单域 model 字段, 在使用在使用 validate、resetFields 方法的情况下，该属性是必填的
    required?: boolean; // 是否必填
    rules?: Array<any> | Record<string | number, any>; // 校验规则
    validateFirst?: boolean; // 当某一个规则校验不通过, 则立即停止校验其他规则
    validateStatus?: ValidateStatus; // 校验状态, 如不设置，则会根据校验规则自动生成，可选：'success' 'warning' 'error' 'validating'
    validateTrigger?: string | string[]; // 校验时机
    autoLink?: boolean; // 是否触发自动校验(通过formItem插槽所需要的表单项如input等的validateTrigger时机触发校验)
    itemStyle?: string;
  }>(),
  {
    colon: true,
    label: '',
    labelAlign: 'right',
    name: undefined,
    required: false,
    rules: () => ({}),
    validateFirst: false,
    validateStatus: undefined,
    validateTrigger: 'change',
    autoLink: true,
    itemStyle: ''
  }
);

const emit = defineEmits<{
  (e: 'labelClick', target: Event): void;
}>();

const defaultItemNamePrefixCls = 'xe_form_item';

const eventKey = `form-item-${getId()}`;

// * form注入内容
const formContext = useInjectForm();
// * 表单域model字段
const fieldName = computed(() => props.name);
// * 错误信息
const errors: Ref<string[] | string[][]> = ref([]);
const validateDisabled = ref(false);
const namePath = computed(() => {
  const val = fieldName.value;
  return getNamePath(val);
});
const fieldId = computed(() => {
  if (!namePath.value.length) {
    return undefined;
  } else {
    const formName = formContext?.name?.value;
    const mergeId = namePath.value.join('_');
    return formName ? `${formName}_${mergeId}` : `${defaultItemNamePrefixCls}_${mergeId}`;
  }
});

const getNewFieldValue = () => {
  // * form的model
  const model = formContext?.model?.value;
  if (!model || !fieldName.value) {
    // * 该formItem下没有绑定值
    return;
  } else {
    return getPropByPath(model, namePath.value, true).value;
  }
};

const fieldValue = computed(() => getNewFieldValue());

// * 初始化字段值, 需要深拷贝, 否则会受校验后的影响导致发生不可预测的风险
const initialValue = ref(cloneDeep(fieldValue.value));

// * 合并validateTrigger, 如果item与form中都没有, 则默认使用change
const mergedValidateTrigger = computed(() => {
  let validateTrigger =
    props.validateTrigger !== undefined ? props.validateTrigger : formContext?.validateTrigger?.value;
  validateTrigger = validateTrigger === undefined ? 'change' : validateTrigger;
  return toArray(validateTrigger);
});

// * 合并form中的rule与自身的rule同时校验是否必填
const rulesRef = computed<IValidationRule[]>(() => {
  let formRules = formContext?.rules?.value;
  const selfRules = props.rules;
  const requiredRules =
    props.required !== undefined ? { required: !!props.required, trigger: mergedValidateTrigger.value } : [];
  const prop = getPropByPath(formRules, namePath.value);
  formRules = formRules ? prop.origin[prop.key] || prop.value : [];
  // * 优先取自己
  const rules = [].concat((selfRules || formRules || []) as never[]);
  if (find(rules, (rule: any) => rule.required)) {
    return rules;
  } else {
    return rules.concat(requiredRules as never[]);
  }
});

const isRequired = computed(() => {
  const rules = rulesRef.value;
  let isRequired = false;
  if (rules && rules.length) {
    rules.every((rule) => {
      if (rule.required) {
        isRequired = true;
        // * 用于停止遍历
        return false;
      }
      return true;
    });
  }
  return isRequired || props.required;
});

const validateState = ref();
watchEffect(() => {
  validateState.value = props.validateStatus;
});

const messageVariables = computed(() => {
  const variables: Record<string, string> = {};
  if (typeof props.label === 'string') {
    variables.label = props.label;
  } else if (props.name) {
    variables.label = String(props.name);
  }
  return variables;
});

const validateRules = (options: ValidateOptions) => {
  if (namePath.value.length === 0) {
    return Promise.resolve();
  }
  const { validateFirst = false } = props;
  const { triggerName } = options;

  let filteredRules = rulesRef.value;
  if (triggerName) {
    // 将需要触发的规则取出来
    filteredRules = filteredRules.filter((rule) => {
      const { trigger } = rule;
      if (!trigger && !mergedValidateTrigger.value.length) {
        return true;
      }
      const triggerList = toArray(trigger || mergedValidateTrigger.value);
      return triggerList.includes(triggerName);
    });
  }
  if (!filteredRules.length) {
    // * 没有取到校验规则直接返回
    return Promise.resolve();
  }
  const promise = validateRulesUtil(
    namePath.value,
    fieldValue.value,
    filteredRules as RuleObject[],
    {
      validateMessages: formContext?.validateMessages.value,
      ...options
    },
    validateFirst,
    messageVariables.value
  );
  // * 修改状态为校验中
  validateState.value = VALIDATING;
  errors.value = [];

  // * 校验函数最终返回的是一个promise实例
  promise
    .catch((e) => e)
    .then((results: RuleError[] = []) => {
      if (validateState.value === VALIDATING) {
        const res = results.filter((ret) => ret && ret.errors.length);
        validateState.value = res.length ? ERROR : SUCCESS;
        // * 获取错误信息
        errors.value = res.map((r) => r.errors);

        // * 触发form表单中的校验回调
        formContext.onValidate(
          fieldName.value,
          !errors.value.length,
          errors.value.length ? toRaw(errors.value[0]) : null
        );
      }
    });

  return promise;
};

const onFieldBlur = () => {
  validateRules({ triggerName: 'blur' });
};

const onFieldChange = () => {
  if (validateDisabled.value) {
    validateDisabled.value = false;
    return;
  }
  validateRules({ triggerName: 'change' });
};

// * 清除校验
const clearValidate = () => {
  validateState.value = props.validateStatus;
  validateDisabled.value = false;
  errors.value = [];
};

const resetField = () => {
  validateState.value = props.validateStatus;
  validateDisabled.value = true;
  errors.value = [];
  const model = formContext?.model?.value || {};
  const value = fieldValue.value;
  const prop = getPropByPath(model, namePath.value, true);
  // * 重置
  if (Array.isArray(value)) {
    prop.origin[prop.key] = [].concat(initialValue.value);
  } else {
    prop.origin[prop.key] = initialValue.value;
  }
  // * 重置期间不允许校验
  nextTick(() => {
    validateDisabled.value = false;
  });
};

const onLabelClick = (e: Event) => {
  emit('labelClick', e);
};

let registered = false;

watch(
  fieldName,
  () => {
    if (!registered) {
      registered = true;
      const field = {
        fieldValue,
        fieldId,
        fieldName,
        resetField,
        clearValidate,
        namePath,
        validateRules,
        rules: rulesRef
      };
      if (formContext) {
        formContext?.addField?.(eventKey, field);
      } else {
        nextTick(() => {
          (formContext as IFormContextProps)?.addField?.(eventKey, field);
        });
      }
    } else {
      // * 首次触发需要移除, 保证以formItem的内容填充fields的数据
      registered = false;
      formContext?.removeField?.(eventKey);
    }
  },
  { immediate: true, deep: true }
);

// * 间歇性更新errors
const debounceErrors = useDebounce(errors as Ref<string[]>);

// * 合并状态
const mergedValidateStatus = computed(() => {
  if (props.validateStatus !== undefined) {
    return props.validateStatus;
  } else if (debounceErrors.value.length) {
    return ERROR;
  }
  return validateState.value;
});

const prefixCls = 'xe-form-item';
const labelPrefixCls = 'xe-label';

const itemClassName = computed(() => ({
  [`${prefixCls}`]: true,
  [`${prefixCls}-has-success`]: mergedValidateStatus.value === SUCCESS,
  [`${prefixCls}-has-warning`]: mergedValidateStatus.value === WARNING,
  [`${prefixCls}-has-error`]: mergedValidateStatus.value === ERROR,
  [`${prefixCls}-horizontal`]: !formContext?.vertical?.value,
  [`${prefixCls}-item-is-validating`]: mergedValidateStatus.value === VALIDATING
}));

const labelClassName = computed(() => ({
  [`${prefixCls}-label`]: true,
  [`${labelPrefixCls}-required`]: isRequired.value,
  [`${labelPrefixCls}-required-mark-optional`]: formContext?.requiredMark?.value === 'optional',
  [`${labelPrefixCls}-no-colon`]: !props.colon
}));

// * 向插槽内部组件提供支持
useProvideFormItemContext(
  {
    id: fieldId,
    onFieldBlur: () => {
      if (props.autoLink) {
        onFieldBlur();
      }
    },
    onFieldChange: () => {
      if (props.autoLink) {
        onFieldChange();
      }
    },
    clearValidate,
    hasErrorList: computed(() => !!debounceErrors.value.length)
  },
  computed(() => {
    return !!(props.autoLink && formContext?.model?.value && fieldName.value);
  })
);

const attrs = useAttrs();

defineExpose({
  onFieldBlur,
  onFieldChange,
  clearValidate,
  attrs,
  itemClassName,
  onLabelClick,
  isRequired,
  labelClassName,
  props,
  debounceErrors,
  resetField
});
</script>
<style lang="scss" scoped>
@import url('./styles/formItem.scss');
.xe-form-item {
  display: flex;
  flex-direction: column;
}

.xe-form-item.xe-form-item-horizontal {
  flex-direction: row;
  align-items: center;
}
.message-container {
  color: #ff4747;
  font-size: 24rpx;
  height: 32rpx;
  margin-top: 16rpx;
}
</style>
