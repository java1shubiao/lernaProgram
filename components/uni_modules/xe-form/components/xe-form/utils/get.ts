const get = (entity: any, path: (string | number)[]): any => {
  let current = entity; // 存储数据的对象
  for (let i = 0; i < path.length; i += 1) {
    if (current === null || current === undefined) {
      return undefined;
    }
    // * path数组约定长度为1, path表示往深度取值
    // * e.g.: get({a: {b: 10}}, ["a", "b"]) => 10;  get({a: 10, b: "20"}, ["a", "b"]) => undefined; get({a: 10, b: "20"}, ["a"]) => 10;
    current = current[path[i]];
  }
  return current;
};

export default get;
