import { NgModule, Optional, SkipSelf } from '@angular/core';
import { Store, TypeIdentifier } from '@rx-signals/store';
import { take } from 'rxjs/operators';

const dummyStore = new Store();
const storeSymbol: TypeIdentifier<Store> = { symbol: Symbol('appStore') };

export type WithStoreCallback = (store: Store) => void;

export const withStore = (cb: WithStoreCallback) =>
  dummyStore
    .getBehavior(storeSymbol)
    .pipe(take(1))
    .subscribe(store => cb(store));

export const testWithStore = (cb: WithStoreCallback) => {
  dummyStore.removeBehaviorSources(storeSymbol);
  const store = new Store();
  dummyStore.addState(storeSymbol, store);
  cb(store);
};

@NgModule({
  providers: [Store],
})
export class RxSignalsStoreModule {
  constructor(private store: Store, @Optional() @SkipSelf() self?: RxSignalsStoreModule) {
    if (self) {
      throw new Error(
        'RxSignalsStoreModule is already loaded. Import it in a single module (e.g. CoreModule) only!',
      );
    }
    dummyStore.addState(storeSymbol, this.store);
  }
}
