'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { signUpAction } from '@/actions/auth';
import { validateCredentials, type FieldErrors } from '@/lib/validations';
import { Button, Card, Input } from '@/components/ui';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { CheckCircle } from '@phosphor-icons/react';
import { useToast } from '@/components/Toast';

export default function SignupForm() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const fieldErrors = validateCredentials({ email, password });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      // A successful sign-up without email confirmation redirects server-side
      // (redirect() throws), so reaching the next line means either failure
      // or a confirmation step is required.
      const result = await signUpAction({
        email,
        password,
        fullName: fullName.trim() || undefined,
        businessName: businessName.trim() || undefined,
      });
      if (result.ok && result.needsConfirmation) {
        setNeedsConfirmation(true);
        toast('Account created — check your email to confirm.', 'success');
      } else if (!result.ok) {
        const message = result.error ?? 'Sign up failed. Please try again.';
        setFormError(message);
        toast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto mt-16 max-w-md">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pine-100">
            <EnvelopeSimple className="h-6 w-6 text-pine-700" weight="duotone" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-ink-900">Check your email</h1>
          <p className="mt-2 text-sm text-ink-600">
            We sent a confirmation link to <span className="font-medium">{email}</span>.
            Click the confirmation link, then sign in.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button size="lg">Go to sign in</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-3" aria-label="BizOS home">
          <span className="flex h-12 w-12 items-center justify-center rounded-surface bg-pine-600 font-display text-xl font-bold text-white shadow-card" aria-hidden="true">
            B
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-ink-950">BizOS</span>
        </Link>
        <p className="mt-2 text-[15px] text-ink-500">
          Create your free account. No credit card required.
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-clay-200 bg-clay-50 px-4 py-3 text-sm text-clay-700"
            >
              {formError}
            </div>
          )}
          <Input
            label="Your name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Priya Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Business name"
            name="businessName"
            type="text"
            autoComplete="organization"
            placeholder="Sharma Studio"
            hint="You can change this later in Settings"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={loading}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            hint="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {loading ? 'Creating account…' : 'Create free account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-pine-600 hover:text-pine-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
