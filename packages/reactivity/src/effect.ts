export let activeEffect = undefined;

class ReactiveEffect {
  active = true;
  constructor(public fn) {

  }

  run() {
    if (!this.active) {
      this.fn();
    }

    try {
      // 依赖收集
      activeEffect = this;
      this.fn();
    } finally {
      activeEffect = undefined;
    }
  }
}


export function effect (fn) {
  // effect可以嵌套使用

  const _effect = new ReactiveEffect(fn)

  _effect.run();
}