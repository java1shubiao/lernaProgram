<template>
  <form :class="[formClassName, attrs.class]" @submit="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, defineExpose, computed, useAttrs, defineEmits, watch } from 'vue';
import { warning } from '@xiaoe/uni-ui/lib/xe-utils/warning';
import { classNames, toArray } from '@xiaoe/uni-ui/lib/xe-utils/utils';
import {
  IValidateFields,
  IGetFieldsValue,
  IValidationRule,
  InternalNamePath,
  IValidateErrorEntity,
  RuleError,
  NamePath,
  FormLabelAlign,
  IFieldExpose
} from './types';
import { cloneByNamePathList, getNamePath, containsNamePath, isEqualName } from './utils/valueUtils';
import { allPromiseFinish } from './utils/asyncUtils';
import { defaultValidateMessages } from './utils/messages';
import { useProvideForm } from './context';

interface IFormProps {
  colon?: boolean; // 是否展示label后面的冒号, 只在layout 为 horizontal 时生效
  hideRequiredMark?: boolean; // 隐藏所有表单项的必选标记
  labelAlign?: FormLabelAlign; // label标签文本对齐方式
  labelWrap?: boolean; // label标签是否换行
  layout?: 'horizontal' | 'vertical' | 'inline'; // 表单布局
  name?: string;
  model?: object; // 表单数据对象
  rules?: { [k: string]: IValidationRule[] | IValidationRule } | undefined; // 表单验证规则
  validateOnRuleChange?: boolean; // 是否在rules属性改变后立即触发一次校验
  requiredMark?: boolean; // 是否具有必填标志, 优先级比hideRequiredMark更高
  prefixCls?: string; // 前缀class
  validateMessages: object; // 校验信息
  validateTrigger?: string | string[]; // 校验时机
}

const props = withDefaults(defineProps<IFormProps>(), {
  colon: false,
  hideRequiredMark: false,
  labelAlign: 'right',
  labelWrap: false,
  layout: 'horizontal',
  model: undefined,
  rules: undefined,
  validateOnRuleChange: true,
  requiredMark: undefined,
  prefixCls: '',
  name: '',
  validateTrigger: undefined,
  validateMessages: () => ({})
});

const emit = defineEmits<{
  (e: 'submit', event: Event): void;
  (e: 'finish', values: any): void;
  (e: 'finishFailed', errors: IValidateErrorEntity): void;
  (e: 'validate', name: string | number | (string | number)[], status: boolean, errors: string[] | null): void;
}>();

const requiredMark = computed(() => props.requiredMark);
// ? 高级类型Record, 以string为键的类型, IFieldExpose为值的类型组合的键值对
const fields: Record<string, IFieldExpose> = {};
// const lastValidatePromise = ref();
const mergedRequiredMark = computed(() => {
  if (requiredMark.value !== undefined) {
    return requiredMark.value;
  }
  if (props.hideRequiredMark) {
    return false;
  }
  return true;
});
const validateMessages = computed(() => ({
  ...defaultValidateMessages,
  ...props.validateMessages
}));

const attrs = useAttrs();

// * 获取表单数据对象中的指定或全部值
const getFieldsValue: IGetFieldsValue = (nameList = true) => {
  // nameList为true说明没有传, 直接取出所有的表单数据
  if (nameList === true) {
    const allNameList: any[] = [];
    Object.values(fields).forEach(({ namePath }) => {
      allNameList.push(namePath.value);
    });
    return cloneByNamePathList(props.model, allNameList);
  } else {
    // 否则取出表单中需要的数据
    return cloneByNamePathList(props.model, nameList);
  }
};

const addField = (eventKey: string, field: IFieldExpose) => {
  fields[eventKey] = field;
};

// * 移除某一项
const removeField = (eventKey: string) => {
  delete fields[eventKey];
};

// * 通过键名查找form表单绑定的值
const getFieldsByNameList = (nameList: NamePath) => {
  const provideNameList = !!nameList;
  const namePathList = provideNameList ? toArray(nameList).map(getNamePath) : [];
  if (!provideNameList) {
    // * 查找全部
    return Object.values(fields);
  } else {
    // * 查找目标对象
    return Object.values(fields).filter(
      (field) => namePathList.findIndex((namePath) => isEqualName(namePath, field.fieldName.value)) > -1
    );
  }
};

// * 清除表单项
const resetFields = (name: NamePath) => {
  if (!props.model) {
    warning(false, 'Form', 'model是使用resetFields的必传参数');
    return;
  }
  getFieldsByNameList(name).forEach((field) => {
    field.resetField();
  });
};

// * 清除校验
const clearValidate = (name: NamePath) => {
  getFieldsByNameList(name).forEach((field) => {
    field.clearValidate();
  });
};

// * 校验所有的表单项
const validateFields: IValidateFields = (nameList, options) => {
  warning(
    !(nameList instanceof Function),
    'Form',
    'validateFields/validateField/validate 不支持回调函数, 请使用promise替代'
  );
  if (!props.model) {
    // model为必传字段
    warning(false, 'Form', 'model对于校验表单项是必传字段');
    return Promise.reject(new TypeError('Form: model对于校验表单项是必传字段'));
  }

  const isProvideNameList = !!nameList;

  // * 如果nameList存在, 则将其转换为二维数组
  const namePathList: InternalNamePath[] = isProvideNameList ? toArray(nameList).map(getNamePath) : [];

  // * 用于收集校验规则以及执行结果或错误
  const promiseList: Promise<{
    name: InternalNamePath;
    errors: string[];
  }>[] = [];

  Object.values(fields).forEach((field) => {
    if (!isProvideNameList) {
      // * 若没有提供键名数组, 那么将直接从field中去取
      namePathList.push(field.namePath.value);
    }

    // * 不存在fields, 直接跳过这一次循环
    if (!field.rules?.value.length) {
      return;
    }

    // * 获取field上的namePath
    const fieldNamePath = field.namePath.value;

    // * 将表单项的校验规则添加到上面定义的promiseList中
    if (!isProvideNameList || containsNamePath(namePathList, fieldNamePath)) {
      const promise = field.validateRules({
        validateMessages: validateMessages.value,
        ...options
      });

      promiseList.push(
        promise
          .then<any, RuleError>(() => ({ name: fieldNamePath, errors: [], warnings: [] }))
          .catch((ruleErrors: RuleError[]) => {
            const mergedErrors: string[] = []; // 合并后的错误信息
            const mergedWarnings: string[] = []; // 合并后的提示信息

            ruleErrors.forEach(({ rule: { warningOnly }, errors }) => {
              if (warningOnly) {
                mergedWarnings.push(...errors);
              } else {
                mergedErrors.push(...errors);
              }
            });

            if (mergedErrors.length) {
              // 只要进入此处, 就会被 allPromiseFinish 后执行的promise.catch捕获
              return Promise.reject({
                name: fieldNamePath,
                errors: mergedErrors,
                warnings: mergedWarnings
              });
            }

            // ? 否则将来到此处, 通过.then拿到返回值
            return {
              name: fieldNamePath,
              errors: mergedErrors,
              warnings: mergedWarnings
            };
          })
      );
    }
  });

  // 最终执行完的promise
  const summaryPromise = allPromiseFinish(promiseList);

  const returnPromise = summaryPromise
    .then(() => {
      // * 校验已经通过
      return Promise.resolve(getFieldsValue(namePathList));
    })
    .catch((results) => {
      // * 校验未通过, 存在error的情况
      const errorList = results.filter((res: any) => res && res.errors.length);
      return Promise.reject({
        values: getFieldsValue(namePathList),
        errorFields: errorList,
        outOfDate: false
      });
    });

  // * 错误穿透
  returnPromise.catch((e) => e);

  return returnPromise;
};

// * 校验失败逻辑(也许后续会需要一个滚动到失败处, 暂时先提出来)
const handleFinishFailed = (errorInfo: IValidateErrorEntity) => {
  emit('finishFailed', errorInfo);
};

// * 做个区分, 用于校验单独表单项
const validate = (...args: any[]) => {
  return validateFields(...args);
};

const handleSubmit = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  emit('submit', e);
  if (props.model) {
    const res = validateFields();
    res
      .then((values) => {
        emit('finish', values);
      })
      .catch((errors) => {
        handleFinishFailed(errors);
      });
  }
};

const formClassName = computed(() =>
  classNames(props.prefixCls, {
    [`${props.prefixCls}-${props.layout}`]: true,
    [`${props.prefixCls}-hide-required-mark`]: mergedRequiredMark.value === false
  })
);

// * 向下提供provide, 让所有的子组件共享context
useProvideForm({
  model: computed(() => props.model),
  vertical: computed(() => props.layout === 'vertical'),
  name: computed(() => props.name),
  colon: computed(() => props.colon),
  labelAlign: computed(() => props.labelAlign),
  labelWrap: computed(() => props.labelWrap),
  requiredMark: computed(() => props.requiredMark),
  addField,
  removeField,
  validateTrigger: computed(() => props.validateTrigger),
  rules: computed(() => props.rules),
  onValidate: (name, status, errors) => {
    emit('validate', name, status, errors);
  },
  validateMessages
});

watch(
  () => props.rules,
  () => {
    if (props.validateOnRuleChange) {
      validateFields();
    }
  }
);

defineExpose({
  props,
  attrs,
  formClassName,
  getFieldsValue,
  validate,
  validateFields,
  resetFields,
  clearValidate,
  handleSubmit
});
</script>
<style lang="scss" scoped></style>
