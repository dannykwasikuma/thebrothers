# What Changed — Summary

## 1. Forgot / Reset Password (new)
- "Forgot password?" link added to Customer and Staff sign-in.
- New `/forgot-password` page sends a reset email.
- `ResetPasswordPage.tsx` (the file you sent) is now wired into the app at `/reset-password`.

## 2. Second Admin (finished & merged)
- Admin → Staff tab: "Promote to Admin" / "Demote to Staff" buttons.
- Enforced server-side too — a regular staff account cannot self-promote.

## 3. Country Code Selector (finished & wired in)
- New `PhoneInput.tsx` (dropdown of countries + number field) is now used on Sign Up and Sign In (phone/OTP).

## 4. Admin Catalog Tab (new) — fixes "can't edit gallery prices / most things"
- Admin → **Catalog** tab, with three sections:
  - **Services** — add/edit/hide, set price + price unit, mark featured.
  - **Shop Products** — add/edit/hide, set price.
  - **Gallery** — upload photos, set title/category, **set a starting price** (new field).
- All edits go live on the public site immediately. No more SQL needed for everyday changes.

## 5. Our Staff (new public page)
- `/our-staff` — public page, linked in the navbar.
- Staff/admin can opt themselves in (with bio + photo) from that page directly.
- Main Admin can also "Feature" anyone from Admin → Staff tab.

## 6. Customer Feedback / Reviews (new)
- "Share Your Experience" form on **Home** and **Gallery** — open to guests and signed-in customers.
- Submissions are **pending** until approved in Admin → **Reviews** tab, then show publicly on both pages.
- I chose an approval step (rather than instant-publish) so the site can't be spammed with fake or abusive reviews — happy to switch it to instant-publish instead if you'd prefer that.

## 7. Bug fixed
- Gallery photo "lightbox" (the zoomed-in view) was crashing/blank — fixed.

---

# What YOU Need To Do (15 minutes, once)

1. **Supabase → SQL Editor → New Query** → paste the entire contents of `supabase/migration_02.sql` → Run.
   (Safe on a live project — only adds things, doesn't delete any of your existing data.)
2. **Supabase → Authentication → URL Configuration → Redirect URLs** → add:
   `https://YOUR-DOMAIN/reset-password`
3. **Supabase → Storage → New bucket** → name it exactly `gallery` → toggle **Public** on.
   (Needed for uploading gallery photos from the new Admin Catalog tab.)
4. Deploy/upload these files over your old ones, run `npm install`, then `npm run build`.

That's it — second admin, country codes, Our Staff, and reviews all work automatically once the migration runs.

---

# Honest Notes
- I did not have internet access in this session, so I could not run `npm install` / a live TypeScript build to double-check it compiles cleanly. I checked every file by hand (imports, matching braces, matching types) and I'm confident in it, but please run `npm run typecheck` (or just `npm run build`) yourself before deploying, and let me know if anything errors — I'll fix it immediately.
- Gallery prices are a **new field** — your existing gallery photos won't have a price until you add one in the new Catalog tab (they'll just show without a price tag, which is fine).
