import type { Acl } from 'fastly:acl';
import type { Backend } from 'fastly:backend';
import type { ConfigStore } from 'fastly:config-store';
import type { KVStore } from 'fastly:kv-store';
import type { Logger } from 'fastly:logger';
import type { SecretStore } from 'fastly:secret-store';
import type { Context } from './index.js';

type Def<T extends string> = T | `${T}:${string}`;
type Defs<T extends string> = T extends string ? Def<T> : never;

const BindingStringToContextKeyMapping = {
  Acl: 'ACLS',
  Backend: 'BACKENDS',
  ConfigStore: 'CONFIG_STORES',
  env: 'ENV',
  KVStore: 'KV_STORES',
  Logger: 'LOGGERS',
  SecretStore: 'SECRET_STORES',
} as const;
export type ResourceType = keyof typeof BindingStringToContextKeyMapping;
export type BindingsString = Defs<ResourceType>;
export type EnvBindingsDefs = Record<string, BindingsString>;

type BindingStringToResourceInstanceTypeMapping = {
  Acl: Acl;
  Backend: Backend;
  ConfigStore: ConfigStore;
  env: string;
  KVStore: KVStore;
  Logger: Logger;
  SecretStore: SecretStore;
};

export type ResourceInstance<T> =
  T extends Def<infer K extends keyof BindingStringToResourceInstanceTypeMapping>
    ? BindingStringToResourceInstanceTypeMapping[K]
    : never;

export type BuildBindings<T extends EnvBindingsDefs> = {
  [K in keyof T]: ResourceInstance<T[K]>;
};

function isResourceType(resourceType: string): resourceType is ResourceType {
  return resourceType in BindingStringToContextKeyMapping;
}

function getResourceType(typeName: string): ResourceType | undefined {
  const [resourceType,] = typeName.split(':');
  if (isResourceType(resourceType)) {
    return resourceType;
  }
  return undefined;
}

function getResourceName(key: string, typeName: string) {
  const [,seg,] = typeName.split(':');
  return seg ?? key;
}

export function buildEnvironment<T extends EnvBindingsDefs>(
  context: Context,
  envBindingsDefs: T
): BuildBindings<T> {
  const target: Record<string, unknown> = {};

  const getEntry = (key: string | symbol) => {
    if (typeof key !== "string") {
      return undefined;
    }

    const typeName = envBindingsDefs[key];
    const resourceType = getResourceType(typeName);
    if (resourceType == null) {
      return undefined;
    }
    const resourceName = getResourceName(key, typeName);
    const contextKey = BindingStringToContextKeyMapping[resourceType];
    const contextEntry = context[contextKey];
    if (contextEntry == null) {
      return undefined;
    }
    return contextEntry[resourceName];
  };

  const handler: ProxyHandler<typeof target> = {
    get(_, key) {
      return getEntry(key);
    },
    has(_, key) {
      return getEntry(key) !== undefined;
    },
  };

  return new Proxy(target, handler) as unknown as BuildBindings<T>;
}
