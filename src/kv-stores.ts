import { KVStore } from 'fastly:kv-store';
import { loadOptionalStringMap, type ReadonlyOptionalMap } from './util.js';

export type KVStores = ReadonlyOptionalMap<KVStore>;

export function createKVStores(): KVStores {
  return loadOptionalStringMap((name) => {
    let kvStore: KVStore | undefined;
    try {
      kvStore = new KVStore(name); // throws if not found or not provisioned
    } catch {
      kvStore = undefined;
    }
    return kvStore;
  });
}
