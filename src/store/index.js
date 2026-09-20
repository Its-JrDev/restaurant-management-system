export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function getState() {
    return { ...state };
  }

  function setState(updater) {
    const prev = { ...state };
    if (typeof updater === "function") {
      state = { ...state, ...updater(state) };
    } else {
      state = { ...state, ...updater };
    }
    notify(prev);
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notify(prev) {
    listeners.forEach((fn) => fn(state, prev));
  }

  return { getState, setState, subscribe };
}
