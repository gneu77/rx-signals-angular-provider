import { NgModule, Optional, SkipSelf } from '@angular/core';
import { Store, TypeIdentifier } from '@rx-signals/store';
import { take } from 'rxjs/operators';

const dummyStore = new Store();
const storeSymbol: TypeIdentifier<Store> = { symbol: Symbol('appStore') };
const storeEventSymbol: TypeIdentifier<Store> = { symbol: Symbol('appStoreEvent') };

export type WithStoreCallback = (store: Store) => void;

/**
 * This function can be used to execute code with the same store instance
 * this is being injected by the RxSignalsStoreModule.
 * In case this function is called in context of a testWithStore callback,
 * the store provided by testWithStore will be used instead.
 *
 * @param {WithStoreCallback} cb - the callback receiving the store as argument
 * @returns {void}
 */
export const withStore = (cb: WithStoreCallback): void => {
  dummyStore
    .getBehavior(storeSymbol)
    .pipe(take(1))
    .subscribe(store => cb(store));
};

/**
 * This function can be used to execute code with a fresh new store instance.
 * If any code executed in context of the given callback uses the withStore function,
 * the latter functions callback will also receive the fresh new store instance instead
 * of the store injected by the RxSignalsStoreModule
 *
 * @param {WithStoreCallback} cb - the callback receiving the store as argument
 * @returns {void}
 */
export const testWithStore = (cb: WithStoreCallback): void => {
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
    if (dummyStore.getNumberOfBehaviorSources(storeSymbol) === 0) {
      dummyStore.addState(storeSymbol, this.store);
      dummyStore.addReducer(storeSymbol, storeEventSymbol, store => store);
    } else {
      dummyStore.dispatchEvent(storeEventSymbol, this.store);
    }
  }
}
