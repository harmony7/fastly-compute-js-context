import { ConfigStore } from 'fastly:config-store';
import { loadOptionalStringMap, type ReadonlyOptionalMap } from './util.js';

export type ConfigStores = ReadonlyOptionalMap<ConfigStore>;

export function createConfigStores(): ConfigStores {
  return loadOptionalStringMap((name) => {
    let configStore: ConfigStore | undefined;
    try {
      configStore = new ConfigStore(name); // throws if not found or not provisioned
    } catch {
      configStore = undefined;
    }
    return configStore;
  });
}
