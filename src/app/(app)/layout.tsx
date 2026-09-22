import { requireBusiness } from '@/lib/business';
import { AppShell } from '@/components/AppShell';

/**
 * Shared layout for every authenticated page: resolves the user's business
 * server-side (redirects to /login when signed out) and renders the app shell.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, business } = await requireBusiness();
  return (
    <AppShell userEmail={user.email ?? ''} businessName={business.name}>
      {children}
    </AppShell>
  );
}
