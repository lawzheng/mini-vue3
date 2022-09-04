export let activeEffect = undefined;

function cleanupEffect (effect) {
  const { deps } = effect;
  // 双向删除
  for (let index = 0; index < deps.length; index++) {
    deps[index].delete(effect);
  }
  effect.deps.length = 0;
}

class ReactiveEffect {
  public parent = null;
  public active = true;
  public deps = [];
  constructor(public fn, public scheduler) {

  }

  run() {
    if (!this.active) {
      this.fn();
    }

    try {
      // 3.0版本用的栈记录，新版用的链表
      this.parent = activeEffect;
      // 依赖收集
      activeEffect = this;

      // 将之前收集的删掉
      cleanupEffect(this);

      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = null;
    }
  }

  stop () {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
    }
  }
}


export function effect (fn, options:any = {}) {
  // effect可以嵌套使用

  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run();

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

const targetMap = new WeakMap();

export function track (target, type, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  const shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }

}

export function trigger (target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  let effects = depsMap.get(key);

  if(effects) {
    // Set的bug，会边删除边添加，所以拷贝一份
    effects = new Set(effects);
    effects.forEach(effect => {
      // 屏蔽掉执行effect的时候又是执行当前的effect
      if (effect !== activeEffect) {
        // 如果有传入自定义调度器
        if (effect.scheduler) {
          effect.scheduler();
        } else {
          effect.run();
        }
      }
    });
  }
}