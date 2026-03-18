export class Email {
  constructor(private value: string) {
    if (!value.includes('@')) {
      throw new Error('Invalid email');
    }
  }

  getValue() {
    return this.value;
  }
}
