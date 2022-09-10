import { isObject } from '@lawzz/shared';
import { track, trigger } from './effect'
import { reactive } from './reactive';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }

    track(target, 'get', key);

    const res = Reflect.get(target, key, receiver);

    // 深度代理，取值时才会代理，性能更好
    if (isObject(res)) {
      return reactive(res);
    }

    return res;
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      // 不一样才更新
      trigger(target, 'set', key, value, oldValue);
    }

    return result;
  }
}