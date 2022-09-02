export const baseGetId = (): (() => number) => {
  // * 保证绝对不重复
  let indexGId = 0;
  return () => {
    return indexGId++;
  };
};

export const getId: () => number = baseGetId();
