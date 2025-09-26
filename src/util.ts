export type ReadonlyOptionalMap<T> = Readonly<Record<string, T | undefined>>;

export function loadOptionalStringMap<T>(getter: (key: string) => T | undefined) {
  const cache = new Map<string, T | undefined>();
  const target: Record<string, unknown> = {};

  const getEntry = (key: string | symbol) => {
    if (typeof key !== "string") {
      return undefined;
    }

    if (cache.has(key)) {
      return cache.get(key);
    }

    const entry = getter(key);
    cache.set(key, entry);
    return entry;
  };

  const handler: ProxyHandler<typeof target> = {
    get(_, key) {
      return getEntry(key);
    },
    has(_, key) {
      return getEntry(key) !== undefined;
    },
  };

  return new Proxy(target, handler) as unknown as ReadonlyOptionalMap<T>;
}
