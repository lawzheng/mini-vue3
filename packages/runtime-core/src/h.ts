import { isArray, isObject } from "@lawzz/shared";
import { createVNode, isVNode } from "./vnode";

export function h (type, propsChildren, children) {
  const l = arguments.length;

  if (l === 2) {
    if (isObject(propsChildren) && !isArray(propsChildren)) {
      if (isVNode(propsChildren)) {
        return createVNode(type, null, [propsChildren])
      }
      return createVNode(type, propsChildren)
    } else {
      return createVNode(type, null, propsChildren)
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsChildren, children)
  }
}