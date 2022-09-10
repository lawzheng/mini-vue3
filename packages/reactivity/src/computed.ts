import { isFunction } from "@lawzz/shared"
import { ReactiveEffect, trackEffects, triggerEffect } from "./effect";

class ComputedRefImpl {
  public effect;
  public _dirty = true;
  public __v_isReadOnly = true;
  public __v_isRef = true;
  public _value;
  public dep = new Set;

  constructor (public getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;

        // 触发更新
        triggerEffect(this.dep);
      }
    });
  }

  // 类中的属性访问器，底部就是Object.defineProperty
  get value() {
    trackEffects(this.dep)

    if (this._dirty) {
      // 脏的
      this._dirty = false;
      this._value = this.effect.run();
    }

    return this._value;
  }
  set value(newValue) {
    this.setter(newValue)
  }
}


export const computed = (getterOrOptions) => {
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {console.warn('no set')}
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}