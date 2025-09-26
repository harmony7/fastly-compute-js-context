# Fastly Compute Context Utility

by Katsuyuki Omuro (harmony7@pex2.jp)

`@h7/fastly-compute-js-context` exposes Fastly Compute resources behind one **typed, immutable context**:

```ts
type Context = Readonly<{
  ACLS: Acls;
  BACKENDS: Backends;
  CONFIG_STORES: ConfigStores;
  ENV: Env;
  KV_STORES: KVStores;
  LOGGERS: Loggers;
  SECRET_STORES: SecretStores;
}>;
```

Each top-level field is a **Proxy**. Accessing a property lazily looks up and caches the corresponding runtime object. Unknown names return `undefined` instead of throwing.

## Features

- **A single source of truth**: grab everything off `ctx.*`
- **Lazy + memoized**: nothing is created until accessed
- **Readonly**: the `Context` is immutable
- **DX-oriented**: string keys with completions for the well-known categories; safe `undefined` for optional bindings.

## Installation

```bash
npm install @h7/fastly-compute-js-context
```

> Requires a [Fastly Compute JavaScript project (`@fastly/js-compute`)](https://www.fastly.com/documentation/guides/compute/developer-guides/javascript/).

## Quick start

```typescript
/// <reference types="@fastly/js-compute" />
import { createContext } from '@h7/fastly-compute-js-context';

addEventListener('fetch', (event) => event.respondWith(handler()));

async function handler(): Promise<Response> {
  const ctx = createContext();

  // Environment — simple strings (or empty string if not present)
  console.log('FASTLY_SERVICE_VERSION', ctx.ENV.FASTLY_SERVICE_VERSION);

  // Config Store — read static config value
  const myConfigStore = ctx.CONFIG_STORES.my_config_store;
  const flag = myConfigStore?.get("feature_enable_cool_stuff") === "true";

  // Secret Store — property is the store, or undefined if not configured
  const aws = ctx.SECRET_STORES.AWS_CREDENTIALS;     // SecretStore from @fastly/js-compute
  const keyId = await aws?.get('AWS_ACCESS_KEY_ID'); // SecretStoreEntry
  console.log('key id', keyId?.plaintext());

  // KV Store — grab by name, then use its API
  const users = ctx.KV_STORES.users;   // KVStore from @fastly/js-compute
  const user = await users?.get("42"); // KVStoreEntry
  console.log('user id', await user?.text());

  // Backend — pass to fetch() options, or learn about the backend
  const backend = ctx.BACKENDS.origin; // Backend from @fastly/js-compute
  const res = await fetch("https://example.com/", { backend });
  console.log('health', backend?.health());

  // Logger — send output to a named Fastly logging endpoint.
  const logger = ctx.LOGGERS.my_log_endpoint;  // Logger from @fastly/js-compute
  logger?.log(`${event.request.url} ${event.client.address}`);

  return new Response("ok");
}
```

## API

### `createContext(): Context`

Creates a new immutable `Context`. Each sub-object is a `Proxy` that:

- **Resolves lazily** on first property access.
- **Caches** the resolved handle for subsequent accesses within the same context instance.
- **Returns `undefined`** for names that don’t exist (except for `ENV`, which returns the empty string).
- **Is not enumerable** by design (don’t rely on `Object.keys` / `for ... in` to list resources).

### Categories & Expected Shapes

> Exact shapes follow Fastly’s runtime APIs you already know. Below are the **TypeScript faces** you’ll see at call sites.

- **`ENV`**: `Readonly<Record<string, string>>`  
  Access via `ctx.ENV.MY_VAR`. Absent keys → empty string.

- **`SECRET_STORES`**: `Readonly<Record<string, SecretStore | undefined>>`  
  Access a secret store then call its methods:
  ```ts
  const secretStore = ctx.SECRET_STORES.my_secret_store;
  const secret = await secretStore?.get("NAME");
  const value = secret?.plaintext();
  ```

- **`CONFIG_STORES`**: `Readonly<Record<string, ConfigStore | undefined>>`  
  ```ts
  const configStore = ctx.CONFIG_STORES.my_config_store;
  const logLevel = await configStore?.get("log_level");
  ```

- **`KV_STORES`**: `Readonly<Record<string, KVStore | undefined>>`  
  ```ts
  const kvStore = ctx.KV_STORES.cache;
  const k = await kvStore?.get("k");
  const value = await k.text();
  await kvStore?.put("k", "v");
  ```

- **`BACKENDS`**: `Readonly<Record<string, Backend | undefined>>`
  ```ts
  const backend = ctx.BACKENDS.origin;
  await fetch("https://example.com", { backend });
  const health = backend?.health();
  ```

- **`LOGGERS`**: `Readonly<Record<string, Logger | undefined>>`  
  ```ts
  const logger = ctx.LOGGERS.my_log_endpoint;
  logger?.log(`foo`);
  ```

- **`ACLS`**: `Readonly<Record<string, Acl | undefined>>`  
  ```ts
  const myAcl = ctx.ACLS.myacl;
  const match = await myAcl.lookup(event.client.address);
  const result = match?.action === 'BLOCK' ? 'blocked' : 'allowed';  
  ```

## Caveats

- **Don’t enumerate** category proxies; treat them as name-indexed lookups.
- **Don’t mutate** the context or its sub-objects; it’s intentionally `Readonly`.
- **Expect `undefined`** for missing bindings and code accordingly (`?.`/guard).

## License

[MIT](./LICENSE).
