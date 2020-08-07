import {
  createContext,
  useRef,
  useEffect,
  createElement,
  useContext,
  useState,
} from "react";

const defaultSelector = (value) => value;
let extendStore;

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

function makeSureProviderCreated(store) {
  if (!store.__context) {
    store.__context = createContext();
  }
}

function _Provider(store, initial, children) {
  makeSureProviderCreated(store);
  const instanceRef = useRef(undefined);
  if (!instanceRef.current) {
    const subscriptions = [];
    instanceRef.current = {
      parents: new WeakMap(),
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
  let previousExtend = extendStore;
  const contexts = [];
  try {
    extendStore = function (parentStore, parentInitial) {
      makeSureProviderCreated(parentStore);
      let parentInstance = instanceRef.current.parents.get(parentStore);
      if (!parentInstance) {
        parentInstance = {
          subscribe: instanceRef.current.subscribe,
        };
        instanceRef.current.parents.get(parentStore, parentInstance);
      }
      parentInstance.api = parentStore(parentInitial);
      contexts.push([parentStore.__context, parentInstance]);
    };
    instanceRef.current.api = store(initial);
    contexts.unshift([store.__context, instanceRef.current]);
  } finally {
    extendStore = previousExtend;
  }

  useEffect(() => {
    instanceRef.current.dispatch();
  });

  return contexts.reduceRight((children, item) => {
    return createElement(item[0].Provider, {
      value: item[1],
      children,
    });
  }, children);
}

export function useStore() {
  if (extendStore) {
    return extendStore(...arguments);
  }

  return _useStore(...arguments);
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

function _useStore(store, selector) {
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
