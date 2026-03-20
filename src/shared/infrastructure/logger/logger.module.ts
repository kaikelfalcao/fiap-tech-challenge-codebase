import { Module, Global } from '@nestjs/common';
import newrelicFormatter from '@newrelic/winston-enricher';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const newrelicWinstonFormatter = newrelicFormatter(winston);

const isProd = process.env.NODE_ENV === 'production';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: isProd
            ? winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                newrelicWinstonFormatter(),
                winston.format.json(),
              )
            : winston.format.combine(
                winston.format.timestamp({
                  format: 'DD/MM/YYYY HH:mm:ss',
                }),
                winston.format.ms(),
                winston.format.colorize(),
                winston.format.printf(
                  ({ timestamp, level, message, context, ms, stack }) => {
                    return `[Nest] ${process.pid} - ${timestamp} ${level.toUpperCase()} ${
                      context ? `[${context}]` : ''
                    } ${message} ${ms || ''} ${stack || ''}`;
                  },
                ),
              ),
        }),
      ],
    }),
  ],
})
export class LoggerModule {}
