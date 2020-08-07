export const Provider: ProviderExports;
export const useStore: UseStoreExports;

interface ProviderExports extends Function {
  <Store extends StoreBase<any, any>>(props: {
    store: Store;
    initial?: StoreInitialInfer<Store>;
  }): any;
  <StoreMap extends { [key: string]: StoreBase<any, any> }>(props: {
    store: StoreMap;
    initial?: { [key in keyof StoreMap]: StoreInitialInfer<StoreMap[key]> };
  }): any;
  <StoreTupleMap extends { [key: string]: [StoreBase<any, any>, any] }>(props: {
    store: StoreTupleMap;
  }): any;
}

interface UseStoreExports extends Function {
  <Store extends StoreBase<any, any>>(store: Store): StoreApiInfer<Store>;
  <Store extends StoreBase<any, any>>(
    store: Store,
    initial: StoreInitialInfer<Store>
  ): StoreApiInfer<Store>;
  <Store extends StoreBase<any, any>, MappedApi>(
    store: Store,
    selector: (api: StoreApiInfer<Store>) => MappedApi
  ): MappedApi;
}

type StoreBase<Initial, Api> = (initial: Initial) => Api;
type StoreInitialInfer<T> = T extends StoreBase<infer Initial, infer Api>
  ? Initial
  : never;
type StoreApiInfer<T> = T extends StoreBase<infer Value, infer Api>
  ? Api
  : never;
