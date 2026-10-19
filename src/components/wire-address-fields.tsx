import { Input } from "@/components/ui/input";
import type { RecipientAddress } from "@/lib/transfers-store";

export function WireAddressFields({ title, prefix, value, onChange, errors }: {
  title: string; prefix: string; value: RecipientAddress;
  onChange: (value: RecipientAddress) => void; errors: Record<string, string>;
}) {
  return <fieldset className="space-y-3 border-t border-border pt-4">
    <legend className="text-sm font-semibold text-gold">{title}</legend>
    <div className="grid gap-3 sm:grid-cols-2">
      {([['street', 'Street address'], ['city', 'City'], ['stateOrProvince', 'State / province'], ['postalCode', 'Postal / ZIP code'], ['country', 'Country']] as const).map(([key, label]) => {
        const id = `${prefix}-${key}`;
        return <div key={key} className={key === 'street' ? 'sm:col-span-2' : ''}>
          <label htmlFor={id} className="mb-1 block text-xs text-foreground">{label}{key !== 'stateOrProvince' ? ' *' : ''}</label>
          <Input id={id} required={key !== 'stateOrProvince'} value={value[key] ?? ''} onChange={event => onChange({ ...value, [key]: event.target.value })} aria-invalid={Boolean(errors[`${prefix}.${key}`])} aria-describedby={errors[`${prefix}.${key}`] ? `${id}-error` : undefined} />
          {errors[`${prefix}.${key}`] && <p id={`${id}-error`} className="mt-1 text-xs text-destructive">{errors[`${prefix}.${key}`]}</p>}
        </div>;
      })}
    </div>
  </fieldset>;
}