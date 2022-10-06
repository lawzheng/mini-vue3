import { currentInstance, setCurrentInstance } from "./component"

export enum LifeCycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFOR_UPDATE = 'bu',
  UPDATED = 'u'
}

function createHook(type) {
  return (hook, target = currentInstance) => {
    if (target) {
      const hooks = target[type] || (target[type] = [])
      const wrapperHook = () => {
        setCurrentInstance(target);
        hook();
        setCurrentInstance(null);
      }
      hooks.push(wrapperHook);
    }
    
  }
}
export const onBeforeMount = createHook(LifeCycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifeCycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifeCycleHooks.BEFOR_UPDATE)
export const onUpdated = createHook(LifeCycleHooks.UPDATED)