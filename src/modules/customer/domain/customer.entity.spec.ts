import type { CustomerId } from './customer-id.vo';
import { Customer } from './customer.entity';
import type { CustomerProps, CreateCustomerProps } from './customer.entity';
import type { TaxId } from './tax-id.vo';

import type { Email } from '@/shared/domain/value-objects/email.vo';

// --- Helpers / Builders ---

const makeEmail = (value = 'john@doe.com'): Email =>
  ({ value }) as unknown as Email;

const makeTaxId = (value = '123.456.789-00'): TaxId =>
  ({ value }) as unknown as TaxId;

const makeCustomerId = (value = 'customer-uuid-1'): CustomerId =>
  ({ value }) as unknown as CustomerId;

const makeCreateProps = (
  overrides: Partial<CreateCustomerProps> = {},
): CreateCustomerProps => ({
  id: makeCustomerId(),
  taxId: makeTaxId(),
  fullName: 'John Doe',
  phone: '(71) 99999-0000',
  email: makeEmail(),
  ...overrides,
});

const makeRestoreProps = (
  overrides: Partial<CustomerProps> = {},
): CustomerProps => ({
  id: makeCustomerId(),
  taxId: makeTaxId(),
  fullName: 'John Doe',
  phone: '(71) 99999-0000',
  email: makeEmail(),
  active: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

// --- Tests ---

describe('Customer', () => {
  describe('create()', () => {
    it('should create a customer with the provided data', () => {
      const props = makeCreateProps();
      const customer = Customer.create(props);

      expect(customer.id()).toBe(props.id);
      expect(customer.taxId).toBe(props.taxId);
      expect(customer.fullName).toBe('John Doe');
      expect(customer.phone).toBe('(71) 99999-0000');
      expect(customer.email).toBe(props.email);
    });

    it('should create a customer with active = true by default', () => {
      const customer = Customer.create(makeCreateProps());
      expect(customer.active).toBe(true);
    });

    it('should set createdAt and updatedAt to the same timestamp', () => {
      const before = new Date();
      const customer = Customer.create(makeCreateProps());
      const after = new Date();

      expect(customer.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(customer.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(customer.createdAt.getTime()).toBe(customer.updatedAt.getTime());
    });
  });

  describe('restore()', () => {
    it('should restore a customer with exact persisted data', () => {
      const props = makeRestoreProps();
      const customer = Customer.restore(props);

      expect(customer.id()).toBe(props.id);
      expect(customer.taxId).toBe(props.taxId);
      expect(customer.fullName).toBe(props.fullName);
      expect(customer.phone).toBe(props.phone);
      expect(customer.email).toBe(props.email);
      expect(customer.active).toBe(props.active);
      expect(customer.createdAt).toBe(props.createdAt);
      expect(customer.updatedAt).toBe(props.updatedAt);
    });

    it('should restore an inactive customer', () => {
      const customer = Customer.restore(makeRestoreProps({ active: false }));
      expect(customer.active).toBe(false);
    });

    it('should not modify createdAt when restoring', () => {
      const createdAt = new Date('2020-06-15T10:00:00Z');
      const customer = Customer.restore(makeRestoreProps({ createdAt }));
      expect(customer.createdAt).toEqual(new Date('2020-06-15T10:00:00Z'));
    });
  });

  describe('changeAttributes()', () => {
    it('should update fullName', () => {
      const customer = Customer.create(makeCreateProps());
      customer.changeAttributes({ fullName: 'Jane Doe' });
      expect(customer.fullName).toBe('Jane Doe');
    });

    it('should update phone', () => {
      const customer = Customer.create(makeCreateProps());
      customer.changeAttributes({ phone: '(11) 98888-1111' });
      expect(customer.phone).toBe('(11) 98888-1111');
    });

    it('should update email', () => {
      const customer = Customer.create(makeCreateProps());
      const newEmail = makeEmail('jane@doe.com');
      customer.changeAttributes({ email: newEmail });
      expect(customer.email).toBe(newEmail);
    });

    it('should update multiple attributes at once', () => {
      const customer = Customer.create(makeCreateProps());
      const newEmail = makeEmail('multi@test.com');
      customer.changeAttributes({
        fullName: 'Multi Test',
        phone: '(00) 00000-0000',
        email: newEmail,
      });

      expect(customer.fullName).toBe('Multi Test');
      expect(customer.phone).toBe('(00) 00000-0000');
      expect(customer.email).toBe(newEmail);
    });

    it('should not change fields that were not provided', () => {
      const customer = Customer.create(makeCreateProps());
      const originalPhone = customer.phone;
      const originalEmail = customer.email;

      customer.changeAttributes({ fullName: 'Only Name Changed' });

      expect(customer.phone).toBe(originalPhone);
      expect(customer.email).toBe(originalEmail);
    });

    it('should update updatedAt after changing attributes', () => {
      const customer = Customer.create(makeCreateProps());
      const before = customer.updatedAt;

      jest.advanceTimersByTime(1);
      customer.changeAttributes({ fullName: 'Updated' });

      expect(customer.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should not modify createdAt when changing attributes', () => {
      const customer = Customer.create(makeCreateProps());
      const createdAt = customer.createdAt;

      customer.changeAttributes({ fullName: 'Changed' });

      expect(customer.createdAt).toBe(createdAt);
    });

    it('should not modify taxId when changing attributes', () => {
      const customer = Customer.create(makeCreateProps());
      const originalTaxId = customer.taxId;

      customer.changeAttributes({ fullName: 'Changed' });

      expect(customer.taxId).toBe(originalTaxId);
    });
  });

  describe('activate()', () => {
    it('should activate an inactive customer', () => {
      const customer = Customer.restore(makeRestoreProps({ active: false }));
      customer.activate();
      expect(customer.active).toBe(true);
    });

    it('should update updatedAt when activating', () => {
      const updatedAt = new Date('2024-01-01T00:00:00Z');
      const customer = Customer.restore(
        makeRestoreProps({ active: false, updatedAt }),
      );

      customer.activate();

      expect(customer.updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
    });

    it('should not update updatedAt if already active', () => {
      const customer = Customer.restore(makeRestoreProps({ active: true }));
      const before = customer.updatedAt;

      customer.activate();

      expect(customer.updatedAt).toBe(before);
    });

    it('should not modify createdAt when activating', () => {
      const customer = Customer.restore(makeRestoreProps({ active: false }));
      const createdAt = customer.createdAt;

      customer.activate();

      expect(customer.createdAt).toBe(createdAt);
    });
  });

  describe('deactivate()', () => {
    it('should deactivate an active customer', () => {
      const customer = Customer.create(makeCreateProps());
      customer.deactivate();
      expect(customer.active).toBe(false);
    });

    it('should update updatedAt when deactivating', () => {
      const updatedAt = new Date('2024-01-01T00:00:00Z');
      const customer = Customer.restore(
        makeRestoreProps({ active: true, updatedAt }),
      );

      customer.deactivate();

      expect(customer.updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
    });

    it('should not update updatedAt if already inactive', () => {
      const customer = Customer.restore(makeRestoreProps({ active: false }));
      const before = customer.updatedAt;

      customer.deactivate();

      expect(customer.updatedAt).toBe(before);
    });

    it('should not modify createdAt when deactivating', () => {
      const customer = Customer.create(makeCreateProps());
      const createdAt = customer.createdAt;

      customer.deactivate();

      expect(customer.createdAt).toBe(createdAt);
    });
  });

  describe('activate/deactivate lifecycle', () => {
    it('should toggle between active and inactive multiple times', () => {
      const customer = Customer.create(makeCreateProps());

      customer.deactivate();
      expect(customer.active).toBe(false);

      customer.activate();
      expect(customer.active).toBe(true);

      customer.deactivate();
      expect(customer.active).toBe(false);
    });
  });
});
