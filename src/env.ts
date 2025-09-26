import { env } from 'fastly:env';
import { loadOptionalStringMap } from './util.js';

export type Env = {
  FASTLY_CACHE_GENERATION?: string,
  FASTLY_CUSTOMER_ID?: string,
  FASTLY_HOSTNAME?: string,
  FASTLY_IS_STAGING?: string,
  FASTLY_POP?: string,
  FASTLY_REGION?: string,
  FASTLY_SERVICE_ID?: string,
  FASTLY_SERVICE_VERSION?: string,
  FASTLY_TRACE_ID?: string,
  [key: string]: string | undefined,
};

export function createEnv(): Env {
  return loadOptionalStringMap((name) => {
    return env(name);
  });
}
