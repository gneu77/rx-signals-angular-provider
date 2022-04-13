import { ModuleWithProviders, NgModule } from '@angular/core';
import { Store } from '@rx-signals/store';

export type ModuleSetupWithStore = (store: Store) => void;

// The root store is a singleton that should live as long as the whole application
// In case other lifecycles are required (e.g. restricted to the lifecycle of
// a certain module), corresponding child-stores should be derived from the
// root store
const rootStore = new Store();

@NgModule({
  providers: [{ provide: Store, useValue: rootStore }] // default to rootStore, if none of the static providers is used
})
export class RxSignalsStoreModule {
  
  /**
   * Use withRootStore, if you want the root store (the store that shares the lifecycle of the whole application).
   * If your module is a lazy-loaded feature module, it will still receive the same root-store instance, if you use withRootStore.
   * This should be the standard case.
   * Pass as many setup functions as you like.
   *
   * @param {ModuleSetupWithStore[]} setups - 0 to n optional setup functions (that will be called with the store instance)
   * @returns {ModuleWithProviders<RxSignalsStoreModule>} the module providing the root-store
   */
  static withRootStore(...setups: ModuleSetupWithStore[]): ModuleWithProviders<RxSignalsStoreModule> {
    let doSetup = true;
    return {
      ngModule: RxSignalsStoreModule,
      providers: [{ provide: Store, useFactory: () => {
        if (doSetup) {
          doSetup = false;
          setups.forEach(setup => setup(rootStore));
        }
        return rootStore;
      }}],
    };
  }

  /**
   * Use withChildStore, if you need a child store that is derived from the root-store.
   * See store.createChildStore() for further documentation on child stores.
   *
   * @param {ModuleSetupWithStore[]} setups - 0 to n optional setup functions (that will be called with the child-store instance)
   * @returns {ModuleWithProviders<RxSignalsStoreModule>} the module providing the child-store
   */
  static withChildStore(...setups: ModuleSetupWithStore[]): ModuleWithProviders<RxSignalsStoreModule> {
    let doSetup = true;
    const childStore = rootStore.createChildStore();
    return {
      ngModule: RxSignalsStoreModule,
      providers: [{ provide: Store, useFactory: () => {
        if (doSetup) {
          doSetup = false;
          setups.forEach(setup => setup(childStore));
        }
        return childStore;
      }}],
    };
  }
}
