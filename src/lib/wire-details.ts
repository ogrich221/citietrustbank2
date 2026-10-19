import type { RecipientAddress } from "@/lib/transfers-store";

export const emptyWireAddress = (): RecipientAddress => ({ street: "", city: "", stateOrProvince: "", postalCode: "", country: "" });

export function validateWireAddresses(recipient: RecipientAddress, bank: RecipientAddress): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [prefix, address] of [["recipient", recipient], ["bank", bank]] as const) {
    for (const key of ["street", "city", "postalCode", "country"] as const) {
      if (!address[key]?.trim()) errors[`${prefix}.${key}`] = "This address detail is required.";
    }
  }
  return errors;
}

export function formatWireAddress(address?: RecipientAddress): string {
  if (!address) return "Not provided on this older request";
  return [address.street, address.city, address.stateOrProvince, address.postalCode, address.country].filter(Boolean).join(", ");
}