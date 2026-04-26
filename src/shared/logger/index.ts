import pino from 'pino';
import { env } from '@shared/config/env';

const logger = pino({
    level: env.LOG_LEVEL,
    transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: { colorize: true },
    } : undefined,
    formatters: {
        level(label) {
            return { level: label };
        },
        bindings(bindings) {
            return { pid: bindings.pid, host: bindings.hostname };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;