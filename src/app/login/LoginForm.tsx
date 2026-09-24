'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { signInAction } from '@/actions/auth';
import { validateCredentials, type FieldErrors } from '@/lib/validations';
import { Button, Card, Input } from '@/components/ui';
import GoogleButton from '@/components/GoogleButton';
import { useToast } from '@/components/Toast';

export default function LoginForm({
  initialError = '',
}: {
  initialError?: string;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const fieldErrors = validateCredentials({ email, password });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      // A successful sign-in redirects server-side (redirect() throws),
      // so reaching the next line always means failure.
      const result = await signInAction({ email, password });
      if (!result.ok) {
        const message = result.error ?? 'Sign in failed. Please try again.';
        setFormError(message);
        toast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
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
          Sign in to manage your business dashboard.
        </p>
      </div>
      <Card>
        <GoogleButton />
        <div className="my-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-ink-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
            or continue with email
          </span>
          <span className="h-px flex-1 bg-ink-200" />
        </div>
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
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-pine-600 hover:text-pine-700">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
