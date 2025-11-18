export class Logger {
  static error(message: string, context?: any) {
    if (process.env.NODE_ENV === 'test') {
      return; // Don't log during tests
    }
    console.error(`[ERROR] ${message}`, context);
  }

  static info(message: string, context?: any) {
    if (process.env.NODE_ENV === 'test') {
      return; // Don't log during tests
    }
    console.info(`[INFO] ${message}`, context);
  }

  static warn(message: string, context?: any) {
    if (process.env.NODE_ENV === 'test') {
      return; // Don't log during tests
    }
    console.warn(`[WARN] ${message}`, context);
  }

  static debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'test') {
      return; // Don't log during tests
    }
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }
} 