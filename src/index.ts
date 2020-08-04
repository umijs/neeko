import { registerPlugin as registerPluginOriginal } from './__core';

export const registerPlugin = (
  key: string,
  fn: (ins: any, obj: any) => void,
) => {
  registerPluginOriginal(key, fn);
};

export { model, isEffect, setEffect } from './__core';
export { extendObservable, toJS } from 'mobx';
