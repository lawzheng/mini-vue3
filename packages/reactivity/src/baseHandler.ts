import { track, trigger } from './effect'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }

    track(target, 'get', key);
    return Reflect.get(target, key, receiver);
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