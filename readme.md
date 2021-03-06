# Azux

A small state management that is inspired on unstated-next

## Install

```text
npm install --save azux
```

## Example

```jsx harmony
import React, { useState } from "react";
import { useStore, Provider } from "azux";
import { render } from "react-dom";

function CounterStore(initial = 0) {
  const [count, setCount] = useState(initial);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return { count, decrement, increment };
}

function CounterDisplay() {
  const { count, increment, decrement } = useStore(CounterStore);
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

function App() {
  return (
    <Provider store={CounterStore}>
      <CounterDisplay />
      <Provider store={CounterStore} initial={2}>
        <div>
          <div>
            <CounterDisplay />
          </div>
        </div>
      </Provider>
    </Provider>
  );
}

render(<App />, document.getElementById("root"));
```

## API

### Provider

Passing store and its initial state

```jsx harmony
<Provider store={CountStore} initial={0} />
```

Passing multiple stores and their initial states

```jsx harmony
<Provider
  store={{ CountStore, GreetingStore }}
  initial={{ CountStore: 0, GreetingStore: "World" }}
/>
```

Passing store tuples

```jsx harmony
<Provider
  store={[
    [CountStore, 0],
    [GreetingStore, "World"],
  ]}
/>
```

### useStore()

Retrieve store api

```jsx harmony
function Component() {
  // this component will rerender whenever store api updated
  const { count, increment, decrement } = useStore(CounterStore);
}
```

Use selector to retrieve specific store prop

```jsx harmony
function Component() {
  // this component will rerender whenever count prop changed
  const count = useStore(CounterStore, (api) => api.count);
}
```

## Advanced Usages

### Composing stores

```jsx harmony
const CountStore = (initial) => {
  const [count, setCount] = useState(initial);
  return {
    count,
    increase() {
      setCount(count + 1);
    },
  };
};

const GreetingStore = (initial) => {
  const [name, setName] = useState(initial);
  return {
    name,
    updateName: setName,
  };
};

const MainStore = ({ name, count } = {}) => {
  // extend stores with initial values
  const counter = useStore(CountStore, count);
  const greeting = useStore(GreetingStore, name);
  return {
    ...counter,
    ...greeting,
  };
};
```
