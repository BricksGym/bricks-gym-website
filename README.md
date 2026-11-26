# Bricks Gym website

The public website for Bricks Gym, 1810 Main Street, Watsonville, CA.

## How it works (plain English)

- **The website is the shop window.** It shows plans, prices, hours, FAQ and legal terms.
- **Joining:** visitors pick a plan, fill in their details, read the full membership agreement, initial each section and sign by typing their name. You get two emails at `inboxEmail`:
  1. **"New member sign-up"**: everything to enter into **Club Systems**, in the order of the paper form, with the **member number left blank**. It includes the driver's license number, so delete it once entered.
  2. **"Signed agreement (keep on file)"**: the signed agreement with initials, date and time. The member gets the same copy.

  Then call the member, take their card over the phone, type it straight into Club Systems, and tell them to come in.
- **No card or bank details ever touch this website.** Payments happen only in Club Systems. No Stripe or other payment processor.
- **Cancelling:** members cancel in person at the front desk, by mail, or by email. The FAQ and the footer have a "Cancel by email" button that opens a ready-to-send cancellation email to your inbox. (Because people sign up online, California law requires an online way to cancel; a pre-written email counts.) Reply to confirm, and process it in Club Systems.
- **Club Systems stays the system of record.** The website keeps no database of members.

## Change prices, fees, hours or contact details

Everything lives in **one file: `src/config/gym.ts`**. Open it in any text editor, change the numbers or text, and save. Search it for `PLACEHOLDER` to find everything still to fill in.

- Prices and fees: sections 4 and 5.
- Hours: section 3. Update both the readable list and the "Google format" list below it.
- Club Systems links (member portal, app, Join Now pages): section 7. When a Join Now link is filled in, that plan's Join button goes straight to Club Systems instead of the application form.
- Photos: put image files in `public/images/` and list them in section 8.
- Reviews: section 8. **Real reviews only.**
- Remodel tab: section 8b. Set `show: false` when the remodel is finished.
- **Sections and pages that appear by themselves once they have content** (empty ones stay hidden):
  - Photos and Reviews on the home page
  - About tab: write your story in `aboutStory`
  - Classes tab: add classes, the scheduling widget link, or personal training
  - Member Login link: add `memberPortalUrl`
- When every placeholder is filled in, set `PRELAUNCH = false` at the top. That removes the "sample pricing" notices and lets Google index the site.

The membership agreement text is in `src/content/agreement.ts`. It fills in prices from the settings file automatically.

## Keep the agreement identical in both places

The website's Membership Terms page and the agreement in Club Systems must match word for word.

1. Edit `src/content/agreement.ts` (after your lawyer's review).
2. Open `https://thebricksgym.com/legal/membership-terms.txt`, copy everything, and send it to Club Systems to load as the agreement template.

## Run it on this computer

```bash
npm run dev
```

Then open http://localhost:3000. Test applications are saved in the `.local-submissions` folder instead of being emailed. That folder is never uploaded. Delete its files when you're done.

Other commands: `npm test` (price math checks), `npm run build` (full production build).

## Put it online (Vercel)

1. Create a free account at vercel.com (and optionally github.com to back up the code).
2. Import this project into Vercel.
3. Add the settings from `.env.example` under Project → Settings → Environment Variables:
   - **Resend** (resend.com): an API key and a "from" address on your verified domain. Without these, forms won't send in production.
   - **Cloudflare Turnstile** (free): spam protection for the forms.
   - **Plausible** (optional, paid): privacy-friendly visitor stats, including "Join" clicks.
4. Buy the domain and connect it in Vercel → Project → Settings → Domains. If the main address ever changes, update `siteUrl` in `src/config/gym.ts`. (Now: https://www.thebricksgym.com, bought through Vercel.)

## Before launch: test checklist

1. Fill in every `PLACEHOLDER` and set `PRELAUNCH = false`.
2. Have your lawyer review the items in [docs/LEGAL-REVIEW-NEEDED.md](docs/LEGAL-REVIEW-NEEDED.md).
3. Send Club Systems the items in [docs/CHANGES-FOR-CLUB-SYSTEMS.md](docs/CHANGES-FOR-CLUB-SYSTEMS.md).
4. On the live site, submit one real application end to end: check the email arrives, enter it into Club Systems, sign and pay at the desk, and confirm it shows up correctly at the front desk and in billing.
5. Submit one test cancellation and check both emails arrive.
6. Send a contact-form message.

## Who to call

| Problem | Who |
|---|---|
| Prices, hours, text on the website | You: edit `src/config/gym.ts` |
| Website down, forms not sending | Your web developer / Vercel status page; check Resend for email problems |
| Member records, billing, check-in, member portal, agreement template | Club Systems: office@healthclubsystems.com, 800-227-6194 |
| Domain name | Wherever you bought it (e.g. Vercel or Cloudflare) |

## Security notes

- Application emails contain driver's license numbers. **Delete each one after entering it into Club Systems**, and keep the inbox protected with two-step login.
- Personal data is never written to logs or put in web addresses.
- The site sends strict security headers and only allows content from Google Maps, Cloudflare and (once added) Club Systems.
