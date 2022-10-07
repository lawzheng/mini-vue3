export const isObject = (value: any) => {
  return typeof value === 'object' && value !== null;
}

export const isFunction = (value: any) => {
  return typeof value === 'function';
}
export const isString = (value: any) => {
  return typeof value === 'string';
}
export const isNumber = (value: any) => {
  return typeof value === 'number';
}

export const isArray = Array.isArray;

export const assign = Object.assign;

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (value, key) => hasOwnProperty.call(value, key);

export function invokeArrayFns(fns) {
  for (let i = 0; i < fns.length; i++) {
    fns[i]();
  }
}

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTION_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALOVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTION_COMPONENT
}

export const enum PatchFlags {
  TEXT = 1, // 动态文本节点
  CLASS = 1 << 1, // 动态class
  STYLE = 1 << 2, // 动态style
  PROPS = 1 << 3, // 除了class\style的动态属性
  FULL_PROPS = 1 << 4, // 有key,需要完整diff
  HYDRATE_EVENT = 1 << 5, // 挂载过事件
  STABLE_FRAGMENT = 1 << 6, // 稳定序列，子节点顺序不会发生变化
  KEYED_FRAGMENT = 1 << 7, // 子节点有key的fragment
  UNKEYED_FRAGMENT = 1 << 8, // 子节点没有key的fragment
  NEED_PATCH = 1 << 9, // 进行非props比较，ref比较
  DYNAMIC_SLOTS = 1 << 10, // 动态插槽
  DEV_ROOT_FRAGMENT = 1 << 11,
  HOISTED = -1, // 静态节点，内容变化，不比较儿子
  BAIL = -2, // 表示diff算法应该结束
}