import type { IFieldError } from '../types';

// 用于执行promise数组(Promise.allsettled不足以提供下面的能力)
export function allPromiseFinish(promiseList: Promise<IFieldError>[]): Promise<IFieldError[]> {
  let hasError = false;
  let count = promiseList.length;
  const results: IFieldError[] = [];

  if (!promiseList.length) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    promiseList.forEach((promise, index) => {
      promise
        .catch((e) => {
          // * 这里捕获是前一次catch中通过Promise.reject返回的值
          hasError = true;
          return e;
        })
        .then((result) => {
          // * 这里的result分两种情况, 一个是参数promise中then中返回值, 一个是参数promise中catch中的返回值
          count -= 1;
          results[index] = result;

          if (count > 0) {
            // 只要数量没有清零, 就说明promise还没有执行完
            return;
          }

          if (hasError) {
            reject(results);
          }
          resolve(results);
        });
    });
  });
}
