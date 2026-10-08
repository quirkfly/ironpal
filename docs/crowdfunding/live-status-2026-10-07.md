# Crowdfunding: what exists on the live sites (2026-10-07)

Everything below was done through a browser as Peter, on his instruction ("try all 10").
**Nothing is launched, nothing is published, nothing was submitted for review.** Second pass ("complete the other 7", 2026-10-07): Patreon and Wefunder now hold drafts; the other five stop at a stated platform rule. All accounts use
`p3t3r.d3rm3k@gmail.com`; passwords are in `credentials/peter.dermek.txt`, with policy-forced
variants listed in `credentials/crowdfunding_accounts.txt` (gitignored, mode 600).

| Platform | Account | Campaign | State | What's left, and who does it |
|---|---|---|---|---|
| **Indiegogo** | Existing account; password reset to the credentials one; creator profile created (display name **IronPal**) | **Draft** (project ID 447875). Edit it at `indiegogo.com/admin/project/quirkfly/ironpal/dashboard`; all drafts at `indiegogo.com/admin/creator/quirkfly/projects`. The public URL `indiegogo.com/projects/quirkfly/ironpal` returns a 404 until the preview is published, and the draft is not listed under Your projects (that page shows only backed and followed projects) | UNPUBLISHED DRAFT · 5/6 setup steps | Peter: **Business account details** (Adyen KYC, i.e. ORSR extract, passport/ID, bank letter for the 20deka IBAN). Shipping zones + rates. Ask support to change the creator URL handle `quirkfly`. Then the founder decision: *Submit for launch* (auto-launches on approval; last click for 10-20 is **2026-10-13**) |
| **Ulule** | Created (`p3t3r-d3rm3k`) | **Draft** project 238812, link `ulule.com/ironpal` | Private draft, not submitted | Peter: Banking information (SEPA IBAN held by 20deka) + company registration proof; Location; Impact section; shipping options. Submit for review **only if Ulule is the single platform** (exclusivity rule) |
| **Kickstarter** | Existing account (`quirkfly`), signed in by email code | **None created** | — | Blocked by eligibility: Kickstarter's last onboarding step asks for the country of legal residence / entity tax ID, and neither Slovakia nor 20deka qualifies. Picking the US now would be a false declaration. Create the draft once a US entity (Stripe Atlas) exists. Note: the account already holds an older, empty draft **"An Apps project" set to Individual / Austria**, left untouched; Peter should check what it was for, since an Austrian individual project requires Austrian residence |
| GoFundMe | Created | **None possible** | Hard stop on the first creation step: "Where will the funds go?" lists 20 payout countries, Slovakia not among them; any pick is a false declaration. (ToS also bans rewards, and finishing the flow publishes.) | Only via an eligible-country organiser, and only as a donation fundraiser |
| Patreon | Created, email verified | **Unpublished creator page** `patreon.com/ironpal`: name IronPal, logo, cover, About, intro video (campaign film); tiers **Build Log €3/mo** and **Insider €8/mo** | *Your page is not yet published*; Publish not clicked | Framed as a build-in-public membership (dev logs, beta access), not a hardware pre-order, because Patreon's rules ban crowdfunding. Peter: payout + tax forms, then Publish if wanted. The verify link also signed the phone's Chrome into Patreon |
| Wefunder | Created | **Company profile** `wefunder.com/ironpal` (unpublished deal page: tagline, cover, film, HQ Bratislava, 4 highlights, team) + **Community Round draft #27131** | Round = Draft, terms not set; deal page not published; no contacts added (adding them emails them) | Blocked at review: the round's legal step states "Companies must be incorporated in the United States". Filled truthfully (20deka, s.r.o., country Other). Terms (SAFE, valuation cap) are Peter's call; Form C needs a US issuer |
| StartEngine | Created, phone (SMS) + email verified | **None** | The founder fit check (`/raise-capital-ai`) rejects Gmail: "Please use only work email addresses". ironpal.co has no MX record, so there is no work mailbox | Create `peter@ironpal.co` (e.g. the `cf-email-routing` skill, forwarding to Gmail), then answer the 3 questions. Reg CF still requires a US issuer |
| Republic | **Republic Europe** account created, email verified | **None submitted** | Application form `europe.republic.com/raise/apply/` filled truthfully, but it rejects the goal: "The minimum raise amount is 150,000" (vs €43k). Not submitted; entering €150k would misstate the raise | Only with a ≥ €150k equity round |
| Crowdcube | Created on crowdcube.eu (country SK), registration unfinished (personal-details step) | **None** | `crowdcube.eu/get-started` requires sign-in; password sign-in fails until registration completes; a sign-in link was emailed but the Samsung phone (Gmail) disconnected before it could be read | Peter: open the Crowdcube sign-in mail, finish personal details (DOB, address), then *Apply to raise* |
| Makuake | Registered 2026-10-08 (see below) | **None** | Account not confirmed. Even then, Makuake's guideline refuses foreign corporations without a Japan branch | Peter: click the Makuake link if it arrives; a campaign needs a Japanese partner (Makuake Global) |

## Draft contents (Indiegogo and Ulule)

- Name: *IronPal: the headband camera that logs your lifts* (Indiegogo) · *IronPal: the training log that sees your sets* (Ulule)
- Goal **€43,000** (≈ $50,000) · Indiegogo requested launch **2026-10-20 10:00** (Bratislava), end **2026-11-19 20:00** · Ulule 30 days (publishing is manual)
- Media: campaign film (YouTube) + 3 founder stills; thumbnail, cover and share image from `docs/crowdfunding/media/`
- Story from `ironpal-campaign-core.md`, written to the claim guardrails (weight reading in development; hybrid privacy; AI-video disclosure for the film)
- Rewards (EUR, net of VAT, placeholders until a BOM exists): Founding Supporter €13 · Super Early Bird €42 (≤200) · Early Bird €59 (≤500) · Complete Kit €85 · Gym Owner Pack €344 (≤50); delivery estimate September 2027

- Reward items (added 2026-10-07): Founding Supporter = Founders page listing + early app access ×1 · Super Early Bird = IronPal headband ×1 + Premium app – 6 months ×1 · Early Bird = headband ×1 + Premium app – 12 months ×1 · Complete Kit = headband ×1 + Spare band ×1 + Premium app – lifetime ×1 · Gym Owner Pack = headband ×5 + Spare band ×5 + Premium app – lifetime ×5 + Gym partnership onboarding ×1. A reward's *Is published* switch is read-only; the platform sets it.
- Currency: **USD isn't offered.** In Settings → General → Change currency, the only choices are EUR (the existing SK IBAN) and EUR (new account). The dialog says to email help@indiegogo.com for any other currency. Changing currency doesn't convert prices that are already set.

- Website: set to `https://ironpal.co` under Creator → Settings → Communication channels (`/admin/creator-settings/quirkfly/communication`). The project's own General settings have no website field. The story ends its "Who is behind it" section with "Follow the build, and get launch-day updates, at ironpal.co.", where ironpal.co links to https://ironpal.co. The creator avatar is `docs/crowdfunding/media/thumb_700.jpg`.

- Submission (2026-10-07): **not possible yet.** Business verification (individual data and bank account SK…448, EUR) is IN REVIEW, which can take up to 5 working days. *Publish project preview* stays disabled until it clears, and submitting comes after that. Run `/indiegogo-status` to check; it is read-only and never clicks Publish or Submit.

## Things noticed along the way

- **Gmail storage is at 14.71 of 15 GB.** Once it fills, platform mail (KYC, review results, backer messages) bounces.
- Gmail shows a **"Critical security alert"** on the account. It may be from this session's automated sign-in attempt; check it at myaccount.google.com.
- The Google session in desktop Chrome can't be reused by automation (device-bound cookies), so "Continue with Google" was not used anywhere.

## Registration pass, 2026-10-08

| Platform | Registration |
|---|---|
| Makuake | **Complete.** The first confirmation link (in Spam, sent 01:09) had expired; a new one was requested and used. Account username `IronPal` |
| Patreon, StartEngine, GoFundMe | Complete (no further steps pending) |
| Wefunder | Investor terms accepted (step 1). Identity step saved with legal name + the company seat as address (Ovručská 7, 831 02 Bratislava, SK); **blocked on Birthday** (Next disabled without it) |
| Republic Europe | Logged in; personal-details step needs **Date of birth** + nationality on page 1 (then a tax ID) |
| Crowdcube | Account resumes at `/register/your-name`: needs **Date of birth** + address. Nothing saved |

Only Peter's date of birth (and, for Republic, a Slovak tax ID) is missing to finish all three. The company seat is used as the address, per Peter (2026-10-08).

### Update (2026-10-08, after Peter supplied DOB 23.07.1974 and asked to use 20deka's DIČ)

| Platform | Registration |
|---|---|
| Wefunder | **Complete.** Identity: name, DOB, company seat as address, Tax ID = 20deka DIČ 2024120692. Phone verification skipped (no SMS arrived on +421 948 615 037); net worth, income, bank, interests skipped (optional) |
| Republic Europe | About you (name, DOB, nationality Slovakia), address (company seat) and tax residency (Slovakia, DIČ 2024120692) saved. **Stopped at Finance**: employment = company owner/director, but it requires annual income *or* net assets; not guessed |
| Crowdcube | **Dropped by Peter (not suitable).** Personal details were filled but the account was not created |
| Patreon | **Dropped by Peter (not suitable).** The unpublished page `patreon.com/ironpal` and its two tiers still exist; delete them if unwanted |

Note: the DIČ entered on Wefunder and Republic is the company's tax number, used on Peter's instruction in fields that ask for the individual's TIN.

## BackerKit Crowdfunding (2026-10-08)

Added after research confirmed Slovakia among BackerKit's 34 creator countries (Stripe account + national ID).

| | |
|---|---|
| Account | Created and email-confirmed (`p3t3r.d3rm3k@gmail.com`; password variant in `credentials/crowdfunding_accounts.txt`) |
| Project | **Draft** — admin at `backerkit.com/c/admin/projects/ironpal-the-headband-camera-that-logs-your-lifts/start_dashboard` |
| Basics | Title, creator IronPal, Design & Tech, goal **$50,000** (internal target $50,000, est. avg pledge $75 → ~667 backers), est. launch **2026-10-20 01:00 PDT** (= 10:00 Bratislava), end **2026-11-19 11:00 PST**, est. shipping Sep 2027, support email, hero image, campaign film |
| Story | 8 sections from `ironpal-campaign-core.md` (guardrail wording, AI-video disclosure) |
| Rewards | Founding Supporter $15 · Super Early Bird $49 (≤200, featured) · Early Bird $69 (≤500) · Complete Kit $99 · Gym Owner Pack $399 (≤50), each with items attached (8 items). Gym Owner Pack item quantities still 1 — set headband ×5 |
| Not done (deliberately) | **Pre-launch page not published** (it would list publicly on Coming Soon). **Review not requested.** Ironpal.co early-bird list not imported (subscriber data to a third party) |
| Peter to do | Connect Stripe and verify identity (20deka, s.r.o. + ID), then publish the pre-launch page and gather followers; review takes 2–4 business days |

Note: Indiegogo is planned for the same 2026-10-20 date. Running both at once splits one $50k goal; pick one or stagger them.
