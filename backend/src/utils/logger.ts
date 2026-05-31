type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}]: ${message}`;
  }

  public info(message: string, ...meta: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(this.formatMessage('INFO', message), ...meta);
  }

  public warn(message: string, ...meta: unknown[]): void {
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage('WARN', message), ...meta);
  }

  public error(message: string | Error, ...meta: unknown[]): void {
    if (message instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('ERROR', message.message), message.stack, ...meta);
    } else {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('ERROR', message), ...meta);
    }
  }

  public debug(message: string, ...meta: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('DEBUG', message), ...meta);
    }
  }
}

export const logger = new Logger();
