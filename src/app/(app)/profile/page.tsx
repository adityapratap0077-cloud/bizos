import { requireBusiness } from '@/lib/business';
import type { Profile } from '@/lib/types';
import ProfileClient from './ProfileClient';

export const metadata = { title: 'Profile — BizOS' };

export default async function ProfilePage() {
  const { supabase, user } = await requireBusiness();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  const profile = (data as Profile | null) ?? null;

  return <ProfileClient profile={profile} email={user.email ?? ''} />;
}
