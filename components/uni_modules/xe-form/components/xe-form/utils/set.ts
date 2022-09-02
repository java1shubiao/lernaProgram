import get from './get';

// * 基本set方法
/**
 *
 * @param entity 存储数据的实体对象
 * @param paths 需要设置的数据, 采用键名数组的方式入参
 * @param value 设置的值
 * @param removeIfUndefined undefined时是否从存储对象中移除
 * @returns clone 赋值后浅拷贝的数据对象
 */
function internalSet<Entity = any, Output = Entity, Value = any>(
  entity: Entity,
  paths: (string | number)[],
  value: Value,
  removeIfUndefined: boolean
): Output {
  // * path为空的情况, 说明缺乏键名, 则直接返回入参的值, 且不对数据模型做处理
  if (!paths.length) {
    return value as unknown as Output;
  }

  const [path, ...restPath] = paths;

  let clone: Output;
  if (!entity && typeof path === 'number') {
    // * 数据对象不存在, clone直接初始化为空数组
    clone = [] as unknown as Output;
  } else if (Array.isArray(entity)) {
    // * 数据对象是一个数组, 浅拷贝数据对象
    clone = [...entity] as unknown as Output;
  } else {
    // * 数据对象为正常的对象数据类型, 同样浅拷贝数据对象
    clone = { ...entity } as unknown as Output;
  }

  // 用于移除操作, 比如 path为 ["obj1", "obj2"], entity 为 {obj1: {obj2: {...}}} => {obj1: {obj2: {}}}
  if (removeIfUndefined && value === undefined && restPath.length === 1) {
    delete clone[path][restPath[0]];
  } else {
    // 递归赋值, 如果paths第一次入参是一个长度大于1的数组, 则表示按照顺序从左到右的层次往深处赋值, 如 ["val", "val1", "val2"] => {val: {val1: {val2: value}}}
    clone[path] = internalSet(clone[path], restPath, value, removeIfUndefined);
  }

  return clone;
}

export default function set<Entity = any, Output = Entity, Value = any>(
  entity: Entity,
  paths: (string | number)[],
  value: Value,
  removeIfUndefined = false
): Output {
  if (
    paths.length &&
    removeIfUndefined &&
    value === undefined &&
    !get(entity, paths.slice(0, -1)) // 返回值为数据对象中目标键的parent, 此处为true, 表示目标键的parent为undefined, 在removeIfUndefined为true的情况下, 在进入internalSet方法是无意义的
  ) {
    // 满足上述条件则不赋值
    return entity as unknown as Output;
  }

  return internalSet(entity, paths, value, removeIfUndefined);
}
