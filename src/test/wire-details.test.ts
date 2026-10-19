import { describe, expect, it } from 'vitest';
import { emptyWireAddress, validateWireAddresses, formatWireAddress } from '@/lib/wire-details';

const address = { street: '123 Main Street', city: 'New York', stateOrProvince: 'NY', postalCode: '10001', country: 'United States' };
describe('Required wire address details for every user', () => {
  it('rejects a wire missing the recipient bank address', () => {
    expect(Object.keys(validateWireAddresses(address, emptyWireAddress()))).toEqual(['bank.street', 'bank.city', 'bank.postalCode', 'bank.country']);
  });
  it('rejects a wire missing the recipient address', () => {
    expect(Object.keys(validateWireAddresses(emptyWireAddress(), address))).toEqual(['recipient.street', 'recipient.city', 'recipient.postalCode', 'recipient.country']);
  });
  it('accepts complete recipient and bank addresses', () => {
    expect(validateWireAddresses(address, address)).toEqual({});
  });
  it('retains the full recipient bank address for review', () => {
    expect(formatWireAddress(address)).toBe('123 Main Street, New York, NY, 10001, United States');
  });
});