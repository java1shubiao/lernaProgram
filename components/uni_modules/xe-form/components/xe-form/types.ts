import type { VNode, ComputedRef, Ref } from 'vue';

declare type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;

export type VueNode = VNodeChildAtom | VNodeChildAtom[] | JSX.Element;

export type InternalNamePath = (string | number)[];

export type NamePath = string | number | InternalNamePath;

export type FormLabelAlign = 'left' | 'right';

// * 表单数据对象
export type StoreValue = any;

export interface Store {
  [name: string]: StoreValue;
}

export interface Meta {
  touched: boolean;
  validating: boolean;
  errors: string[];
  name: InternalNamePath;
}

export interface InternalFieldData extends Meta {
  value: StoreValue;
}

/**
 * Used by `setFields` config
 */
export interface FieldData extends Partial<Omit<InternalFieldData, 'name'>> {
  name: NamePath;
}

export type RuleType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'method'
  | 'regexp'
  | 'integer'
  | 'float'
  | 'object'
  | 'enum'
  | 'date'
  | 'url'
  | 'hex'
  | 'email';

type Validator = (rule: RuleObject, value: StoreValue, callback: (error?: string) => void) => Promise<void> | void;

export interface ValidatorRule {
  warningOnly?: boolean;
  message?: string | VueNode;
  validator: Validator;
}

interface BaseRule {
  warningOnly?: boolean; // 仅警告
  enum?: StoreValue[]; // 枚举类型
  len?: number; // 字段长度
  max?: number; // 最大长度
  message?: string | VueNode; // 校验文案
  min?: number; // 最小长度
  pattern?: RegExp; // 正则校验
  required?: boolean; // 是否必传
  transform?: (value: StoreValue) => StoreValue; // 校验前转换字段值
  type?: RuleType; // 内建校验类型
  whitespace?: boolean; // 必选时, 空格是否会被视为错误
  validateTrigger?: string | string[]; // 自定义的validateTrigger必须是validateTrigger的子集
}

// * Partial 将类型中所有的定义都修改为可选
type AggregationRule = BaseRule & Partial<ValidatorRule>;

export type RuleObject = AggregationRule | ArrayRule;

export interface IFieldError {
  name: InternalNamePath | string;
  errors: string[];
}

// Omit<T, K> 类型表示从 T 对象中剔除 K 属性
export interface ArrayRule extends Omit<AggregationRule, 'type'> {
  type: 'array';
  defaultField?: RuleObject;
}

export type Rule = RuleObject;

export interface RuleError {
  errors: string[];
  rule: RuleObject;
}

export type IValidationRule = {
  // * 错误信息
  message?: VueNode;
  // * 校验的类型, options文档: https://github.com/yiminghe/async-validator#type
  type?: string;
  // * 是否必须
  required?: boolean;
  // * 是否将包含空格的必填字段视为错误, 如 " "
  whitespace?: boolean;
  // * 校验目标数据的长度
  len?: number;
  // * 校验目标数据最短数量
  min?: number;
  // * 校验目标数据最长数量
  max?: number;
  // * 验证是否为枚举列表中的数据
  enum?: string | string[];
  // * 正则校验
  pattern?: RegExp;
  // * 校验前转换数据类型
  transform?: (value: any) => any;
  // ! 自定义校验函数, callback必须被执行
  validator?: (rule: any, value: any, callback: any, source?: any, options?: any) => any;
  trigger?: string;
};

// * 校验信息类型
type ValidateMessage = string | (() => string);
export interface ValidateMessages {
  default?: ValidateMessage;
  required?: ValidateMessage;
  enum?: ValidateMessage;
  whitespace?: ValidateMessage;
  date?: {
    format?: ValidateMessage;
    parse?: ValidateMessage;
    invalid?: ValidateMessage;
  };
  types?: {
    string?: ValidateMessage;
    method?: ValidateMessage;
    array?: ValidateMessage;
    object?: ValidateMessage;
    number?: ValidateMessage;
    date?: ValidateMessage;
    boolean?: ValidateMessage;
    integer?: ValidateMessage;
    float?: ValidateMessage;
    regexp?: ValidateMessage;
    email?: ValidateMessage;
    url?: ValidateMessage;
    hex?: ValidateMessage;
  };
  string?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  number?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  array?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  pattern?: {
    mismatch?: ValidateMessage;
  };
}

export interface ValidateOptions {
  triggerName?: string;
  validateMessages?: ValidateMessages;
}

// * field需要暴露的内容
export interface IFieldExpose {
  fieldValue: Ref<any>; // 子项数据
  fieldId: ComputedRef<any>; // 子项id
  fieldName: ComputedRef<any>; // 子项名称
  resetField: () => void; // 重置子项
  clearValidate: () => void; // 清除校验
  namePath: ComputedRef<InternalNamePath>; // 键名数组
  rules?: ComputedRef<IValidationRule[]>; // 规则数组
  validateRules: (options: ValidateOptions) => Promise<void> | Promise<RuleError[]>; // 校验规则
}

// * 主动校验表单数据
export type IValidateFields = (
  nameList?: NamePath[] | string,
  options?: ValidateOptions
) => Promise<{ [key: string]: any }>;

// * 重置表单
export type IResetFields = (name?: NamePath) => void;

// * 清除校验
export type IClearValidate = (name?: NamePath) => void;

// * 获取表单值
export type IGetFieldsValue = (nameList?: InternalNamePath[] | true) => { [key: string]: any };

// * 校验函数
export type IValidate = (nameList?: NamePath[] | string, options?: ValidateOptions) => Promise<{ [key: string]: any }>;

// * 必填标识约束
export type RequiredMark = boolean | 'optional';

export type IOnValidate = (
  name: string | number | string[] | number[],
  status: boolean,
  errors: string[] | null
) => void;

export interface ICallbacks<Values = any> {
  onValuesChange?: (changedValues: any, values: Values) => void;
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: IValidateErrorEntity<Values>) => void;
  onValidate?: IOnValidate;
}

export interface IValidateErrorEntity<Values = any> {
  values: Values;
  errorFields: { name: InternalNamePath; errors: string[] }[];
  outOfDate: boolean;
}
