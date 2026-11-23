import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';
import PromoCodeForm from './promo-code-form';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!isAdmin(user)) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold mb-1">Promo codes</h1>
        <p className="text-sm text-slate-500 mb-6">Each code unlocks one resume, once.</p>
        <PromoCodeForm />
      </div>
    </div>
  );
}
