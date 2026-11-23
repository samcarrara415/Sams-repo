import { createAdminClient } from '@/lib/supabase-admin';

export type PublicReview = {
  rating: number;
  comment: string;
  display_name: string | null;
  job_type: string | null;
  unlock_method: 'single' | 'monthly' | 'promo' | null;
  created_at: string;
};

// Reviews are read on the server with only the columns that are safe to show,
// so user and resume ids never leave the database.
export async function getPublicReviews(limit = 6): Promise<PublicReview[]> {
  try {
    const { data } = await createAdminClient()
      .from('reviews')
      .select('rating, comment, display_name, job_type, unlock_method, created_at')
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data as PublicReview[]) ?? [];
  } catch {
    return [];
  }
}
