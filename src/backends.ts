import { Backend } from 'fastly:backend';
import { loadOptionalStringMap, type ReadonlyOptionalMap } from './util.js';

export type Backends = ReadonlyOptionalMap<Backend>;

export function createBackends(): Backends {
  return loadOptionalStringMap((name) => {
    let backend: Backend | undefined;
    try {
      backend = Backend.fromName(name); // throws if not found or not provisioned
    } catch {
      backend = undefined;
    }
    return backend;
  });
}
