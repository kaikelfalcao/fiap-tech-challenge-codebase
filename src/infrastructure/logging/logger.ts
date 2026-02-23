import * as winston from 'winston';

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'cyan',
  },
};

// Adicionar contexto enriquecido para New Relic
const newRelicEnricher = winston.format((info: any) => {
  info['@type'] = 'Log';
  info.timestamp = new Date().toISOString();

  // adicionar stack trace
  if (info instanceof Error || info.stack) {
    info.stack = info.stack || (info instanceof Error ? info.stack : undefined);
  }

  return info;
});

export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    newRelicEnricher(),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: 'core-monitoring-logs',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console para output no Docker logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevels.colors }),
        winston.format.printf(({ level, message, timestamp, ...meta }: any) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        }),
      ),
    }),
    // Arquivo de erros
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
    // Arquivo combinado
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  ],
});

// Tratamento global de exceções
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' }),
);

logger.rejections.handle(
  new winston.transports.File({ filename: 'logs/rejections.log' }),
);
