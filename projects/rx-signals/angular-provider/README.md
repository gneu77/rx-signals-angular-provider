# @rx-signals/angular-provider

You can use this lib for an opinionated [_rx-signals_](https://github.com/gneu77/rx-signals) integration into your Angular application.

## Installation

**`npm install --save @rx-signals/angular-provider@3.0.0-rc4`**

If you have not yet installed the _rx-signals_ store, please see [@rx-signals/store](https://github.com/gneu77/rx-signals#installation) documentation on how to install the latest 3.x version of that peer-dependency.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Usage

The standard-case should be to use a single `Store` instance over your whole application.

### Using a single store instance over the whole application

In the topmost module that should use the store (AppModule, SharedModule, CoreModule, or whatever it is for you), you can just import `RxSignalsStoreModule`.
This will provide a `Store` singleton everywhere (so even lazy-loaded feature-modules will receive the same instance).

Instead, if you have functions performing setup with the store (`(store: Store) => void`), you can use `RxSignalsStoreModule.withRootStore()`, passing as many of those setup-functions as arguments as you like.

You can also use `RxSignalsStoreModule.withRootStore()` in your feature-modules (whether lazy or not) to pass corresponding setup-functions of those feature-modules.

> You might be used to modules that come with `forRoot()` and `forFeature()` functions.
> These names make no sense in case of the RxSignalsStoreModule, because the standard-case is to use a single store-instance in all your modules and thus, all these modules should call `withRootStore()`.
> See the next section on use-cases for `withChildStore()`.

### Optionally using child-stores

If you are really sure that you have a feature-module where you want to use a child-store (derived from the root-store that you get with `RxSignalsStoreModule` or `RxSignalsStoreModule.withRootStore()`), then you can do so by importing `RxSignalsStoreModule.withChildStore()`.

Make sure to [read the documentation on child-stores](https://rawcdn.githack.com/gneu77/rx-signals/master/docs/tsdoc/classes/Store.html#createChildStore).

Also, be aware that [store-lifecycles](https://rawcdn.githack.com/gneu77/rx-signals/master/docs/tsdoc/classes/Store.html#getLifecycleHandle) might be a better option for your use-case.

### Setup effects

If you read about the [concept about side-effect-isolation with the store](https://github.com/gneu77/rx-signals/blob/master/docs/rx-signals_start.md#effect-isolation), you know that the only side-effect that the functions passed to `RxSignalsStoreModule.withRootStore()` and/or `RxSignalsStoreModule.withRootStore()` are allowed to to is calling methods of the passed store.
All the signals being setup in this process should be free of side-effects (allowing you to call the setup-functions in your tests without any need of mockup).

Consequently, the side-effects must be injected to the store by corresponding calls to `store.addEffect`.

The suggested way to do so, is to inject the store in services that perform the effects and call `store.addEffect` there.
In your unit-tests, you would then just mock the effects themselves by `store.addEffect(effectId, () => someMockupReturn)` (so no need to mock the whole service).