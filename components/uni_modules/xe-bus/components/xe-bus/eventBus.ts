// 由于注册事件的时候可以给同一个事件注册多个函数
// 同时存储事件的时候, 要存储下所有已经订阅的事件

// 事件触发器
export default class EventBus {
  public events: any;
  public handledEvents: any;
  constructor() {
    // Object.create传入的是定义对象的原型, 由于现在只需要存储键值对, 因此这里不需要任何的对象方法, 所以events.__proto__ -> null即可
    // {name: [fn1, fn2]}
    this.events = Object.create(null);
    // 表示已经触发过的事件
    this.handledEvents = Object.create(null);
  }

  // * 触发事件
  $emit(name: string, ...args: any[]) {
    if (this.events[name]) {
      this.events[name].forEach((fn: any) => {
        fn(...args);
      });
    }
    return this;
  }

  // * 注册事件
  $on(name: string, fn: any) {
    if (name) {
      // 保证this.events[name] 是一个数组
      this.events[name] = this.events[name] || [];
      this.events[name].push(fn);
    }
    // 链式调用
    return this;
  }

  $off(name: string, fn?: any) {
    if (!name) {
      return this;
    }
    if (!fn && this.events[name]) {
      this.events[name] = null;
    }
    if (this.events[name]) {
      this.events[name] = this.events[name].filter((item: any) => {
        if (item.toString() === fn.toString()) {
          return false;
        }
        return true;
      });
      if (!this.events[name].length) {
        // 表示清空了
        this.handledEvents[name] = false;
        this.events[name] = null;
      }
    }
    return this;
  }

  $once(name: string, fn: any) {
    if (name && !this.handledEvents[name]) {
      this.handledEvents[name] = true;
      this.$on(name, fn);
    }
    return this;
  }
}
