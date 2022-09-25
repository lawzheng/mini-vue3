function createInvoker(callback) {
  const invoker = (e) => invoker.value(e);
  invoker.value = callback;
  return invoker;
}

export function patchEvent(el, eventName, nextValue) {
  const invokers = el._vel || (el._vel = {});

  const exits = invokers[eventName];

  if (exits && nextValue) {
    exits.value = nextValue;
  } else {
    const event = eventName.slice(2).toLowerCase();

    if (nextValue) {
      const invoker = (invokers[eventName] = createInvoker(nextValue));
      el.addEventListener(event, invoker.value);
    } else if (exits) {
      el.removeEventListener(event, exits);
      invokers[eventName] = undefined;
    }
  }
}
