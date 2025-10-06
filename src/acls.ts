/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

import { Acl } from 'fastly:acl';
import { loadOptionalStringMap, type ReadonlyOptionalMap } from "./util.js";

export type Acls = ReadonlyOptionalMap<Acl>;

export function createAcls(): Acls {
  return loadOptionalStringMap((name) => {
    let acl: Acl | undefined;
    try {
      acl = Acl.open(name); // throws if not found or not provisioned
    } catch {
      acl = undefined;
    }
    return acl;
  });
}
