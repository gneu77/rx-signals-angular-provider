import { ModuleWithProviders, NgModule } from '@angular/core';
import { Store } from '@rx-signals/store';

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
   * Use withRootStore, if you need the root store that shares the lifecycle of the whole application.
   * Also lazy-loaded feature modules will receive the same root-store instance, if you use withRootStore.
   * This should be the standard case.
   *
   * @param {function} setup - optional callback that receives the store and performs setup
   * @returns {ModuleWithProviders<RxSignalsStoreModule>} the module providing the root-store
   */
  static withRootStore(setup?: (store: Store) => void): ModuleWithProviders<RxSignalsStoreModule> {
    let doSetup = (setup ?? null) !== null;
    return {
      ngModule: RxSignalsStoreModule,
      providers: [{ provide: Store, useFactory: () => {
        if (doSetup && setup) {
          doSetup = false;
          setup(rootStore);
        }
        return rootStore;
      }}],
    };
  }

  /**
   * Use withChildStore, if you need a child store that is derived from the root-store.
   * See store.createChildStore() for further documentation on child stores.
   *
   * @param {function} setup - optional callback that receives the child-store and performs setup
   * @returns {ModuleWithProviders<RxSignalsStoreModule>} the module providing the child-store
   */
  static withChildStore(setup?: (store: Store) => void): ModuleWithProviders<RxSignalsStoreModule> {
    let doSetup = (setup ?? null) !== null;
    const childStore = rootStore.createChildStore();
    return {
      ngModule: RxSignalsStoreModule,
      providers: [{ provide: Store, useFactory: () => {
        if (doSetup && setup) {
          doSetup = false;
          setup(childStore);
        }
        return childStore;
      }}],
    };
  }
}
