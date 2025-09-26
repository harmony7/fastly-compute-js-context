import { createAcls, type Acls } from './acls.js';
import { createBackends, type Backends } from './backends.js';
import { createConfigStores, type ConfigStores } from './config-stores.js';
import { createEnv, type Env } from './env.js';
import { createKVStores, type KVStores } from './kv-stores.js';
import { createLoggers, type Loggers } from './loggers.js';
import { createSecretStores, type SecretStores } from './secret-stores.js';

export type Context = Readonly<{
  ACLS: Acls;
  BACKENDS: Backends;
  CONFIG_STORES: ConfigStores;
  ENV: Env;
  KV_STORES: KVStores;
  LOGGERS: Loggers;
  SECRET_STORES: SecretStores;
}>;

let _ctx: Context | undefined = undefined;
export function createContext(): Context {
  if (_ctx === undefined) {
    _ctx = Object.freeze({
      ACLS: createAcls(),
      BACKENDS: createBackends(),
      CONFIG_STORES: createConfigStores(),
      ENV: createEnv(),
      KV_STORES: createKVStores(),
      LOGGERS: createLoggers(),
      SECRET_STORES: createSecretStores(),
    });
  }
  return _ctx;
}
