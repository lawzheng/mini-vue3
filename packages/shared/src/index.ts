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