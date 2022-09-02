import type { InjectionKey, ComputedRef } from 'vue';
import { inject, provide, computed } from 'vue';
import { RequiredMark, IValidationRule, ValidateMessages, FormLabelAlign, IFieldExpose, IOnValidate } from './types';
import { defaultValidateMessages } from './utils/messages';

let isMpToutiao: boolean = false;
// #ifdef MP-TOUTIAO
isMpToutiao = true;
// #endif

// * 元组
export const tuple = <T extends string[]>(...args: T) => args;

export const tupleNum = <T extends number[]>(...args: T) => args;

export const ValidateStatuses = tuple('success', 'warning', 'error', 'validating', '');

export type ValidateStatus = typeof ValidateStatuses[number];

// * 约束 FormContext(provide)
export interface IFormContextProps {
  model?: ComputedRef<any>;
  vertical: ComputedRef<boolean | undefined>;
  name?: ComputedRef<string | undefined>;
  colon?: ComputedRef<boolean | undefined>;
  labelAlign?: ComputedRef<FormLabelAlign>;
  labelWrap?: ComputedRef<boolean | undefined>;
  requiredMark?: ComputedRef<RequiredMark>;
  addField: (eventKey: string, field: IFieldExpose) => void;
  removeField: (eventKey: string) => void;
  validateTrigger?: ComputedRef<string | string[] | undefined>;
  rules?: ComputedRef<{ [k: string]: IValidationRule[] | IValidationRule } | undefined>;
  onValidate: IOnValidate;
  validateMessages: ComputedRef<ValidateMessages>;
}

export const FormContextKey: InjectionKey<IFormContextProps> = Symbol('formContextKey');

// ! provide/inject 使用时需要一个统一的key做映射
export const useProvideForm = (state: IFormContextProps) => {
  provide(FormContextKey, state, isMpToutiao);
};

/**
 * 创建可用于将 FormContextKey 注入组件树的上下文对象。
 * @returns {FormContext} 上下文对象
 */
export const useInjectForm = () => {
  return inject(FormContextKey, {
    model: computed(() => undefined),
    name: computed(() => undefined),
    vertical: computed(() => false),
    colon: computed(() => undefined),
    labelAlign: computed(() => 'right' as FormLabelAlign),
    labelWrap: computed(() => undefined),
    requiredMark: computed(() => false),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addField: (eventKey: string, field: IFieldExpose) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeField: (eventKey: string) => {},
    validateTrigger: computed(() => undefined),
    rules: computed(() => undefined),
    onValidate: () => {},
    validateMessages: computed(() => defaultValidateMessages)
  });
};

// ! 以下为错误列表专用
export interface FormItemPrefixContextProps {
  prefixCls: ComputedRef<string>;
  status?: ComputedRef<ValidateStatus>;
}

export const FormItemPrefixContextKey: InjectionKey<FormItemPrefixContextProps> = Symbol('formItemPrefixContextKey');

/**
 * A hook that provides the FormItemPrefixContextKey to the context.
 * @param {FormItemPrefixContextProps} state - The state to provide.
 * @returns void
 */
export const useProvideFormItemPrefix = (state: FormItemPrefixContextProps) => {
  provide(FormItemPrefixContextKey, state, isMpToutiao);
};

/**
 * Injects the FormItemPrefixContextKey into the context.
 * @returns None
 */
export const useInjectFormItemPrefix = () => {
  return inject(FormItemPrefixContextKey, {
    prefixCls: computed(() => '')
  });
};
