import { Email } from '../../../../src/domain/value-objects/email.vo';

describe('Email Value Object', () => {
  it('should throw for invalid email', () => {
    expect(() => new Email({ value: 'invalid-email' })).toThrow(
      'Invalid email',
    );
  });

  it('should create a valid email', () => {
    const email = new Email({ value: 'kaike@test.com' });
    expect(email.value).toBe('kaike@test.com');
  });
});
