import { isString, ShapeFlags } from "@lawzz/shared";
import { createVNode, TEXT } from "./vnode";


export function createRenderer (renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hosTNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp
  } = renderOptions;

  const normalize = (child) => {
    if (isString(child)) {
      return createVNode(TEXT, null, child)
    }
    return child;
  }

  const mountChildren = (children, container) => {
    children.forEach(item => {
      const child = normalize(item);
      patch(null, child, container);
    })
  }

  const mountElement = (vNode, container) => {
    const { type, props, shapeFlag, children } = vNode;
    const el = vNode.el = hostCreateElement(type);

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    hostInsert(el, container);
  }

  const processText = (oldVNode, newVNode, container) => {
    if (oldVNode === null) {
      hostInsert((newVNode.el = hostCreateText(newVNode.children)), container);
    }
  }

  const patch = (oldVNode, newVNode, container) => {
    if (oldVNode === newVNode) return;

    const { type, shapeFlag } = newVNode;

    if (oldVNode === null) {
      // 初次渲染
      switch(type) {
        case TEXT:
          processText(oldVNode, newVNode, container);
          break;
        default:
          if (shapeFlag & ShapeFlags.ELEMENT) {
            mountElement(newVNode, container);
          }
      }
    } else {
      // 更新
    }
  }

  const unmount = (vNode) => {
    hostRemove(vNode.el)
  }

  const render = (vNode, container) => {
    if (vNode === null) {
      // 卸载
      if (container._vNode) {
        unmount(container._vNode);
      }
    } else {
      patch(container._vNode || null, vNode, container);
    }
    container._vNode = vNode;
  }

  return {
    render
  }
}