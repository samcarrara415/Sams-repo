# Resume Remaster (hosted version)

The paid version of [Resume Remaster](../resume-remaster/). Users sign up, upload a PDF or DOCX resume, pick a role, and get a free preview of the rewrite. The full text costs $2 per resume or $8/month for every resume while subscribed. Admins can hand out single-use promo codes.

Stack: Next.js 14 (App Router, TypeScript, Tailwind), Supabase (auth and Postgres), Stripe (Checkout, webhooks, billing portal), the Anthropic API (`claude-opus-5-5`), and `unpdf` and `mammoth` for parsing files on the server.

## How it fits together

| Route | What it does |
| --- | --- |
| `POST /api/remaster` | Parses the upload, calls Claude, stores the result, returns a preview (or the full text for subscribers). Free accounts get 5 previews a day. |
| `GET /api/resumes/[id]` | Returns a resume the user owns. The full text is included only when it is unlocked. |
| `POST /api/checkout` | Starts a Stripe Checkout session for one of the user's locked resumes. |
| `POST /api/webhooks/stripe` | Verifies the signature, skips events it has already processed, unlocks the resume, and keeps the subscription status in sync. |
| `POST /api/redeem` | Redeems a promo code via the `redeem_promo_code` database function, which claims the code and unlocks the resume in one transaction. |
| `POST /api/reviews` | Saves a review. Only allowed for a resume the user has unlocked, one per resume. |
| `POST /api/billing-portal` | Opens Stripe's billing portal so subscribers can cancel. |
| `POST /api/admin/generate-codes` | Creates promo codes. Admin only. |

The browser only reads its own `profiles` row from Supabase. Every other table is read and written by the API routes with the service-role key, and has row-level security enabled with no client policies. Unlocking is decided only by the Stripe webhook, the promo function, or an active subscription; nothing the client sends can unlock a resume.

The landing page shows reviews from the `reviews` table. There is no seeded or sample review data.

## Setup

1. **Supabase.** Create a project. In the SQL editor run `supabase-schema.sql`. If your database was created from an earlier version of that file, run `supabase-upgrade.sql` instead: it removes the old client policies, which let users mark themselves as subscribed and read locked resumes.
2. **Stripe.** Create an $8/month recurring price and copy its ID. Add a webhook endpoint at `https://<your-domain>/api/webhooks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated` and `customer.subscription.deleted`, and copy the signing secret. Turn on the customer portal (Settings > Billing > Customer portal) so the Billing link works.
3. **Environment.** Copy `.env.example` to `.env.local` and fill it in. `ADMIN_EMAIL` is the account allowed to open `/admin`; its email must be confirmed.
4. **Run.**

   ```sh
   npm install
   npm run dev          # http://localhost:3000
   ```

   To test webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

`npm run build && npm start` runs a production build. On Vercel, set the same environment variables. The remaster route sets `maxDuration = 120`, which needs a plan that allows it.

## Limits

- Uploads are capped at 4 MB (Vercel's request body limit is 4.5 MB). Scanned PDFs have no text and are rejected.
- Output is plain text, not a formatted document.
- There is no page listing past resumes yet. A user sees a resume right after generating it and on the post-payment page.
- The daily preview cap counts rows in `resumes`, so it is per account, not per IP. Someone with many accounts can still run up API costs.
- Promo codes are 8 characters from a 32-letter alphabet and are not rate limited.
