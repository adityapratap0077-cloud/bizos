'use client';

import { useState } from 'react';
import { Button, Card, Input, PageHeader } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { signOutAction } from '@/actions/auth';
import { updateProfile } from '@/actions/settings';
import { validateProfile, type FieldErrors } from '@/lib/validations';
import type { Profile } from '@/lib/types';

function formatMemberSince(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfileClient({
  profile,
  email,
}: {
  profile: Profile | null;
  email: string;
}) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientErrors = validateProfile({ full_name: fullName });
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({ full_name: fullName });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast(result.error, 'error');
        return;
      }
      setErrors({});
      toast('Profile updated.', 'success');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Your personal account details." />

      <Card className="mb-6 max-w-xl">
        <form id="profile-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.full_name}
            placeholder="Your name"
          />
          <Input label="Email" value={email} readOnly disabled />
        </form>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            Member since {formatMemberSince(profile?.created_at)}
          </p>
          <Button type="submit" form="profile-form" loading={saving}>
            Save
          </Button>
        </div>
      </Card>

      <Card className="max-w-xl">
        <h2 className="mb-1 font-semibold text-ink-900">Sign out</h2>
        <p className="mb-4 text-sm text-ink-500">
          You will be signed out of BizOS on this device.
        </p>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </Card>
    </>
  );
}
