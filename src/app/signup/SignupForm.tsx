'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { signUpAction } from '@/actions/auth';
import { validateCredentials, type FieldErrors } from '@/lib/validations';
import { Button, Card, Input } from '@/components/ui';
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-600">
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
      <div className="mb-6 text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
          BizOS
        </Link>
        <p className="mt-2 text-sm text-gray-500">
          Create your free account. No credit card required.
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
