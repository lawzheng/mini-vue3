import { isFunction, isObject } from "@lawzz/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

// 循环引用
function traversal (value, set = new Set()) {
  if (!isObject(value)) return value
  if (set.has(value)) return value;
  set.add(value)
  for (const key in value) {
    traversal(value[key], set)
  }
  return value;
}

export function watch(source, cb) {
  let getter;
  if (isReactive(source)) {
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source;
  } else {
    return;
  }

  let cleanup;
  const onCleanup = (fn) => {
    cleanup = fn;
  }

  let oldValue;
  const job = () => {
    // 清除上一次的watch，调用回调
    if (cleanup) cleanup();

    const newValue = effect.run();
    cb(newValue, oldValue, onCleanup);
    oldValue = newValue;
  }

  const effect = new ReactiveEffect(getter, job);
  oldValue = effect.run();
} 