const warned: Record<string, boolean> = {};
export function baseWarning(valid: boolean, message: string) {
  // 主要在构建后的生产环境生效
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    console.error(`Warning: ${message}`);
  }
}

/**
 *
 * @param valid 条件, 为false则抛出错误
 * @param component 标识的组件
 * @param message 错误信息
 */
export const warning = (valid: boolean, component: string, message = '') => {
  baseWarning(valid, `[xiaoe-uni-ui: ${component}] ${message}`);
};

export function call(method: (valid: boolean, message: string) => void, valid: boolean, message: string) {
  if (!valid && !warned[message]) {
    method(false, message);
    warned[message] = true;
  }
}

// * 仅触发一次的warning
export const warningOnce = (valid: boolean, message: string) => {
  call(baseWarning, valid, message);
};

// * 开发环境用warning
export const devWarning = (valid: boolean, component: string, message: string): void => {
  warningOnce(valid, `[xiaoe-uni-ui: ${component}] ${message}`);
};
