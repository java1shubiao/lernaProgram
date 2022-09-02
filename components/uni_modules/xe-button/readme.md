# 按钮

## disabled?: boolean; // 是否禁用
## loading?: boolean; // 是否加载中
## formType?: string; // 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件
## openType?: string; // 开放能力
## hoverClass?: string; // 指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果
## hoverStartTime?: number; // 按住后多久出现点击态，单位毫秒
## hoverStayTime?: number; // 手指松开后点击态保留时间，单位毫秒
## hoverStopPropagation?: boolean; // 指定是否阻止本节点的祖先节点出现点击态
## type?: 'default' | 'primary' | 'warning'; // 按钮类型
## styles?: string; // 按钮样式