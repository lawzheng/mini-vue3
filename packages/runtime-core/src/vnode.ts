import { isArray, isObject, isString, ShapeFlags } from "@lawzz/shared";

export const Text = Symbol("Text");
export const Fragment = Symbol("Fragment");

export function isVNode(value) {
  return !!value?.__v_isVnode;
}

export function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}

export function createVNode(type, props, children = null, patchFlag?) {
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;

  const vnode = {
    type,
    props,
    children,
    el: null,
    key: props?.key,
    __v_isVnode: true,
    shapeFlag,
    patchFlag
  };

  if (children) {
    let type = 0;
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else if (isObject(children)) {
      type = ShapeFlags.SLOTS_CHILDREN;
    } else {
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }

  if (currentBlock && vnode.patchFlag > 0) {
    currentBlock.push(vnode);
  }
  return vnode;
}

export { createVNode as createElementVNode };
let currentBlock = null;

export function openBlock() {
  currentBlock = [];
}

export function createElementBlock(type, props, children, patchFlag) {
  return setupBlock(createVNode(type, props, children, patchFlag))
}

function setupBlock(vNode) {
  vNode.dynamicChildren = currentBlock;
  currentBlock = null;
  return vNode;
}

export function toDisplayString(val) {
  return isString(val) ? val : val == null ? '' : isObject(val) ? JSON.stringify(val) : String(val);
}


