import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { DomainError } from 'src/domain/errors/domain.error';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let response: any;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle DomainError correctly', () => {
    class TestDomainError extends DomainError {
      readonly code = 'TEST_ERROR';

      constructor() {
        super('Domain error message');
      }
    }

    const error = new TestDomainError();

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'TEST_ERROR',
        message: 'Domain error message',
      },
    });
  });

  it('should handle HttpException correctly', () => {
    const error = new HttpException('Not found', HttpStatus.NOT_FOUND);

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        message: 'Not found',
      },
    });
  });

  it('should handle unexpected errors as INTERNAL_SERVER_ERROR', () => {
    const error = new Error('Unexpected failure');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
      },
    });
  });
});
