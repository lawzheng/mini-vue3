import { isString, ShapeFlags } from "@lawzz/shared";
import { createVNode, isSameVNode, TEXT } from "./vnode";


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

  const normalize = (children, index) => {
    if (isString(children[index])) {
      const vNode = createVNode(TEXT, null, children[index])
      children[index] = vNode;
    }
    return children[index];
  }

  const mountChildren = (children, container) => {
    children.forEach((item, index) => {
      const child = normalize(children, index);
      patch(null, child, container);
    })
  }

  const mountElement = (vNode, container, anchor) => {
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

    hostInsert(el, container, anchor);
  }

  const processText = (n1, n2, container) => {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    } else {
      const el = n2.el = n1.el;
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children);
      }
    }
  }

  const patchProps = (oldProps, newProps, el) => {
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    for (const key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], undefined)
      }
    }
  }

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  const patchKeyedChidren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }
    
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      // i比e1大说明有新增
      // i和e2之间的是新增的部分
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, c2[i], el, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // i比e2大说明要卸载
      // i到e1之间的就是要卸载的
      if (i <= e1) {
        while(i <= e1) {
          unmount(c1[i])
          i++
        }
      }
    }

    // 以上，有规律的优化完毕
    // 下面，乱序比对
    let s1 = i;
    let s2 = i;
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i)
    }

    // 循环老元素，看下新的里有没有，有则diff，没有则添加，老有新无则删除
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndex = new Array(toBePatched).fill(0)
    for (let i = s1; i <= e1; i++) {
      const oldChild = c1[i]
      const newIndex = keyToNewIndexMap.get(oldChild.key);
      if (!newIndex) {
        unmount(oldChild)
      } else {
        newIndexToOldIndex[newIndex - s2] = i + 1;
        patch(oldChild, c2[newIndex], el)
      }
    }

    // 移动位置，倒序插入
    for (let i = toBePatched - 1; i >= 0; i--) {
      let index = i + s2;
      const current = c2[index]
      const anchor = index + 1 < c2.length ? c2[index+1].el : null;
      if (newIndexToOldIndex[i] === 0) {
        // 创建
        patch(null, current, el, anchor)
      } else {
        // patch过的
        hostInsert(current.el, el, anchor)
      }
    }
  }

  const patchChidren = (n1, n2, el) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 删除所有子节点
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      // 数组或空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff
          patchKeyedChidren(c1, c2, el);
        } else {
          unmountChildren(c1)
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el)
        }
      }
    }
  }

  const patchElement = (n1, n2) => {
    // 复用节点
    const el = n2.el = n1.el;
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 比较属性
    patchProps(oldProps, newProps, el);
    // 比较儿子
    patchChidren(n1, n2, el);
  }

  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2)
    }
  }

  const patch = (n1, n2, container, anchor = null) => {
    if (n1 === n2) return;

    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }

    const { type, shapeFlag } = n2;

    switch(type) {
      case TEXT:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor);
        }
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