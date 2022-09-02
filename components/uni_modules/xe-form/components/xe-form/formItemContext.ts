import type { ComputedRef, ConcreteComponent, InjectionKey, ComponentInternalInstance } from 'vue';
import { computed, watch, provide, inject, ref, getCurrentInstance, onBeforeMount } from 'vue';
import { devWarning } from '@xiaoe/uni-ui/lib/xe-utils/warning';

// * 是否字节平台(字节小程序解析父子节点关系过慢导致子结点中inject无法获取provide的内容)
let isMpToutiao: boolean = false;
// #ifdef MP-TOUTIAO
isMpToutiao = true;
// #endif

export interface IFormItemContext {
  id: ComputedRef<string | undefined>;
  onFieldBlur: () => void;
  onFieldChange: () => void;
  clearValidate: () => void;
  hasErrorList?: ComputedRef<boolean>;
}

// * 内部表单上下文
export interface IInternalFromItemContext {
  // * 添加表单项
  addFormItemField: (key: Symbol, type: ConcreteComponent) => void;
  // * 移除表单项
  removeFormItemField: (key: Symbol) => void;
}

// * 表单项上下文唯一键
const ContextKey: InjectionKey<IFormItemContext> = Symbol('ContextProps');

// * 内部表单上下文唯一键
const InternalContextKey: InjectionKey<IInternalFromItemContext> = Symbol('InternalContextKey');

export const useProvideFormItemContext = (
  props: IFormItemContext,
  validation: ComputedRef<boolean> = computed(() => true)
) => {
  // * Map数据结构, 用于存储添加的表单项(以Symbol为键名, 键值为ConcreteComponent)
  const formItemFields = ref(new Map<Symbol, ConcreteComponent>());
  const addFormItemField = (key: Symbol, type: ConcreteComponent) => {
    // * 给map赋值
    formItemFields.value.set(key, type);
    // * 重新拷贝一次新的map
    formItemFields.value = new Map(formItemFields.value);
  };
  const removeFormItemField = (key: Symbol) => {
    formItemFields.value.delete(key);
    formItemFields.value = new Map(formItemFields.value);
  };

  // * 获取组件实例
  const instance = getCurrentInstance();

  watch([validation, formItemFields], () => {
    if (process.env.NODE_ENV !== 'production') {
      // * 开发测试环境特殊逻辑
      if (validation.value && formItemFields.value.size > 1) {
        // * 说明本身表单项是有值的, 但是还进行了一次addFormItemField操作
        devWarning(
          false,
          'Form.Item',
          `FormItem只能手机一次表单值, 您已经设置了 ${[...formItemFields.value.values()]
            .map((v) => v.name)
            .join(', ')}等表单项`
        );
        let cur = instance;
        while (cur?.parent) {
          console.warn('at', cur.type); // 抛出具体位置
          cur = cur.parent;
        }
      }
    }
  });
  provide(ContextKey, props, isMpToutiao);
  provide(
    InternalContextKey,
    {
      addFormItemField,
      removeFormItemField
    },
    isMpToutiao
  );
};

const defaultContext: IFormItemContext = {
  id: computed(() => undefined),
  onFieldBlur: () => {},
  onFieldChange: () => {},
  clearValidate: () => {},
  hasErrorList: computed(() => false)
};

const defaultInternalContext: IInternalFromItemContext = {
  addFormItemField: () => {},
  removeFormItemField: () => {}
};

export const useInjectFormItemContext = () => {
  const internalContext = inject(InternalContextKey, defaultInternalContext);
  const formItemFields = Symbol('FormItemFieldKey');
  // * 当前组件实例
  const instance = getCurrentInstance();
  internalContext.addFormItemField(formItemFields, (instance as ComponentInternalInstance).type as ConcreteComponent);
  onBeforeMount(() => {
    internalContext.removeFormItemField(formItemFields);
  });

  // * 阻止context传递给children
  // provide(InternalContextKey, defaultInternalContext);
  // provide(ContextKey, defaultContext);

  return inject(ContextKey, defaultContext);
};
