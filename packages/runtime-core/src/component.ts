import { reactive } from "@lawzz/reactivity";
import { hasOwn, isFunction } from "@lawzz/shared";
import { initProps } from "./componentProps";

export function createComponentInstance(vNode) {
  const instance = {
    data: null,
    vNode,
    subTree: null, // 渲染的内容
    isMounted: false,
    update: null,
    propsOptions: vNode.type.props,
    props: {},
    attrs: {},
    proxy: null,
    render: null
  }
  return instance;
}

const publicPropertyMap = {
  $attrs: (i) => i.attrs
}

const publicInstaceProxy = {
  get(target, key) {
    const { data, props} = target;
    if (data && hasOwn(data, key)) {
      return data[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    }
    const getter = publicPropertyMap[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    const { data, props} = target;
    if (data && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (props && hasOwn(props, key)) {
      console.warn(`attempting to mutate prop ${key as string}`)
      return false;
    }
    return true;
  }
}

export function setupComponent(instance) {
  const { type, props } = instance.vNode;

  initProps(instance, props)
  
  instance.proxy = new Proxy(instance, publicInstaceProxy)

  let data =  type.data;
  if (data) {
    if (!isFunction(data)) {
      return console.warn('data options must be a function')
    }
    instance.data = reactive(data.call(instance.proxy));
  }

  instance.render = type.render;
}

export const hasPropsChange = (prevProps, nextProps) => {
  const nextKeys = Object.keys(nextProps);
  // 个数不一致
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  // 值不一致
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}

export function updateProps(prevProps, nextProps) {
  for (const key in nextProps) {
    prevProps[key] = nextProps[key]
  }

  for (const key in prevProps) {
    if (!hasOwn(nextProps, key)) {
      delete prevProps[key]
    }
  }
}