export const getHeight = (select: string): Promise<number> => {
  return new Promise((resolve) => {
    uni
      .createSelectorQuery()
      .select(select)
      .boundingClientRect((data: any) => {
        if (data) {
          resolve(data.height);
        } else {
          resolve(0);
        }
      })
      .exec();
  });
};

export const getWidth = (select: string): Promise<number> => {
  return new Promise((resolve) => {
    uni
      .createSelectorQuery()
      .select(select)
      .boundingClientRect((data: any) => {
        if (data) {
          resolve(data.width);
        } else {
          resolve(0);
        }
      })
      .exec();
  });
};

export const getWindowHeight = (): Promise<number> => {
  return new Promise((resolve) => {
    uni.getSystemInfo({
      success: (res: any) => {
        resolve(res.windowHeight || 0);
      }
    });
  });
};

export type statusType = 1 | 2 | 3 | 4;

// * 加载完成
export const COMPLETE = 'Complete';

// * 加载中
export const LOADING = 'Loading';

// * 未开始加载
export const START = 'Start';

// * 没有数据
export const EMPTY = 'Empty';

export enum status {
  Loading = 1, // 加载中
  Complete,
  Start,
  Empty
}
