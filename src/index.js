import {
  createContext,
  useRef,
  useEffect,
  createElement,
  useContext,
  useState,
} from "react";

const defaultSelector = (value) => value;

export function Provider({ store, children, initial }) {
  // multiple stores
  if (typeof store !== "function") {
    if (Array.isArray(store)) {
      return store.reduceRight(
        (children, [store, initial]) => _Provider(store, initial, children),
        children
      );
    }
    return Object.entries(store).reduceRight(
      (children, [key, store]) =>
        _Provider(store, initial ? initial[key] : undefined, children),
      children
    );
  }
  return _Provider(store, initial, children);
}

function _Provider(store, initial, children) {
  if (!store.__context) {
    store.__context = createContext();
  }
  const instanceRef = useRef(undefined);
  if (!instanceRef.current) {
    const subscriptions = [];
    instanceRef.current = {
      subscribe(subscription) {
        subscriptions.push(subscription);
        return function () {
          const index = subscriptions.indexOf(subscription);
          subscriptions.splice(index, 1);
        };
      },
      dispatch() {
        subscriptions.forEach((subscription) => subscription());
      },
    };
  }

  instanceRef.current.api = store(initial);

  useEffect(() => {
    instanceRef.current.dispatch();
  });

  return createElement(store.__context.Provider, {
    value: instanceRef.current,
    children,
  });
}

export function useStore(store, selector) {
  if (!store.__context) {
    throw new Error("No store context found");
  }
  const [, rerender] = useState();
  const dataRef = useRef({});
  const data = dataRef.current;
  const instance = useContext(store.__context);

  useEffect(() => {
    return instance.subscribe(() => {
      const next = data.selector(instance.api);
      if (
        next === data.prev ||
        (typeof next === "object" &&
          typeof data.prev === "object" &&
          Object.keys(next)
            .concat(Object.keys(data.prev))
            .every((key) => next[key] === data.prev[key]))
      ) {
        return;
      }
      rerender({});
    });
  }, [instance, data]);

  data.selector = createSelector(
    selector,
    data.selector,
    data.originalSelector
  );
  data.originalSelector = selector;
  data.prev =
    typeof selector === "function" ? selector(instance.api) : instance.api;

  return data.prev;
}

function createSelector(selector, prev, original) {
  if (selector === original && prev) {
    return prev;
  }
  if (selector === null || typeof selector === "undefined") {
    return defaultSelector;
  }
  if (typeof selector === "function") {
    return selector;
  }
  return (value) => value[selector];
}
