import { describe, it, expect } from 'vitest';
import { customerSchema } from './customer';

describe('Customer Schema', () => {
  it('validates a correct customer payload', () => {
    const validCustomer = {
      fullName: 'John Doe',
      customerType: 'RESIDENTIAL',
      contactNumber: '03001234567',
      cnic: '35202-1234567-1',
      city: 'Lahore',
      address: 'House 1, Street 1, DHA',
      systemSizeKw: '10',
      packageTier: 'Premium',
      billingType: 'Monthly',
      monitoringTime: '24/7',
    };
    
    const result = customerSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it('fails validation on missing required fields', () => {
    const invalidCustomer = {
      fullName: 'J', // too short
      contactNumber: '123', // too short
    };
    
    const result = customerSchema.safeParse(invalidCustomer);
    expect(result.success).toBe(false);
  });
});
