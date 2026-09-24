import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-ink-50 px-4 py-10">
      <LoginForm />
    </main>
  );
}
