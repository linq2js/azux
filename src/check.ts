import { useState } from "react";
import { Provider, useStore } from "./index";

function CountStore(initial: number) {
  const [count, setCount] = useState(initial);

  return {
    count: 1000,
    increase() {
      setCount(count + 1);
    },
  };
}

const result = Provider({ store: CountStore, initial: 1 });
const api1 = useStore(CountStore);
console.log(api1.increase());
console.log(api1.count);

const api2 = useStore(CountStore, (api) => api.count);
console.log(api2);
