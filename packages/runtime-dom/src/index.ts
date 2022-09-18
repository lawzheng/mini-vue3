import { createRenderer } from "@lawzz/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign(nodeOps, { patchProp });


export function render (vNode, container) {
  createRenderer(renderOptions).render(vNode, container)
}

export * from '@lawzz/runtime-core'