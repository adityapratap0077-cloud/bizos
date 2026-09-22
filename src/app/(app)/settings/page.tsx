import { requireBusiness } from '@/lib/business';
import SettingsClient from './SettingsClient';

export const metadata = { title: 'Settings — BizOS' };

export default async function SettingsPage() {
  const { business } = await requireBusiness();
  return <SettingsClient business={business} />;
}
