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

