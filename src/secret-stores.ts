/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

import { SecretStore } from 'fastly:secret-store';
import { loadOptionalStringMap, type ReadonlyOptionalMap } from './util.js';

export type SecretStores = ReadonlyOptionalMap<SecretStore>;

export function createSecretStores(): SecretStores {
  return loadOptionalStringMap((name) => {
    let secretStore: SecretStore | undefined;
    try {
      secretStore = new SecretStore(name); // throws if not found or not provisioned
    } catch {
      secretStore = undefined;
    }
    return secretStore;
  });
}
