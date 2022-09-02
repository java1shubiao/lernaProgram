import RawAsyncValidator from 'async-validator';
import type { InternalNamePath, RuleObject, ValidateOptions, RuleError } from '../types';
import { warning } from '@xiaoe/uni-ui/lib/xe-utils/warning';
import { setValues } from './valueUtils';
import { defaultValidateMessages } from './messages';

// 移除原有的ts类型定义
const AsyncValidator: any = RawAsyncValidator;

/**
 * 通过错误信息模板生成真实的错误信息
 * @param {string} template 原始模板
 * @param {Record<string, string>} kv 一串错误信息组成的键值对
 * @returns {string} 填补模板中${}部分后的真实错误信息
 */
const replaceMessage = (template: string, kv: Record<string, string>): string => {
  return template.replace(/\$\{\w+\}/g, (str: string) => {
    // str代表的就是正则取出来那一段, 也就是一串字符串中的 ${xxx}, 一个字符串中有几个, 就会执行几次该回调
    // 这个slice将寻找字符串的'${', 然后从第三位开始取(也就是过滤掉 '${' ), 一直取到最后一位的前一位为止(这里也是过滤后面的 '}'), 从而获取真正的key
    // * 这里有个现实场景, 就是message是以模板的方式存在的 -> "Validation error on field '${name}'", 这样拿到的key就是 'name'
    // * 而这个kv键值对, 实际上代表的就是数据对象的键以及规则等组合的一个对象
    const key = str.slice(2, -1);
    return kv[key];
  });
};

async function validateRule(
  name: string,
  value: any,
  rule: RuleObject,
  options: ValidateOptions,
  messageVariables?: Record<string, string>
): Promise<string[]> {
  // * 浅拷贝 rule对象
  const cloneRule = { ...rule };

  // 处理 `async-validator` 的 bug, 这两个属性有问题, 需要去除
  delete (cloneRule as any).ruleIndex;
  delete (cloneRule as any).trigger;

  // 数组校验需要特殊处理
  let subRuleField: RuleObject | null = null;
  // * defaultField, Array类型的规则才有该属性
  if (cloneRule && cloneRule.type === 'array' && cloneRule.defaultField) {
    // * 暂存后移除
    subRuleField = cloneRule.defaultField;
    delete cloneRule.defaultField;
  }

  // ? async-validator, 传入一个键名为name, 键值为描述规则的一个对象, 可以得到一个validator(也就是校验器, 内部有一个validate方法), 具体查看async-validator文档, 此处不做展开
  const validator = new AsyncValidator({
    [name]: [cloneRule]
  });

  // 合并defaultValidateMessages和传入的validateMessages, 得到最终的messages
  const messages = setValues({}, defaultValidateMessages, options.validateMessages);
  // 通过实例的messages方法添加相关的错误信息
  validator.messages(messages);

  // * 结果数组
  let result = [];

  try {
    // ? 核心就是通过validator.validate进行校验
    await Promise.resolve(validator.validate({ [name]: value }, { ...options }));
  } catch (errObj: any) {
    // * 抛出错误信息并处理
    if (errObj.errors) {
      result = errObj.errors.map(({ message }: any) => message);
    } else {
      console.error(errObj);
      result = [(messages?.default as () => string)()];
    }
  }

  // * 处理数组类型校验值的错误信息(约定上rule是一个数组, 那么value也是数组)
  if (!result.length && subRuleField) {
    const subResults: string[][] = await Promise.all(
      (value as any[]).map((subValue: any, i: number) =>
        validateRule(`${name}.${i}`, subValue, subRuleField as RuleObject, options, messageVariables)
      )
    );

    return subResults.reduce((prev, errors) => [...prev, ...errors], []);
  }

  // * 转换前的结果信息, 将进入通过replaceMessage进行转换(就是填充模板)
  // * keyValue简写(其余此处一样)
  const kv = {
    ...(rule as Record<string, string | number>),
    name,
    enum: (rule.enum || []).join(', '),
    ...messageVariables
  };

  const fillVariableResult = result.map((error: any) => {
    if (typeof error === 'string') {
      // * 填充模板
      return replaceMessage(error, kv);
    }
    // * 非字符串类型的错误信息直接返回
    return error;
  });

  return fillVariableResult;
}

export function validateRules(
  namePath: InternalNamePath,
  value: any,
  rules: RuleObject[],
  options: ValidateOptions,
  validateFirst: boolean | 'parallel',
  messageVariables?: Record<string, string>
) {
  const name = namePath.join('.'); // 转换为一串用 '.' 隔开的字符串

  // 填充rule
  const filledRules: RuleObject[] = rules
    .map((currentRule, ruleIndex) => {
      // * 暂存自定义规则上的validator
      const originValidatorFunc = currentRule.validator;
      const cloneRule = {
        ...currentRule,
        ruleIndex
      };

      // 转换validator(处理promise兼容)
      if (originValidatorFunc) {
        cloneRule.validator = (rule: RuleObject, val: any, callback: (error?: string) => void) => {
          // * 标志变量, 如果暂存的originValidatorFunc(自定义validator)执行结果是一个promise, 则会标记为true, 如此将不会执行callback
          let hasPromise = false;

          // * wrappedCallback只能在没有提供promise时接受
          const wrappedCallback = (...args: Array<string | undefined>): void => {
            // 这里要确保返回类型是一个promise
            Promise.resolve().then(() => {
              warning(!hasPromise, '校验函数返回了一个promise. `callback`将不会执行.');
              // * 说明callback执行需要滞后, 等待promise.then回调执行, 这里主要是看originValidatorFunc是否返回一个promise对象, 来决定是否立即触发callback
              if (!hasPromise) {
                callback(...args);
              }
            });
          };

          // 获取执行结果
          const promise = originValidatorFunc(rule, val, wrappedCallback);
          hasPromise = (promise &&
            typeof promise.then === 'function' &&
            typeof promise.catch === 'function') as boolean;

          // 优先选择使用promise, 而不是一个同步回调, 因此在使用同步回调时候, 将会进行抛错(此处做兼容, 但是不建议同步回调)
          warning(hasPromise, '同步`callback` 已被弃用, 请使用promise`callback`替代');

          if (hasPromise) {
            (promise as Promise<void>)
              .then(() => {
                callback();
              })
              .catch((err) => {
                callback(err || ' ');
              });
          }
        };
      }
      return cloneRule;
    })
    .sort(({ warningOnly: w1, ruleIndex: i1 }, { warningOnly: w2, ruleIndex: i2 }) => {
      // * 排序
      if (!!w1 === !!w2) {
        // 保持原有的顺序不变
        return i1 - i2;
      }

      if (w1) {
        return 1;
      }

      return -1;
    });

  // 存储错误信息以及验证规则相关参数的promise
  let summaryPromise: Promise<RuleError[]>;

  if (validateFirst === true) {
    // 顺序校验
    // eslint-disable-next-line no-async-promise-executor
    summaryPromise = new Promise(async (resolve, reject) => {
      for (let i = 0; i < filledRules.length; i += 1) {
        const rule = filledRules[i];
        // * 执行校验
        const errors = await validateRule(name, value, rule, options, messageVariables);
        if (errors.length) {
          reject([{ errors, rule }]);
          return;
        }
      }
      resolve([]);
    });
  } else {
    // 并行校验
    const rulePromises: Promise<RuleError>[] = filledRules.map((rule) =>
      validateRule(name, value, rule, options, messageVariables).then((errors) => ({ errors, rule }))
    );

    // * validateFirst可能是'parallel'
    summaryPromise = (validateFirst ? finishOnFirstFailed(rulePromises) : finishOnAllFailed(rulePromises)).then(
      (errors: RuleError[]): RuleError[] | Promise<RuleError[]> => {
        // 此处一定会更改为error来捕获错误
        return Promise.reject<RuleError[]>(errors);
      }
    );
  }

  // Internal catch error to avoid console error log.
  summaryPromise.catch((e) => e);

  return summaryPromise;
}

/**
 * Takes in a list of promises and returns a promise that resolves when all of the promises have resolved.
 * @param {Promise<RuleError>[]} rulePromises - the list of promises to wait for.
 * @returns A promise that resolves when all of the promises have resolved.
 */
async function finishOnAllFailed(rulePromises: Promise<RuleError>[]): Promise<RuleError[]> {
  return Promise.all(rulePromises).then((errorsList: RuleError[]): RuleError[] | Promise<RuleError[]> => {
    // * 此处统一以errors接收
    const errors: RuleError[] = [].concat(errorsList as never[]);

    return errors;
  });
}

/**
 * Takes in an array of promises and returns a promise that resolves when the first promise
 * in the array resolves.
 * @param {Promise<RuleError>[]} rulePromises - the array of promises to resolve.
 * @returns {Promise<RuleError[]>} - a promise that resolves when the first promise in the array
 * resolves.
 */
async function finishOnFirstFailed(rulePromises: Promise<RuleError>[]): Promise<RuleError[]> {
  let count = 0;

  return new Promise((resolve) => {
    rulePromises.forEach((promise) => {
      // * 按照遍历顺序执行
      promise.then((ruleError) => {
        if (ruleError.errors.length) {
          // * 只要有一条抛错就抛错
          resolve([ruleError]);
        }

        count += 1;
        if (count === rulePromises.length) {
          // * 结束后还没有抛错说明没有错误
          resolve([]);
        }
      });
    });
  });
}
