# The Brothers Catering Services — Setup Guide

This site runs entirely on **Supabase** (free tier) for its database, authentication,
and server-side logic. There is no separate backend server to deploy — Supabase
provides that, and the site itself is a static frontend you can host anywhere.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Create a new project. Pick any name and a strong database password (save it somewhere).
3. Wait a minute or two for it to finish provisioning.

## 2. Run the database schema

1. In your Supabase project, go to **SQL Editor** (left sidebar).
2. Click **New Query**.
3. Open `supabase/schema.sql` from this project, copy the entire contents, and paste it in.
4. Click **Run**. This creates every table, security rule, and the automatic
   WhatsApp notification triggers in one go.

If you want phone number (OTP) login to work, also enable it:
- Go to **Authentication → Providers → Phone** and turn it on.
- You'll need to connect an SMS provider (Twilio is the default option Supabase suggests) —
  follow Supabase's on-screen instructions there.

## 3. Get your API keys

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In this project folder, copy `.env.example` to a new file named `.env.local`.
4. Paste your values in:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Run it locally to test

```bash
npm install
npm run dev
```

Visit the local URL it gives you. The **first person to ever sign up becomes the Main Admin**
automatically — so sign up for an account first thing, before sharing the site with anyone else.

## 5. Set up WhatsApp notifications (optional but recommended)

1. Sign in as the Main Admin → go to **Admin Portal → Notifications**.
2. Create a free [Twilio](https://www.twilio.com/try-twilio) account.
3. In Twilio, go to **Messaging → Try It Out → Send a WhatsApp Message** to activate their sandbox.
4. Back in the Admin Portal, fill in:
   - **Your WhatsApp Number** — your own phone, e.g. `+233547164110`
   - **Twilio From / WhatsApp Sender** — usually `whatsapp:+14155238886` (Twilio's sandbox number)
   - **Twilio Account SID** and **Auth Token** — found on your Twilio Console dashboard
5. Save, then click **Send Test Notification** to confirm it works.

From then on, every new booking or shop order automatically sends you a WhatsApp message —
this happens server-side in Supabase, so it works even if no one has the website open.

## 5b. Brand the sign-up/OTP emails with your business name

By default, Supabase's confirmation and OTP emails are sent from a generic Supabase address
and say "Confirm your signup" with no mention of your business. To brand them:

1. In Supabase, go to **Authentication → Email Templates**.
2. For each template (especially **Confirm signup** and **Magic Link**), edit the **Subject** and
   body so they reference **The Brothers Catering Services** by name — e.g. change the subject to
   `Verify your email — The Brothers Catering Services`, and update the heading inside the template
   the same way.
3. Optionally go to **Authentication → Settings → SMTP Settings** and connect your own sender
   (e.g. `no-reply@yourdomain.com` via a provider like Resend or Gmail SMTP) so the "from" address
   also shows your business name instead of Supabase's default sender.
4. Click **Save** on each template — changes apply immediately, no redeploy needed.

This is a one-time dashboard change — no code change required, and it applies to every
confirmation/OTP email sent from then on.

## 5c. Set up Google and Facebook login

The site has "Continue with Google" and "Continue with Facebook" buttons on both the
Sign In and Sign Up pages. They won't work until you connect each provider — about
15 minutes total, free for both.

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com) → create a new project
   (or use an existing one).
2. Go to **APIs & Services → OAuth consent screen** → fill in the app name (e.g.
   "The Brothers Catering Services"), support email, and your site's domain once you have one.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Authorized redirect URIs: add your Supabase callback URL, which looks like
     `https://<your-project-ref>.supabase.co/auth/v1/callback` (find your exact project
     ref under Supabase → Project Settings → General).
4. Copy the **Client ID** and **Client Secret** Google gives you.
5. In Supabase, go to **Authentication → Providers → Google**, toggle it on, and paste in
   the Client ID and Client Secret. Save.

### Facebook

1. Go to [Facebook for Developers](https://developers.facebook.com) → **My Apps → Create App**
   → choose "Consumer" as the type.
2. Add the **Facebook Login** product to your app.
3. Under Facebook Login → Settings, add your Supabase callback URL (same one as above,
   `https://<your-project-ref>.supabase.co/auth/v1/callback`) to **Valid OAuth Redirect URIs**.
4. Copy the **App ID** and **App Secret** from Settings → Basic.
5. In Supabase, go to **Authentication → Providers → Facebook**, toggle it on, and paste in
   the App ID and App Secret. Save.

Once both are enabled in Supabase, the buttons on the site work immediately — no redeploy needed.

> Note: while testing, both Google and Facebook apps start in "development/testing mode,"
> meaning only accounts you've explicitly added as testers can sign in. You'll need to
> publish each app (a quick step in each platform's dashboard) before the general public
> can use the buttons.

## 6. Deploy the site

This is a static Vite app, so any static host works. Two good free options:

### Option A: Netlify (easiest)
1. Run `npm run build` — this creates a `dist/` folder.
2. Go to [netlify.com](https://netlify.com), sign up free.
3. Drag the `dist/` folder onto their dashboard. Done — you get a live URL instantly.
4. Go to **Site Settings → Environment Variables** and add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` there too, then trigger a redeploy — this is needed because
   the `.env.local` file you made earlier is only for your own computer, not the live site.
5. Once it's live, go to **Domain Settings** to connect a custom domain you've purchased.

### Option B: Vercel
Same idea — `npm run build`, then either drag-and-drop the `dist/` folder on vercel.com,
or connect your GitHub repo for automatic deploys. Add the same two environment variables
under **Project Settings → Environment Variables**.

## Staff accounts

As the Main Admin, go to **Admin Portal → Staff** to either:
- Generate a single-use invite code for a specific person, or
- Turn on "Invite Code Self-Registration" and share one reusable code with your team —
  they redeem it at `/staff-signup` after creating their own account.

Staff get a limited view of the Admin Portal (bookings and orders only, no revenue figures,
no staff/customer management) — only the Main Admin sees everything.

## Notes on how accounts work

- **Customers**: anyone who signs up normally gets a `customer` account automatically.
- **Staff**: promoted via invite code redemption, gets limited admin access.
- **Main Admin**: there is exactly one — automatically the very first person who ever
  signs up on this site. This can't be changed later except by directly editing the
  `admin_settings`/`profiles` tables in Supabase if you ever truly need to.

## 6. Updates in this version — what to run/click

1. **Run the new migration**: SQL Editor → New Query → paste the entire contents of `supabase/migration_02.sql` → Run. Safe to run on a live project; it only adds tables/columns, it doesn't drop anything.
2. **Enable password reset emails**: Authentication → URL Configuration → Redirect URLs → add `https://YOUR-DOMAIN/reset-password` (and `http://localhost:5173/reset-password` for local testing).
3. **Create a Storage bucket for the Gallery**: Storage → New bucket → name it exactly `gallery` → toggle **Public** on. (This is separate from the existing `staff-hub` bucket and is required for the new admin gallery uploader to work.)
4. Everything else (second admin, country-code phone input, Our Staff page, customer reviews) works automatically after the migration — no extra setup needed.
