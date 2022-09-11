import { isObject } from "@lawzz/shared";
import { mutableHandlers, ReactiveFlags } from './baseHandler'

const reactiveMap = new WeakMap();

export function isReactive(target) {
  return !!(target?.[ReactiveFlags.IS_REACTIVE])
}


/**
 * 代理对象
 * @param target
 * @returns 
 */
export function reactive (target) {
  if (!isObject(target)) {
    return
  }

  // 解决重复代理
  if (isReactive(target)) {
    return target;
  }

  // 做缓存
  const exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy;
  }

  const proxy = new Proxy(target, mutableHandlers)

  reactiveMap.set(target, proxy);

  return proxy
}