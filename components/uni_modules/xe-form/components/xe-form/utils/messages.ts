import { ValidateMessages } from '../types';

const typeTemplate = "'${name}'类型错误, 需要的类型是: ${type}!";

// * 默认的一些校验信息, 这里先占位, 如有必要在补充
// * 默认违规从async-Validator中获取, 但起本身不具备翻译包, 以下为手动翻译
export const defaultValidateMessages: Partial<ValidateMessages> = {
  default: "字段'${name}'验证错误!",
  required: "'${name}'是必填的!",
  enum: "'${name}'必须是[${enum}]其中之一!",
  whitespace: "'${name}'不能为空!",
  date: {
    format: "'${name}'格式日期无效!",
    parse: "'${name}'无法被解析为日期!",
    invalid: "'${name}'日期无效!"
  },
  types: {
    string: typeTemplate,
    method: typeTemplate,
    array: typeTemplate,
    object: typeTemplate,
    number: typeTemplate,
    date: typeTemplate,
    boolean: typeTemplate,
    integer: typeTemplate,
    float: typeTemplate,
    regexp: typeTemplate,
    email: typeTemplate,
    url: typeTemplate,
    hex: typeTemplate
  },
  string: {
    len: "'${name}'恰好需要${len}个字符!",
    min: "'${name}'至少有${min}个字符!",
    max: "'${name}'不能超过${max}个字符!",
    range: "'${name}'字符长度在${min}和${max}之间!"
  },
  number: {
    len: "'${name}'必须等于${len}!",
    min: "'${name}'不能少于${min}!",
    max: "'${name}'不能大于${max}!",
    range: "'${name}'必须在${min}和${max}之间!"
  },
  array: {
    len: "'${name}'数组的长度必须是${len}!",
    min: "'${name}'数组的长度不能少于${min}!",
    max: "'${name}'数组的长度不能大于${max}!",
    range: "'${name}'数组的长度必须在${min}和${max}之间!"
  },
  pattern: {
    mismatch: "'${name}'不匹配${pattern}!"
  }
};
