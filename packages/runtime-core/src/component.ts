import { proxyRefs, reactive } from "@lawzz/reactivity";
import { hasOwn, isFunction, isObject, ShapeFlags } from "@lawzz/shared";
import { initProps } from "./componentProps";

export let currentInstance = null;
export const setCurrentInstance = (instance) => {
  currentInstance = instance;
}
export const getCurrentInstance = () => {
  return currentInstance;
}

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
    render: null,
    setupState: {},
    slots: {}
  }
  return instance;
}

const publicPropertyMap = {
  $attrs: (i) => i.attrs,
  $slots: (i) => i.slots
}

const publicInstaceProxy = {
  get(target, key) {
    const { data, props, setupState} = target;
    if (data && hasOwn(data, key)) {
      return data[key];
    } else if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    }
    const getter = publicPropertyMap[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    const { data, props, setupState } = target;
    if (data && hasOwn(data, key)) {
      data[key] = value;
    } else if (hasOwn(setupState, key)) {
      setupState[key] = value;
    }  else if (props && hasOwn(props, key)) {
      console.warn(`attempting to mutate prop ${key as string}`)
      return false;
    }
    return true;
  }
}

function initSlots (instance, children) {
  if (instance.vNode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children;
  }
}

export function setupComponent(instance) {
  const { type, props, children } = instance.vNode;

  initProps(instance, props);
  initSlots(instance, children);
  
  instance.proxy = new Proxy(instance, publicInstaceProxy)

  const { data, setup } = type;
  if (data) {
    if (!isFunction(data)) {
      return console.warn('data options must be a function')
    }
    instance.data = reactive(data.call(instance.proxy));
  }

  if (setup) {
    const setupContext = {
      emit: (event, ...args) => {
        // 事件原理，发布订阅模式
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
        const handler = instance.vNode.props[eventName];
        handler?.(...args);
      },
      attrs: instance.attrs,
      slots: instance.slots,
    };
    
    setCurrentInstance(instance);
    const setupResult = setup(instance.props, setupContext)
    setCurrentInstance(null);

    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else if (isObject(setupResult)) {
      instance.setupState = proxyRefs(setupResult)
    }
  }

  if (!instance.render) {
    instance.render = type.render;
  }
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