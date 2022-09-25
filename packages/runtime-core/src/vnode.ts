import { isArray, isString, ShapeFlags } from "@lawzz/shared";

export const TEXT = Symbol('text');

export function isVNode(value) {
  return !!(value?.__v_isVnode);
}

export function createVNode (type, props, children = null) {
  let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

  const vnode = {
    type,
    props,
    children,
    el: null,
    key: props?.key,
    __v_isVnode: true,
    shapeFlag
  }

  if (children) {
    let type = 0;
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }

  return vnode
}