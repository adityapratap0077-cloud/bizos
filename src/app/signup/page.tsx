import type { Metadata } from 'next';
import SignupForm from './SignupForm';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-ink-50 px-4 py-10">
      <SignupForm />
    </main>
  );
}
