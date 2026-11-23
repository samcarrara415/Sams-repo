import Link from 'next/link';
import { getPublicReviews, type PublicReview } from '@/lib/reviews';
import { StarIcon, CheckIcon } from '@/components/icons';

// Rebuild the page at most every 5 minutes so new reviews show up.
export const revalidate = 300;

const steps = [
  { title: 'Upload your resume', desc: 'PDF or Word (.docx). The file is read on the server and not kept.' },
  { title: 'Pick the role', desc: 'Choose from 28 job types and add notes if you like, such as "keep it to one page".' },
  { title: 'Preview, then unlock', desc: 'See the first part free. Unlock the full text to copy or download it.' },
];

const UNLOCK_LABELS: Record<string, string> = {
  single: 'Single resume',
  monthly: 'Monthly plan',
  promo: 'Promo code',
};

function ReviewCard({ review }: { review: PublicReview }) {
  const date = new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return (
    <figure className="card p-5 flex flex-col">
      <div className="flex gap-0.5 text-amber-500 mb-3" aria-label={`${review.rating} out of 5`}>
        {[1, 2, 3, 4, 5].map(n => <StarIcon key={n} filled={n <= review.rating} />)}
      </div>
      <blockquote className="text-sm leading-relaxed text-slate-700 flex-1">{review.comment}</blockquote>
      <figcaption className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{review.display_name || 'Anonymous'}</span>
        {review.job_type && <> · {review.job_type}</>}
        {review.unlock_method && <> · {UNLOCK_LABELS[review.unlock_method] ?? review.unlock_method}</>}
        {' · '}{date}
      </figcaption>
    </figure>
  );
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <CheckIcon className="w-4 h-4 mt-0.5 text-brand-700 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export default async function LandingPage() {
  const reviews = await getPublicReviews();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold">Resume Remaster</span>
          <div className="flex gap-2">
            <Link href="/login" className="btn-secondary py-1.5 px-3 text-sm">Log in</Link>
            <Link href="/signup" className="btn-primary py-1.5 px-3 text-sm">Sign up</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl leading-tight">
              Rewrite your resume for the job you want.
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Upload your resume and pick a role. Claude rewrites it for that role, keeping your facts as they are.
              The preview is free; the full text is $2.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-5 py-3">Get a free preview</Link>
              <a href="#pricing" className="btn-secondary px-5 py-3">See pricing</a>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold mb-8">How it works</h2>
          <ol className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <li key={step.title} className="card p-5">
                <span className="inline-grid place-items-center w-7 h-7 rounded-full border border-slate-300 text-sm font-medium text-slate-600 mb-3">
                  {i + 1}
                </span>
                <h3 className="font-medium mb-1">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {reviews.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
            <p className="text-sm text-slate-600 mb-8">Left by people after unlocking a resume. Newest first.</p>
            <div className="grid md:grid-cols-3 gap-5">
              {reviews.map((review, i) => <ReviewCard key={i} review={review} />)}
            </div>
          </section>
        )}

        <section id="pricing" className="bg-white border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-semibold mb-2">Pricing</h2>
            <p className="text-sm text-slate-600 mb-8">You need a free account to upload. Previews are free, up to 5 a day.</p>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
              <div className="card p-6 flex flex-col">
                <h3 className="font-medium">One resume</h3>
                <p className="mt-2"><span className="text-4xl font-semibold">$2</span> <span className="text-slate-500">one-time</span></p>
                <ul className="mt-5 mb-6 space-y-2 text-sm text-slate-700 flex-1">
                  <PlanFeature>Unlocks the full rewrite of one resume</PlanFeature>
                  <PlanFeature>Copy it or download it as a text file</PlanFeature>
                </ul>
                <Link href="/signup" className="btn-secondary w-full">Get started</Link>
              </div>
              <div className="card p-6 flex flex-col">
                <h3 className="font-medium">Monthly</h3>
                <p className="mt-2"><span className="text-4xl font-semibold">$8</span> <span className="text-slate-500">per month</span></p>
                <ul className="mt-5 mb-6 space-y-2 text-sm text-slate-700 flex-1">
                  <PlanFeature>Every resume you make is unlocked straight away</PlanFeature>
                  <PlanFeature>No daily preview limit</PlanFeature>
                  <PlanFeature>Cancel from your dashboard at any time</PlanFeature>
                </ul>
                <Link href="/signup" className="btn-primary w-full">Get started</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto w-full px-4 py-8 text-sm text-slate-500">
        Uploaded files are parsed on the server and not stored. The rewritten text is saved to your account.
        Payments are handled by Stripe.
      </footer>
    </div>
  );
}
