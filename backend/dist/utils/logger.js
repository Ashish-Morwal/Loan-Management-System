"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}]: ${message}`;
    }
    info(message, ...meta) {
        // eslint-disable-next-line no-console
        console.log(this.formatMessage('INFO', message), ...meta);
    }
    warn(message, ...meta) {
        // eslint-disable-next-line no-console
        console.warn(this.formatMessage('WARN', message), ...meta);
    }
    error(message, ...meta) {
        if (message instanceof Error) {
            // eslint-disable-next-line no-console
            console.error(this.formatMessage('ERROR', message.message), message.stack, ...meta);
        }
        else {
            // eslint-disable-next-line no-console
            console.error(this.formatMessage('ERROR', message), ...meta);
        }
    }
    debug(message, ...meta) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug(this.formatMessage('DEBUG', message), ...meta);
        }
    }
}
exports.logger = new Logger();
