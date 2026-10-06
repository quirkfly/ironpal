# Crowdfunding: what exists on the live sites (2026-10-07)

Everything below was done through a browser as Peter, on his instruction ("try all 10").
**Nothing is launched, nothing is published, nothing was submitted for review.** All accounts use
`p3t3r.d3rm3k@gmail.com`; passwords are in `credentials/peter.dermek.txt`, with policy-forced
variants listed in `credentials/crowdfunding_accounts.txt` (gitignored, mode 600).

| Platform | Account | Campaign | State | What's left, and who does it |
|---|---|---|---|---|
| **Indiegogo** | Existing account; password reset to the credentials one; creator profile created (display name **IronPal**) | **Draft** `indiegogo.com/projects/quirkfly/ironpal` (project ID 447875) | UNPUBLISHED DRAFT · 5/6 setup steps | Peter: **Business account details** (Adyen KYC, i.e. ORSR extract, passport/ID, bank letter for the 20deka IBAN). Shipping zones + rates. Ask support to change the creator URL handle `quirkfly`. Then the founder decision: *Submit for launch* (auto-launches on approval; last click for 10-20 is **2026-10-13**) |
| **Ulule** | Created (`p3t3r-d3rm3k`) | **Draft** project 238812, link `ulule.com/ironpal` | Private draft, not submitted | Peter: Banking information (SEPA IBAN held by 20deka) + company registration proof; Location; Impact section; shipping options. Submit for review **only if Ulule is the single platform** (exclusivity rule) |
| **Kickstarter** | Existing account (`quirkfly`), signed in by email code | **None created** | — | Blocked by eligibility: Kickstarter's last onboarding step asks for the country of legal residence / entity tax ID, and neither Slovakia nor 20deka qualifies. Picking the US now would be a false declaration. Create the draft once a US entity (Stripe Atlas) exists. Note: the account already holds an older, empty draft **"An Apps project" set to Individual / Austria**, left untouched; Peter should check what it was for, since an Austrian individual project requires Austrian residence |
| GoFundMe | Created | None (ToS bans rewards; creating = live) | — | — |
| Patreon | Created, email verified | None (bans crowdfunding) | — | The verify link also signed the phone's Chrome into Patreon |
| Wefunder | Created | None (US issuers only) | Stopped before the investor agreement | — |
| StartEngine | Created, phone (SMS) + email verified | None (US issuers only) | Newsletter opt-in removed; only the required disclosure accepted | — |
| Republic | **Republic Europe** account created, email verified | None (equity only, min €150k) | — | — |
| Crowdcube | Created on crowdcube.eu (country SK) | None (equity, curated) | Stopped at the investor KYC page (DOB, home address) | Optional: finish the profile only if an equity raise is ever pursued |
| Makuake | Sign-up email requested | None (refuses foreign corporations) | Waiting for the confirmation email | Peter: click the link in the Makuake mail when it arrives, if wanted |

## Draft contents (Indiegogo and Ulule)

- Name: *IronPal: the headband camera that logs your lifts* (Indiegogo) · *IronPal: the training log that sees your sets* (Ulule)
- Goal **€43,000** (≈ $50,000) · Indiegogo requested launch **2026-10-20 10:00** (Bratislava), end **2026-11-19 20:00** · Ulule 30 days (publishing is manual)
- Media: campaign film (YouTube) + 3 founder stills; thumbnail, cover and share image from `docs/crowdfunding/media/`
- Story from `ironpal-campaign-core.md`, written to the claim guardrails (weight reading in development; hybrid privacy; AI-video disclosure for the film)
- Rewards (EUR, net of VAT, placeholders until a BOM exists): Founding Supporter €13 · Super Early Bird €42 (≤200) · Early Bird €59 (≤500) · Complete Kit €85 · Gym Owner Pack €344 (≤50); delivery estimate September 2027

## Things noticed along the way

- **Gmail storage is at 14.71 of 15 GB.** Once it fills, platform mail (KYC, review results, backer messages) bounces.
- Gmail shows a **"Critical security alert"** on the account. It may be from this session's automated sign-in attempt; check it at myaccount.google.com.
- The Google session in desktop Chrome can't be reused by automation (device-bound cookies), so "Continue with Google" was not used anywhere.
