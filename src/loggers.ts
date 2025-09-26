import { Logger } from 'fastly:logger';
import { loadOptionalStringMap, type ReadonlyOptionalMap } from './util.js';

export type Loggers = ReadonlyOptionalMap<Logger>;

export function createLoggers(): Loggers {
  return loadOptionalStringMap((name) => {
    let logger: Logger | undefined;
    try {
      logger = new Logger(name); // throws if not found or not provisioned
    } catch {
      logger = undefined;
    }
    return logger;
  });
}
