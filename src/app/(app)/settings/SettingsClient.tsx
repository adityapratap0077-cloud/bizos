'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import { updateBusinessSettings } from '@/actions/settings';
import { validateBusinessSettings, type FieldErrors } from '@/lib/validations';
import { CURRENCIES } from '@/lib/currency';
import type { Business } from '@/lib/types';

const COMING_SOON = [
  {
    name: 'Subscriptions & billing',
    description: 'Stripe / Razorpay — not built yet',
  },
  {
    name: 'WhatsApp automation',
    description: 'Send booking reminders and payment nudges on WhatsApp.',
  },
  {
    name: 'AI assistant',
    description: 'Ask questions about your business in plain language.',
  },
  {
    name: 'Email reminders',
    description: 'Automatic follow-ups for unpaid invoices and upcoming bookings.',
  },
  {
    name: 'Recurring invoices',
    description: 'Auto-generate invoices for retainers and subscriptions.',
  },
  {
    name: 'Team members',
    description: 'Invite staff with their own logins and roles.',
  },
];

export default function SettingsClient({ business }: { business: Business }) {
  const { toast } = useToast();
  const [name, setName] = useState(business.name ?? '');
  const [logoUrl, setLogoUrl] = useState(business.logo_url ?? '');
  const [email, setEmail] = useState(business.email ?? '');
  const [phone, setPhone] = useState(business.phone ?? '');
  const [address, setAddress] = useState(business.address ?? '');
  const [currency, setCurrency] = useState(business.currency ?? 'INR');
  const [taxName, setTaxName] = useState(business.tax_name ?? 'GST');
  const [taxRate, setTaxRate] = useState(String(business.tax_rate ?? 0));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      logo_url: logoUrl,
      email,
      phone,
      address,
      currency,
      tax_name: taxName,
      tax_rate: taxRate,
    };

    const clientErrors = validateBusinessSettings({
      ...payload,
      tax_rate: Number(taxRate || 0),
    });
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    try {
      const result = await updateBusinessSettings(payload);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast(result.error, 'error');
        return;
      }
      setErrors({});
      toast('Settings saved.', 'success');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="How your business appears on invoices and across BizOS."
      />

      <Card className="mb-8">
        <form id="settings-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Business name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Logo URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            error={errors.logo_url}
            hint="Paste an image URL — stored as a link, no upload needed."
            placeholder="https://…"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />
          </div>
          <Textarea
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              error={errors.currency}
              options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
            />
            <Input
              label="Tax name"
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="e.g. GST"
            />
            <Input
              label="Tax rate (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              error={errors.tax_rate}
            />
          </div>
        </form>
        <div className="mt-5 flex justify-end">
          <Button type="submit" form="settings-form" loading={saving}>
            Save settings
          </Button>
        </div>
      </Card>

      <h2 className="mb-1 text-lg font-semibold text-gray-900">Coming soon</h2>
      <p className="mb-4 text-sm text-gray-500">
        These are on the roadmap. Nothing here will charge you — BizOS V1 is free.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMING_SOON.map((item) => (
          <Card key={item.name} className="flex flex-col">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="mb-4 mt-1 flex-1 text-sm text-gray-500">{item.description}</p>
            <Button variant="secondary" disabled>
              Coming soon
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
