import { Email } from '../email.vo';

describe('Email', () => {
  it('Should create a valid Email', () => {
    const email = Email.create('cool.dev@gmail.com');

    expect(email.value).toBe('cool.dev@gmail.com');
  });

  it('should throw for a invalid Email', () => {
    expect(() => Email.create('cool.dev.com')).toThrow();
  });
});
