import { toArray } from '@xiaoe/uni-ui/lib/xe-utils/utils';
import get from './get';
import set from './set';
import isEqual from 'lodash-es/isEqual';
import type { InternalNamePath, NamePath } from '../types';

export const isObject = (obj: any) => {
  return typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === Object.prototype;
};

export const getNamePath = (path: NamePath | null): InternalNamePath => {
  return toArray(path);
};

// * 获取数据值, 数组自左向右代表处理数据对象的深度
export const getValue = <T>(store: T, namePaths: InternalNamePath): any => {
  return get(store, namePaths);
};

// * 设置数据值, 数组自左向右代表处理数据对象的深度
export const setValue = <T>(store: T, namePath: InternalNamePath, value: any, removeIfUndefined = false): T => {
  return set(store, namePath, value, removeIfUndefined);
};

// * 通过pathList深拷贝数据(不可拷贝函数, 正则, 时间等)
export const cloneByNamePathList = <T>(store: T, namePathList: Array<InternalNamePath>): T => {
  let newStore = {} as T;
  namePathList.forEach((namePath) => {
    const value = getValue(store, namePath);
    newStore = setValue(newStore, namePath, value);
  });
  return newStore;
};

/**
 * 将values装进store, 同时返回拷贝后的对象
 * 实际上就是深度赋值, 如果目标是一个值类型, 则会替换原来的值, 如果目标是一个引用, 则会扩展, 如下
 * ({ a: 1, b: { c: 2 } }, { a: 4, b: { d: 5 } }) => { a: 4, b: { c: 2, d: 5 } }
 */
function internalSetValues<T>(store: T, values: T): T {
  const newStore: T = (Array.isArray(store) ? [...store] : { ...store }) as T;

  if (!values) {
    return newStore;
  }

  Object.keys(values).forEach((key) => {
    const prevValue = newStore[key];
    const value = values[key];

    // 如果当前对比的两个值都是对象, 但是目标值并不是数组对象, 将递归赋值
    const recursive = isObject(prevValue) && isObject(value);
    newStore[key] = recursive ? internalSetValues(prevValue, value || {}) : value;
  });

  // 返回合并后的对象
  return newStore;
}

/**
 * 批量更新操作
 * @param {T} store - 需要更新的原始数据对象
 * @param {T} restValues - 接收所有需要更新的值
 * @returns {T} 被更新后的数据对象
 */
export function setValues<T>(store: T, ...restValues: T[]): T {
  return restValues.reduce((current: T, newStore: T) => internalSetValues(current, newStore), store);
}

// * 比对namePath
export function matchNamePath(namePath: InternalNamePath, changedNamePath: InternalNamePath | null) {
  if (!namePath || !changedNamePath || namePath.length !== changedNamePath.length) {
    // * 快速过滤明显不等的情况, 无需进入遍历
    return false;
  }
  // * 由于namePath都是数组, 因此一定要每一个位置上的值都对应上了, 他们才相等
  return namePath.every((nameUnit, i) => changedNamePath[i] === nameUnit);
}

// * 查看在二维数组namePathList中是否存在当前传入的namePath
export function containsNamePath(namePathList: InternalNamePath[], namePath: InternalNamePath) {
  return namePathList && namePathList.some((path) => matchNamePath(path, namePath));
}

/**
 * Checks if two name paths are equal.
 * @param {NamePath} name1 - the first name path to compare
 * @param {NamePath} name2 - the second name path to compare
 * @returns {boolean} - true if the name paths are equal, false otherwise
 */
export function isEqualName(name1: NamePath, name2: NamePath) {
  return isEqual(toArray(name1), toArray(name2));
}
