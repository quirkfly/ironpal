# IronPal crowdfunding: plan across the top 10 platforms

**Goal:** $50,000 · **Planned launch:** 2026-10-20 (14 days from 2026-10-06) · **Rule:** create and
prepare for review, **never launch** · **Entity:** 20deka, s.r.o. (IČO 47 843 411, Bratislava) ·
**Shared copy, rewards and use of funds:** [`crowdfunding/ironpal-campaign-core.md`](crowdfunding/ironpal-campaign-core.md)

Each platform section below was researched by one swarm agent against the platform's current help
pages (October 2026), then fact-checked by a second, adversarial agent. Its corrections are already
applied. Each section cites its sources.

## Verdict at a glance

| # | Platform | Model | Slovak s.r.o. eligible? | Draft held unlaunched? | Fit | Action in this plan |
|---|---|---|---|---|---|---|
| 1 | **Indiegogo** | Reward / pre-order, all-or-nothing | **Yes** (IČO, SK IBAN) | Yes, up to *Submit for launch* (that click auto-launches on the date) | **Recommended (primary)** | Account + full draft; stop before Submit |
| 2 | **Ulule** | Reward / presale, all-or-nothing | **Yes** (SEPA account) | Yes, *Submit* = review only; publishing is manual | Possible, **exclusive** | Account + draft; submit only if Ulule is the single platform |
| 3 | **Kickstarter** | Reward / pre-order, all-or-nothing | **No** (SK not a creator country) | Yes, but *Send to review* needs a verified eligible entity | Possible after a US entity (Stripe Atlas) | Account only; draft waits for the US entity (onboarding asks for country of residence / tax ID) — earliest launch ≈ Jan 2027 |
| 4 | GoFundMe | Donation | No payouts to SK | No, creating = live | Not suitable (ToS bans rewards) | Account only; **no fundraiser** |
| 5 | Patreon | Membership | Probably | No, review is part of Launch | Not suitable (bans crowdfunding) | Account only; no page |
| 6 | Wefunder | Equity (Reg CF) | No (US companies only) | No, submit = SEC Form C | Not suitable | Account only |
| 7 | StartEngine | Equity (Reg CF / A+) | No (US issuers only) | No, curated onboarding | Not suitable | Account only |
| 8 | Republic / Republic Europe | Equity | US: no · EU: yes, min €150k | No, curated | Not suitable | Account only |
| 9 | Crowdcube | Equity (ECSP) | Possibly, case by case | No, curated + due diligence | Not suitable | Account only |
| 10 | Makuake | Reward (Japan) | No (foreign corp. without JP branch) | No, curated via JP partner | Not suitable now | Account only |

**Decisions behind this plan** are in the auto-grill ledger [`crowdfunding_campaign_plan_grilled.md`](crowdfunding_campaign_plan_grilled.md). Four of them stay OPEN for Peter: clicking Indiegogo *Submit for launch*, publishing any public preview, forming a US entity for Kickstarter, and final reward prices.

**What that means for $50,000.** Only three of the ten run pre-order campaigns that IronPal can use,
and only Indiegogo can actually launch on 2026-10-20 from a Slovak company. Splitting one $50k
all-or-nothing goal across platforms makes each one less likely to fund. Ulule even forbids running
alongside any other platform. The plan therefore treats **Indiegogo as the 2026-10-20 campaign**,
keeps **Ulule** as an approved-but-unpublished alternative, and keeps **Kickstarter** as a draft
for a later, sequential campaign once a US entity exists.

## Shared prerequisites (before any Submit)

- [ ] ORSR extract for 20deka, s.r.o. issued within the last 12 months (Indiegogo, Ulule)
- [ ] Passport or ID card of the konateľ (Peter Dermek): photo of the physical document, MRZ visible
- [ ] Bank statement or letter for the 20deka SK IBAN, issued within 12 months, legal name on it
- [ ] Final reward prices (net of VAT for Indiegogo) and an estimated delivery month
- [ ] VAT position from the accountant (SK 23 %, OSS for EU consumers)
- [ ] AI-use disclosure text (Kickstarter requires it; reuse it elsewhere): film cutaways + on-device ML
- [ ] Media from the core file: film, cover 16:9, 700×700 thumbnail, 1200×630 share image

## Timeline

| Date | Step |
|---|---|
| 2026-10-07 | Accounts on all 10; drafts on Indiegogo and Ulule; live state in [`crowdfunding/live-status-2026-10-07.md`](crowdfunding/live-status-2026-10-07.md) |
| 2026-10-08 → 10-12 | Peter uploads the KYC documents (Indiegogo Adyen, Ulule identity) |
| **2026-10-13** | **Last day to click Indiegogo *Submit for launch*** for a 10-20 start (7-day lead) — founder's decision |
| 2026-10-20 | Planned launch (Indiegogo), only if Peter submitted |
| After 2026-11-19 | Kickstarter (sequential), once the US entity, EIN and bank are in place |

---

## Indiegogo — RECOMMENDED (reward / pre-order, all-or-nothing)

**Verdict:** Good fit for IronPal. Slovakia is a supported creator country, and 20deka, s.r.o. can onboard as a Business account. IronPal's working PoC and prototype band are an asset; the current help center states no prototype requirement either way. The rules changed after the Gamefound acquisition and the platform upgrade on 16 Oct 2025:
- Fixed funding only. Flexible is gone; an "Express Crowdfunding" mode with instant payment also exists, but use regular crowdfunding.
- Payments run through Adyen.
- Pre-launch pages are now "Drafts/Previews".
- InDemand is now "Late Pledge", with a built-in Pledge Manager.
- Reward prices must be entered **net of tax**.

**Critical caveat for the "don't launch" instruction:** on Indiegogo, review and launch are the same button. **"Submit for launch"** starts the compliance review. If the review passes, *the campaign starts automatically* on the requested launch date ([launch article](https://help.indiegogo.com/article/486-launching-crowdfunding-campaign)). After approval, the launch date **can only be moved to a later date** ([general settings](https://help.indiegogo.com/article/485-general-project-settings)), so postponing is possible. Withdrawing an approved campaign before launch is not documented. The plan below therefore stops at a fully built, KYC-verified preview, ready to submit. The Submit step is a separate decision for Peter.

### Key facts
| Item | Detail |
|---|---|
| Eligibility | Slovakia listed: IČO 8 digits, SK IBAN, SK VAT ([data formats](https://help.indiegogo.com/article/506-data-formats-per-country-region)) |
| Currency | EUR (Slovak standard). Another currency only if Indiegogo agrees, with payout restrictions ([currencies](https://help.indiegogo.com/article/671-standard-payout-currencies)) |
| Funding | Fixed (all-or-nothing). Express Crowdfunding exists as a separate mode |
| Review | Two steps: Adyen KYC (no documented turnaround) + platform review ("usually up to 3 business days") |
| Lead time | Launch date at least **7 days** after clicking Submit. Resubmitting after a rejection restarts the 7 days |
| Duration | 24 h – 60 days. The end date can't be changed once live |
| Fees | 5% platform + 3% + €0.20 per transaction. Nothing if the goal is missed. Backer tips go to the creator |
| VAT | Prices entered net. Automatic EU VAT paused since 4 Aug 2026; creator sets rates manually (SK 23%; consider OSS) |
| Payouts | Funds reach Adyen in 3–5 business days, paid out to the bank every Friday |

### Timeline to hit 2026-10-20
- **Oct 7–8:** account + project draft; start KYC immediately (no published turnaround).
- **Oct 9–12:** KYC clears; publish preview.
- **Oct 13 (hard cutoff):** Submit for launch, 7 days before Oct 20. A rejection after this date pushes the launch out unless support moves it manually. Submit earlier if possible, to leave room for one rejection cycle.

### Steps

**1. Account registration**
- [ ] Create an Indiegogo creator account at indiegogo.com as p3t3r.d3rm3k@gmail.com (Continue with Google where offered; otherwise email + the password in `credentials/peter.dermek.txt`).
- [ ] Turn on 2FA if offered. Add a profile photo and bio for Peter Dermek, founder of IronPal, Bratislava.

**2. Create the project**
- [ ] Avatar > **Go to admin area** > Creator > **My Projects** > **+ Add a project** > **Indiegogo campaign**.
- [ ] Accept the Terms of Service for Creators, then **Create project**.

**3. Business onboarding / KYC** (Project settings > **Business account details**, Adyen)
- [ ] Account type: **Business**. Legal name exactly **20deka, s.r.o.**; IČO **47843411**; IČ DPH if VAT-registered (format SK + 10 digits); registered address (postal code e.g. 81102).
- [ ] Registration document: an **ORSR (Obchodný register) extract issued within the last 12 months** (by issue date). A tax-office document is also acceptable.
- [ ] For each shareholder and statutory director: passport, ID card or driver's license. It must be unexpired, show the MRZ, and be a photo or scan of the physical document.
- [ ] Bank document **issued within the last 12 months**: the company's legal name (no trading name), the full SK IBAN (24 characters), and proof the bank issued it (logo or stamp). One file, JPG/PNG/PDF, 15 MB or less.
- [ ] Click **Submit for review** in Business account details. This is KYC only, not the campaign launch.
- [ ] Check [common issues](https://help.indiegogo.com/article/507-common-issues-and-errors) if Adyen rejects a document.

**4. General setup (draft fields)**
- [ ] **Project name:** IronPal — the training log that watches your lifts. Still editable after the preview; after launch, changes go through the account manager.
- [ ] **Project URL:** indiegogo.com/projects/ironpal. **Permanent once the preview is published.**
- [ ] **Category:** the single category the dashboard offers that fits best (fitness/wearable tech). **Locked after publishing.**
- [ ] **Tags:** fitness, wearable, strength training, camera, AI, gym.
- [ ] **Short description:** "A headband camera + motion sensors that recognises your exercise and counts your reps on-device. Automatic weight reading is what we're building next."
- [ ] If the dashboard asks for a product stage or development status: **Prototype / working proof of concept**. State it accurately; do not overstate it.
- [ ] **Location / legal entity:** Bratislava, Slovakia; Business.
- [ ] **Goal:** **€43,000**, about $50,000. Re-check the EUR/USD rate on the day. Another currency only by agreement with Indiegogo, with payout restrictions.
- [ ] **Requested launch date:** 2026-10-20. After approval it can only be moved later. Launch time follows the device's time zone, so set it from a Europe/Bratislava device. **Scheduled end:** 2026-11-19 (30 days; 60 is the maximum; the end date can't be changed once live).
- [ ] **Images:** thumbnail 700×700, cover at least 1743×498, social share image 1200×630.
- [ ] Contact email.
- [ ] **Endgame** (extends the campaign when people pledge in the final 10 minutes): decide on or off.
- [ ] Project type: **regular Crowdfunding**, not Express.

**5. Rewards / tiers** (EUR, all pre-orders; set stock limits)
- [ ] Tier prices and limits come from the core file's reward table (Founding Supporter $15 → Gym Owner Pack $399), converted to EUR net of VAT. **Prices stay OPEN until a BOM exists**; the draft carries them as editable placeholders.
- [ ] Super Early Bird: IronPal band + app, 40% off target retail, limited to 100. Earmark these for ironpal.co early-bird email signups.
- [ ] Early Bird: band + app, 30% off, limited to 300.
- [ ] Indiegogo Special: band + app, 20% off.
- [ ] Duo pack: 2 bands.
- [ ] Founding Lifter: band + name in app credits + beta-test access.
- [ ] Add-ons: spare headband strap, extra battery/charger.
- [ ] Each reward gets estimated delivery (realistic, with buffer), shipping zones (EU, UK, US, rest of world) and fees.
- [ ] Taxes: enter all reward prices **net (excluding VAT)**, as Indiegogo requires. Set **VAT rates manually**, because EU VAT is no longer automatic. Decide with the accountant on OSS registration. Indiegogo still handles UK VAT on orders under £135.
- [ ] **Stable Pledge:** decide carefully. It cannot be undone once joined and must be enabled before launch.

**6. Story / detailed description outline**
- [ ] Hero: embed the campaign film https://www.youtube.com/watch?v=5Hs_VxRIlGM
- [ ] The problem: logging lifts by hand breaks focus.
- [ ] How it works: headband camera + IMU; exercise recognition and rep counting **on-device**.
- [ ] **What we're building next (in development, not validated):** reading the weight from the bar or stack. Never present it as working.
- [ ] **Privacy, stated accurately:** reps and exercise are processed on the device. Weight reading sends **one frame to a cloud model, deleted after inference**. Do NOT write "no cloud" or "faces blurred".
- [ ] Prototype proof: real PoC footage of the Android app plus the prototype band.
- [ ] Founder story: Peter on camera, solo founder, Bratislava.
- [ ] Specs (marked as target specs), roadmap, manufacturing plan, delivery timeline.
- [ ] Risks & challenges (a default section of the crowdfunding page): manufacturing, certification (CE/RED), the weight-reading R&D risk, and how delays will be handled.
- [ ] Refunds & cancellation section (also a default section). Project FAQ.
- [ ] Follower gift (e.g. a discount code for people who follow the preview). It locks once the preview is published.
- [ ] Stretch goals, optional.

**7. Test and preview**
- [ ] Use tester mode to run through checkout, notifications and the order flow.
- [ ] Add collaborators if needed.
- [ ] Once every dashboard step has a purple checkmark (KYC included): **Publish project preview**. This makes the page public in the "Upcoming" phase; it does not launch. Then point ironpal.co to the preview so visitors can follow it.

**8. Submit for review: STOP, founder decision**
- [ ] Prepared but **NOT clicked** by this plan: **Submit for launch**, which needs a launch date at least 7 days away. **Last possible click for 10-20 is 2026-10-13**, and a rejection after that date pushes the launch out.
- [ ] Clicking it **schedules an automatic launch on 10-20 if approved**. After approval the date can be pushed later but not earlier, and withdrawing is not documented. Peter must make this call himself. If he wants approval without a fixed date, first ask Indiegogo support whether an approved campaign can be held indefinitely.

### Do NOT
- Do not click **Submit for launch**, and do not ask support to move the launch earlier, without Peter's explicit go-ahead.
- Do not publish the preview before the URL and category are final; both lock on publish.
- Do not enter VAT-inclusive reward prices; Indiegogo requires net prices.
- Do not join Stable Pledge on impulse; you cannot leave it.
- Do not claim weight reading works, "no cloud", or "faces blurred". Do not overstate the product stage.
- Do not count on Flexible funding. It is not available, so the goal must be one you are confident of reaching all-or-nothing.


---

## Ulule (France): possible, with one blocking rule

**Verdict:** possible with caveats. Ulule fits mechanically: reward-based, all-or-nothing, a "presale" goal type, SEPA creators accepted, and drafts can be fully approved without launching. **Blocking rule:** its guidelines say *"Ulule will refuse projects that are currently fundraising on other crowdfunding services"* and will remove violators "even if it's online" ([guidelines](https://www.ulule.com/about/guidelines/)). Ulule therefore cannot go live on 2026-10-20 alongside Kickstarter, Indiegogo or any other platform. Prepare it as an approved draft, but publish it **only if it is the single chosen platform**, or later as a sequential relaunch after another campaign has ended.

| Item | Ulule |
|---|---|
| Type | Reward, all-or-nothing; goal type "presale" (units) or "financial" (at least 4 rewards, from EUR 1) |
| Slovak s.r.o. eligible | Yes: SEPA bank account held by 20deka, s.r.o.; status = corporation |
| Currency | **EUR** (the payout currency follows the payout bank account; Ulule's country article requires a SEPA-zone account) |
| Max length | 90 days (30-45 typical) |
| Creator fee | 6.67% + VAT on card funds up to EUR 100k, only if funded |
| Backer fee | EUR 0.10 + 2.2% on top of each pledge (refunded on failure) |
| Review | First pass: half a day, up to 3 business days; full page approval: about 1 week on average |
| Launch control | Manual "publish" (green ribbon) after final validation; owner picks the moment |
| Payout | Day after end date + about 72 working hours (EUR); Terms: at most 12 business days |

### Goal
- Platform currency is EUR. Set the goal to the **EUR equivalent of $50,000**: check the ECB rate on the day of submission and round up, roughly EUR 43-46k.
- Alternative: use the **presale** goal type with a unit target (e.g. N bands at the early-bird price whose total is about EUR 43-46k). This matches Ulule's guidance: "one contribution = one presale".

### 1. Account registration
- [ ] Create a Ulule account (free) under the founder's email; turn on 2FA if available.
- [ ] Complete the profile fully, as validation requires it: first and last name (Peter Dermek), username, avatar (founder photo), city (Bratislava), short bio, link to https://ironpal.co.
- [ ] Set the display currency to EUR.

### 2. Verification / KYC (Identity information section)
- [ ] Status: **Corporation**: 20deka, s.r.o., ICO 47 843 411, registered office in Bratislava.
- [ ] Upload company proof of registration, which is the only document Ulule lists for companies: an up-to-date extract from the Slovak Business Register (Obchodny register SR, ORSR). Keep a certified/English copy ready in case the success manager asks.
- [ ] Optional, not a listed requirement for companies: have an ID (passport/ID card) of the konatel (Peter Dermek) ready in case Ulule or its payment partner asks for it.
- [ ] Enter the payout bank account: a **SEPA EUR business account held by 20deka, s.r.o.** (account holder must match the project owner). Ulule wants bank details and identification documents **before validating** the project.
- [ ] Ask the accountant, and Ulule if needed, about VAT. Ulule's help page covers VAT on its commission only for individual creators, so whether reverse charge applies to a VAT-registered s.r.o. is unconfirmed. Also ask about Slovak VAT on pre-order rewards, which Ulule leaves to the creator.
- No securities or legal filings: reward-based only, no financial returns.

### 3. Draft creation, field by field

**Main information**
- [ ] Project type: reward-based. Goal type: presale (units) or financial; pick one and record why.
- [ ] Title (short and catchy): **IronPal: the training log that sees your sets**.
- [ ] Subtitle: "A headband camera + motion sensors that recognises your exercise and counts your reps from your point of view. Weight reading is the next thing we're building."
- [ ] Category: Technology / Innovation (closest available; check the list in the editor).
- [ ] Language: English as the main language; consider adding a French version of the page (much of the audience is French) and the founder's Slovak network.
- [ ] Goal: EUR equivalent of $50,000 (see above).
- [ ] Duration: **30 days** (planned publish 2026-10-20 → ends about 2026-11-19). Max allowed is 90; Ulule advises short campaigns.
- [ ] Payment options: card (default); leave offline/cheque off.

**My project (story outline)**
- [ ] Hook: the campaign film https://www.youtube.com/watch?v=5Hs_VxRIlGM embedded at the top; founder on camera.
- [ ] Problem: logging sets by hand breaks your focus; wrist trackers miss what you are lifting.
- [ ] What works today (honest): a working proof of concept, an Android app plus a prototype band; **recognises the exercise and counts reps on-device**.
- [ ] What we are building (framed as being built, never as shipped): **reading the weight off the bar or stack**, the core bet, not yet validated. Present it as the stretch of the roadmap the funds pay for.
- [ ] Privacy, stated exactly: reps and exercise are processed on-device; weight reading sends **one frame** to a cloud model and the frame is deleted after inference. Never write "no cloud" or "faces blurred".
- [ ] Use of funds: tooling/enclosure, sensor/camera BOM, certification (CE/RED for an EU radio device), app development for weight reading, fulfilment. Ulule asks for a precise explanation of how the funds will be used.
- [ ] Team: Peter Dermek, solo founder, Bratislava; 20deka, s.r.o.
- [ ] Timeline and risks: prototype → DVT → production → delivery window; certification and supply risks; what happens if weight reading slips.
- [ ] Delivery: shipping zones (EU first; worldwide with separate shipping fees), estimated delivery month.
- [ ] FAQ: compatibility (Android first; iOS status stated honestly), sizing, sweat/cleaning, data handling.

**Media**
- [ ] Cover image (product on the founder, gym setting); campaign film embed; GIFs of the rep counter / app HUD; prototype photos. No AI-generated imagery of features that do not exist yet (e.g. a working weight readout).

**Rewards** (at least 4 if the financial goal type is chosen; each with amount, content, quantity limit, delivery fees, estimated delivery date)
- [ ] EUR 5: Supporter: name in the app credits + campaign updates.
- [ ] EUR 25: Founder's beta access to the Android app + supporter wall (no hardware).
- [ ] Early bird: IronPal band + app, limited quantity (e.g. first 100), lowest hardware price.
- [ ] Standard: IronPal band + app.
- [ ] Duo: 2 bands (training partner).
- [ ] Optional: Founding Lifter: band + call with the founder / input on the exercise roadmap.
- [ ] Add shipping fees per zone on every physical reward. Set delivery dates that match the production plan in docs/kickstarter-launch-execution-plan.md.

**Launch date**
- [ ] Target publish date: **2026-10-20**. On Ulule this is a manual "publish" click after final validation, not an automatic go-live, so note it in the plan and the message thread with the success manager.

### 4. Submit for review
- [ ] Check that all 4 sections + profile are complete; the "Submit" recap must show everything green.
- [ ] **Submit by Thu 2026-10-08 or Fri 2026-10-09 (before Friday evening)**: first review in about half a day to 3 business days, no weekends; full page approval averages about 1 week.
- [ ] Work through the success manager's feedback in the message thread quickly; speed of fixes sets approval time.
- [ ] When the page is final, tell the success manager in the thread that it is ready for **final validation**, and say it should be approved but not published until the founder decides.
- [ ] Record the approval status and the preview link in the master plan.

### 5. What must NOT be done
- [ ] **Do not click the green "publish" ribbon**. Launch is the founder's call only.
- [ ] **Do not publish on Ulule while IronPal is live (or about to be) on Kickstarter, Indiegogo or any other crowdfunding service**. Ulule refuses and removes such projects. If another platform goes live on 2026-10-20, Ulule stays an unpublished approved draft (or is used later, as a sequential relaunch after that campaign has ended).
- [ ] Do not copy and paste an identical page across platforms (the guidelines warn against this specifically).
- [ ] Do not claim weight reading works, "no cloud", or "faces blurred".
- [ ] Do not offer equity, interest, royalties or any financial return.
- [ ] Do not cold-message Ulule members to ask for pledges (counts as spam under the guidelines).


---

## Kickstarter

**Fit:** possible with caveats. Kickstarter is the best place for a hardware pre-order campaign, but **20deka, s.r.o. is not eligible** (Slovakia is not a creator country), so a **2026-10-20 launch here is not achievable**.

### Verdict in one paragraph
Kickstarter is a reward / pre-order platform with all-or-nothing funding. It requires a working prototype and bans photorealistic renderings, and IronPal's working Android app and prototype band meet that bar. Project creation is limited to 25 countries (AU, AT, BE, CA, DK, FR, DE, GR, HK, IE, IT, JP, LU, MX, NL, NZ, NO, PL, SG, SI, ES, SE, CH, UK, US). Slovakia is not one of them ([Who can use Kickstarter](https://help.kickstarter.com/en-us/articles/16236650-who-can-use-kickstarter), updated 2026-08-06). An entity must launch from the country where it is registered and use a bank account there. Kickstarter's own workaround is a **US entity formed through Stripe Atlas**: Peter can verify as the representative with his Slovak or EU ID and no SSN ([help article](https://help.kickstarter.com/en-us/articles/16236380-i-m-looking-to-create-a-business-in-the-us-so-that-i-can-launch-a-project-how-do-i-do-this)). The EIN for a founder without an SSN takes **15-45 business days**, so the earliest realistic approval is late November to late December 2026. **Recommended launch: January 2027.**

> Gap in the existing plan: `docs/kickstarter-launch-execution-plan.md` never covers creator eligibility, the entity or the bank account. This is now the critical path for Kickstarter.

### Blockers to "Send to review"
Every editor tab, **including Payment (Stripe verification)**, must be complete before submission.
- [ ] Creator entity in an eligible country (recommended: Stripe Atlas Delaware C-corp or LLC, about $500)
- [ ] Tax ID (EIN) for that entity, 15-45 business days without an SSN
- [ ] Bank account in the entity's name, in the project country, accepting USD deposits
- [ ] Major credit or debit card in the entity's or owner's name
- [ ] Beneficial-owner disclosure: Peter's passport, date of birth, address
- [ ] AI-use disclosure ([AI policy](https://updates.kickstarter.com/introducing-our-new-ai-policy/)). **Two parts, both mandatory:** (a) the film uses AI cutaways and polish, so say which parts are original and which are AI-generated; (b) IronPal is *developing AI technology* (on-device exercise/rep recognition, plus a cloud model for the weight-reading under development), so disclose the training and inference data sources and how consent and credit are handled
- No securities or legal filings needed (reward campaign, not equity)

Alternative routes, worse for this timeline:
- A Polish sp. z o.o. or Austrian GmbH, running in EUR and paying out to a Slovak IBAN. Euro projects launched from eligible European countries may use an IBAN from SK ([bank account article](https://help.kickstarter.com/en-us/articles/16236646-what-type-of-bank-account-can-i-use)). Forming the company and meeting KYC for a non-resident director is not faster, and Kickstarter says nothing clear about non-resident representatives outside the US. **Confirm with Kickstarter support before forming one.**
- Do NOT list a friend or nominee in an eligible country as the "creator". That breaks the beneficial-owner disclosure rules.

### Timeline (from 2026-10-07)
| Step | Earliest | Notes |
|---|---|---|
| Stripe Atlas application and incorporation | Oct 8-12 | 1-2 business days |
| EIN issued | ~Nov 2 to mid-Dec | 15-45 business days without an SSN (US federal holidays Nov 11 and Nov 26 fall in this window) |
| US bank account, card, Stripe verification | +3-5 business days | Verification "can take a few business days"; contact support after 5 |
| Send to review, then approval | Up to 3 business days, +3 or more business days per revision round | All Design & Technology projects are manually reviewed (no auto-approval) ([Prepare to launch](https://help.kickstarter.com/hc/en-us/articles/115005134694-How-does-Prepare-to-launch-work-)) |
| Pre-launch page live (first-time creators: only after approval) | ≥1 week before launch | [pre-launch page](https://help.kickstarter.com/en-us/articles/16236379-setting-up-your-project-s-pre-launch-page) |
| **Launch (manual click, cannot be scheduled)** | **Target Jan 2027** | 2026-10-20 not possible |

### Fees
- 5% Kickstarter fee on success, plus Stripe processing of about 3-5% ([fees](https://help.kickstarter.com/en-us/articles/16236674-what-are-the-fees), updated 2026-09-02). Third-party sources put the US rate at about 3% + $0.20 per pledge (not verified against Kickstarter's per-country table)
- About $4,000-5,000 on $50,000 raised. The pledge manager adds 5% (on non-tax funds) + 3-5% on post-campaign add-ons.
- US entity running costs: about $300/yr Delaware franchise tax, about $100/yr registered agent, US federal returns (Form 1120 + 5472). Get a Slovak tax adviser's view on place-of-management and permanent establishment.

### Step-by-step (prepare, do not launch)

**1. Account and entity**
- [ ] Create a Kickstarter account (personal profile: Peter Dermek, Bratislava, real photo, bio as solo founder of IronPal)
- [ ] Form a US entity through Stripe Atlas (e.g. "IronPal Inc." or LLC; decide C-corp vs LLC with an adviser); file for the EIN through Atlas
- [ ] Open a US business bank account (Atlas partner bank) and get a business debit card
- [ ] Record the 20deka, s.r.o. relationship (IP licence or assignment to the US entity; the s.r.o. as contract manufacturer or supplier) so the campaign entity owns what it sells

**2. Draft: Basics tab**
- [ ] **Project title:** "IronPal: The headband camera that logs your lifts"
- [ ] **Subtitle (135 chars):** "A first-person camera + motion sensors that recognise your exercise and count reps on-device. Weight-reading is next, built in the open."
- [ ] **Category:** Technology > Wearables (secondary: Technology > Gadgets)
- [ ] **Project location:** Bratislava, Slovakia (the funds entity and project country are set on the Payment tab; confirm with support that a Slovak display location is accepted for a US-entity project)
- [ ] **Project image:** real photo of the prototype band on the founder. No photorealistic renders (hardware rule).
- [ ] **Funding goal:** **$50,000 USD**
- [ ] **Target launch date:** note 2027-01 internally. The launch field is informational only; launching is manual.
- [ ] **Campaign duration:** 30 days (maximum 60)

**3. Rewards tab** (prices set only after the BOM and fulfilment quote; placeholders below)
- [ ] $1, "Spotter": updates, name in the app credits
- [ ] Super Early Bird (limited qty): IronPal band + app, priced below retail
- [ ] Early Bird (limited qty)
- [ ] Kickstarter Special
- [ ] Duo pack (2 bands, training partners)
- [ ] Founder tier: band + video call with Peter + name engraved
- [ ] For each tier: estimated delivery (honest, including a manufacturing buffer), shipping zones (EU / UK / US / RoW), quantity limits
- [ ] Add-ons: spare headband, charging dock

**4. Story tab outline**
- [ ] Hook: campaign film (https://www.youtube.com/watch?v=5Hs_VxRIlGM) as the project video
- [ ] The problem: logging sets breaks the flow of training
- [ ] How it works: headband camera + IMU, exercise recognition and rep counting **on-device**
- [ ] **Weight-reading, framed as in development:** "we're building it" with current progress. Never shown or claimed as working.
- [ ] **Privacy, stated exactly:** reps and exercise stay on-device; weight-reading sends one frame to a cloud model and the frame is deleted after inference. Never "no cloud" and never "faces blurred".
- [ ] Prototype proof: real footage of the Android app + prototype band (required: working prototype)
- [ ] Manufacturing plan and whether the team has produced anything similar before (required for hardware)
- [ ] Timeline to delivery, team (solo founder + partners), use of funds for the $50k
- [ ] **Risks and challenges:** unvalidated weight-reading, manufacturing scale-up, certification (CE/FCC), shipping
- [ ] **AI disclosure:** AI-generated cutaways and polish in the film; on-device ML and a cloud weight-reading model in the product, with their data sources and consent
- [ ] Link ironpal.co early-bird list and FAQ (comfort, battery, supported exercises, data handling)

**5. Media**
- [ ] Main video: finished film. Re-check every frame: no photorealistic renders or simulated features passed off as real; AI cutaways must not depict unbuilt functionality (especially weight-reading).
- [ ] GIFs and photos from real prototype footage; CAD drawings and sketches allowed
- [ ] Do not show AI-baked logo shots as product photos

**6. People and Payment tabs**
- [ ] Payment: "raising funds as a business" in the US, using the Atlas entity's legal name, EIN and address; Peter as representative and beneficial owner; US bank account; card
- [ ] Complete Stripe verification (allow a few business days; contact support after 5)

**7. Submit for review**
- [ ] All tabs show complete, then click **"Send to review"** (Technology projects always go to manual review, up to 3 business days)
- [ ] Respond to Trust & Safety requests within 24 h (each round adds 3 or more business days)
- [ ] After approval: activate the **pre-launch page** (Promotion tab) and point the ironpal.co list at "Notify me on launch"

**8. What must NOT be done**
- [ ] **Do NOT click "I'm ready to launch" or "Launch project".** Once launched, a project cannot be un-launched. Wait for the founder's explicit go.
- [ ] Do not set up a project claiming to be from an eligible country without a real entity registered there
- [ ] Do not submit before the AI disclosure and marketing claims are reviewed against the guardrails
- [ ] Do not schedule promotion around 2026-10-20 for Kickstarter; use the window for Indiegogo or another eligible platform, or move the Kickstarter launch to January 2027

### Decision for the founder
1. **Approve the Stripe Atlas spend (~$500) this week.** EIN timing is the critical path.
2. Pick the Kickstarter launch month: **January 2027** is recommended. If 2026-10-20 is fixed, Kickstarter cannot meet it; launch there on another platform and keep Kickstarter for later, or skip it.
3. Hire a tax adviser for the US-entity / Slovak-residency question before money moves.


---

## GoFundMe — not suitable (why not / what it would take)

**Verdict: drop it from the top-10 list.** Don't make a draft here. GoFundMe has no pre-launch review queue you can submit to, and the campaign IronPal needs is against its rules.

### Why not
1. **Donations only.** The Terms of Service say: "You also agree not to provide or offer to provide goods or services in exchange for donations." They also ban "the promotion, advertisement, sale or resale of goods or services" (s. 8.17), "promotions involving rewards (monetary or otherwise) in exchange for donations" (s. 8.12), and "investments with the expectation of a return, loans, equity". A pre-order with early-bird headband tiers is exactly what these rules forbid. ([Terms](https://www.gofundme.com/c/terms))
2. **Slovakia isn't supported.** Payouts work only in 20 countries: AU, AT, BE, CA, DK, FI, FR, DE, IE, IT, LU, MX, NL, NO, PT, ES, SE, CH, UK and US. The person withdrawing has to meet that country's withdrawal requirements, and if the organizer doesn't, the money is likely refunded. Neither 20deka, s.r.o. (IČO 47 843 411) nor Peter as a Bratislava resident can withdraw funds. ([Supported countries](https://support.gofundme.com/hc/articles/360001972748). That page returns HTTP 403 when fetched directly, so the list was confirmed through search snippets of the article.)
3. **No "submit for review but don't launch" step.** A fundraiser goes live when you publish it. GoFundMe's own checks are ones it starts itself: Trust & Safety screening of some fundraisers (for example crisis-related ones) before they can take donations, "under review" holds that take the link offline, and withdrawal/KYC verification. None of these is an approval queue the organizer controls, so the founder's "prepare for approval, launch 2026-10-20" instruction can't work here. ([Under review](https://support.gofundme.com/hc/en-gb/articles/360036225632-Why-is-my-fundraiser-under-review))
4. **Workaround doesn't fit.** For unsupported countries, GoFundMe's only answer is an organizer who lives in a supported country and passes its withdrawal checks. That organizer is personally responsible for receiving the funds and delivering them outside GoFundMe, with a transparent transfer plan posted on the fundraiser. A company selling its own product doesn't fit that. ([Unsupported countries](https://support.gofundme.com/hc/en-us/articles/115010242608-Raising-funds-for-someone-in-an-unsupported-country))

### What it would take (not recommended)
- [ ] Turn it into a pure donation fundraiser with no rewards, no pre-orders and no promise of a device. That doesn't match the $50,000 hardware pre-order goal and would confuse early-bird backers.
- [ ] Have a payout organizer (18 or older) and bank account in a supported country, for example an Austrian or German resident or a subsidiary entity. That person carries the KYC and tax responsibility.
- [ ] Accept that it goes live the moment it's published, so there's no review step to line up with 2026-10-20.

### Fees (reference only)
No platform fee. Processing is 2.9% + EUR 0.25 per donation (EUR) or 2.9% + USD 0.30 (US), plus optional donor contributions to GoFundMe. Banks may add international or conversion fees. ([Pricing](https://www.gofundme.com/pricing))

### Must NOT do
- [ ] Don't create, publish or "test" a GoFundMe fundraiser for IronPal. Publishing launches it right away.
- [ ] Don't word any GoFundMe page as a donation that quietly promises a device in return. That breaks the ToS and leads to suspension or refunds.

### Where the effort should go instead
Use reward or pre-order platforms that accept Slovak or EU creators and have a pre-launch review, such as Kickstarter (SK is supported) or Indiegogo, per docs/kickstarter-launch-execution-plan.md.

---

## Patreon: not suitable for the IronPal $50k pre-order campaign

**Verdict: not suitable.** Do not create an IronPal pre-order campaign on Patreon.

### Why not
- **Crowdfunding is banned.** Patreon's Commerce/Benefits Guidelines say: *"Fans and creators may not buy, sell, or offer gift cards, vouchers, coupons, or crowd funding, generally."* (https://www.patreon.com/policy/benefits). A one-time $50,000 raise to pre-sell headbands is exactly what this bans.
- **The model doesn't fit.** Patreon sells recurring memberships that give access to ongoing, mostly digital content. It has no funding goal, no all-or-nothing mechanic, no campaign end date, no backer survey and no tools for shipping physical rewards.
- **There is no review without a launch attempt.** The Trust & Safety review, which not every page gets, starts only when you try to **Launch**. The page is locked while it is reviewed. After approval you can launch, and launching makes the page public. You cannot submit a page for review without starting the launch flow, which conflicts with the founder's "prepare for review but DO NOT launch" instruction (https://support.patreon.com/hc/en-us/articles/360004615552).
- **There is no scheduled launch date.** The 2026-10-20 date cannot be set in Patreon.

### Eligibility (for reference)
- A Slovak resident or 20deka, s.r.o. can most likely open a creator membership page.
  - **Payouts:** creators outside the US are paid by Payoneer bank transfer or PayPal. A local EUR bank transfer costs about $0.50 equivalent per payout, with a $10 minimum. A USD cross-currency transfer costs 1.55% + $0.25 (https://support.patreon.com/hc/en-us/articles/39694936541965).
  - **Tax form:** onboarding requires a US tax form, W-8BEN for an individual or W-8BEN-E for the s.r.o.
- **Fees** for pages published after 2025-08-04 (https://support.patreon.com/hc/en-us/articles/36426991446797, https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees):
  - 10% platform fee, or 13% with the optional Premium add-on.
  - Payment processing in EUR: 3.4% + €0.35 on payments over €3. If the page uses USD instead: 2.9% + $0.30 for cards and Apple Pay, 3.9% + $0.30 for non-US PayPal.
  - Plus payout fees, currency-conversion fees and VAT where it applies.

### What it would take (optional, low priority)
The only compliant use is a small **"IronPal Build Log"** membership that supports the Kickstarter campaign. It cannot replace it.
- [ ] Decide whether a recurring audience channel is worth the founder's time during the campaign. The default is **no**: early-bird email capture on https://ironpal.co already does this job.
- [ ] If yes, offer only **digital** benefits: dev-log posts, raw prototype footage, early app beta notes, Q&A. No hardware, no discount vouchers and no "pre-order" wording. Vouchers and coupons are also banned.
- [ ] Copy rules (marketing guardrails):
  - Present weight-reading as *being built*, never as working.
  - Never say "no cloud" or "faces blurred". Describe it as hybrid: reps and exercise on-device, one frame sent to a cloud model for weight-reading and deleted after inference.
- [ ] Setup steps:
  - Account, then the Launch Checklist: name, images, URL, About text, content rating, tiers, W-8BEN-E, Payoneer or PayPal payout with EUR as the currency, first post.
  - Stop at preview.
- [ ] **Do NOT press Launch.** Pressing it starts review (if Patreon picks the page for one) and then makes the page public.

### Do NOT
- Do not set a $50,000 goal, sell physical IronPal units or tiers, or describe Patreon support as a pre-order or crowdfunding campaign.
- Do not register, submit or launch anything as part of this plan step.

---

## Wefunder: not suitable (why not, and what it would take)

**Verdict: no campaign will be prepared on Wefunder for the 2026-10-20 launch.**

### Why not
- **Wrong campaign type.** Wefunder only does investment crowdfunding: SAFEs, convertible notes, equity and debt under SEC Reg CF, Reg D and Reg A. It has no reward or pre-order product. Backers would be buying securities in the company, not reserving an IronPal band.
- **Entity not eligible.** The help centre says "Wefunder is only available to companies legally registered in the United States" and supports only C-Corps, LLCs and PBCs ([eligibility](https://help.wefunder.com/article/0a9eb1a9-eligibility-requirements.md)). 20deka, s.r.o. (IČO 47 843 411) cannot be the issuer.
- **No EU route.** Wefunder EU B.V. got an AFM/ECSPR licence in December 2022 and launched EU offerings in February 2023. Eurocrowd (2026) reports that Wefunder EU has since stopped its ECSPR activity ([Eurocrowd](https://eurocrowd.org/?p=5013)), and the current help centre names no EU issuer path.
- **"Prepare but don't launch" does not work here.** Submitting means filing Form C with the SEC. After filing, the page becomes searchable on Wefunder right away, and a "soft launch" is live to anyone with the link ([searchability](https://help.wefunder.com/article/80d84eb1-how-long-after-filing-my-form-c-does-my-campaign-page-become-searchable.md), [soft vs public](https://help.wefunder.com/article/b7cb3566-whats-the-difference-between-soft-and-public-launch.md)).
- **Timeline.** 13 days is not enough for the legal setup alone. A public launch (Explore page, marketing emails and promotions) also needs **$50,000 already raised** in soft launch plus a background compliance check. For this goal, that means raising the full target before any public exposure.

### What it would take (a possible later equity round, not a pre-order)
- [ ] Decide whether IronPal wants outside equity investors at all. This is a separate decision from the pre-order campaign.
- [ ] Email launch@wefunder.com **before** incorporating, as the help centre advises.
- [ ] Form a US entity (a Delaware C-Corp through a registered agent is typical), and decide how it relates to 20deka (a parent/subsidiary flip, or an IP licence or assignment).
- [ ] Get an EIN, and notarise a Power of Attorney for the Form C filing. Ask Wefunder which verification pathway applies and whether an apostille is needed.
- [ ] Expect identity and sanctions checks as part of Wefunder's compliance review (not spelled out in the help centre).
- [ ] Plan for Reg CF's rule that roughly half the capital raised is deployed inside the US. The rule does not apply to Reg D.
- [ ] Prepare GAAP financials: self-compiled up to $124k, CPA-reviewed up to $1.235M ([financial requirements](https://help.wefunder.com/article/79f1eeba-regulation-cf-financial-requirements.md)).
- [ ] Draft the Form C: instrument (e.g. a SAFE with valuation cap or discount), minimum target, use of funds, and risk factors. One required risk factor: weight-reading is **not yet validated**. Describe it as being built, and describe privacy accurately as hybrid (one frame sent to a cloud model and deleted after inference); never claim "no cloud" or "faces blurred".
- [ ] Any pre-filing "testing the waters" posts must carry the [legal disclosure](https://help.wefunder.com/article/d5a5b992-testing-the-waters-legal-disclosure.md).
- [ ] Fees: 7.9% of the amount raised, only on a successful close, no upfront fee ([fees](https://help.wefunder.com/article/c548bb29-what-does-wefunder-charge-in-fees.md)). Add your own costs for legal, accounting and annual Form C-AR reports.

### Do NOT
- [ ] Do not register, form a US entity, or file a Form C as part of this pre-order plan.
- [ ] Do not describe IronPal pre-orders as an "investment" or "equity" anywhere in the campaign.
- [ ] Do not put Wefunder in the 2026-10-20 launch set. Reconsider it only after the pre-order campaign, as a separate equity round.

**Goal field: not applicable.** A $50,000 pre-order goal has no equivalent here; a Reg CF round would set its own minimum and maximum targets.

---

## StartEngine: not suitable for the 2026-10-20 pre-order campaign

**Verdict:** Not suitable. Nothing should be created, drafted or submitted on StartEngine for this campaign.

### Why not
1. **It can't run a pre-order.** StartEngine offers equity, debt and revenue-share offerings only (Reg CF / Reg A+). There is no reward or pre-order product, so backers would be investors buying securities, not customers reserving a band. (https://www.startengine.com/company-faqs/)
2. **The issuer must be a US entity.** Under 17 CFR 227.100(b)(1), Reg CF is unavailable to issuers not organized under US state or territory law, and StartEngine requires a "US-based operating company". 20deka, s.r.o. (IČO 47 843 411, Bratislava) does not qualify. (https://www.law.cornell.edu/cfr/text/17/227.100)
3. **Securities filings and financials come first.** A Form C must be filed with the SEC before the offering goes live. It needs financial disclosure tiered by target (17 CFR 227.201(t)): at $124k or less, tax-return figures certified by the principal executive officer; up to $618k, statements reviewed by an independent accountant; above $618k, an audit, though a first-time issuer can use reviewed statements up to $1.235M. Corporate documents and a term sheet with a valuation are also needed, plus annual reporting afterwards.
4. **The timeline doesn't work.** StartEngine says onboarding generally takes 4-6 weeks, and that only starts once a US entity, EIN and bank account exist. 2026-10-20 is 13 days away.
5. **It costs more.** Upfront costs are $4k-$10k for the financial review and legal documents on StartEngine's standard path. A zero-upfront path exists for corporations that cap the raise at $107k. StartEngine takes warrants or equity of up to 5% (per its Form CRS). Third-party reviews put the cash commission at about 7-10%; StartEngine's own pages don't state it. Add ongoing compliance and permanent dilution of the cap table.

### Marketing-claim note
Any equity offering document is a legal disclosure to investors. The guardrails become legal requirements there: weight-reading must be described as unvalidated R&D, and privacy as hybrid (one frame goes to a cloud model and is deleted after inference). Never say "no cloud" or "faces blurred".

### What it would take (only if a later equity round is wanted, e.g. after the reward campaign)
- [ ] Decide whether a public equity round makes strategic sense at all (dilution, investor-relations load for a solo founder).
- [ ] Get Slovak and US counsel. Form a Delaware C-corp, either as parent ("flip") or as an IP-holding subsidiary of 20deka, s.r.o., and settle IP assignment and transfer-pricing/tax treatment.
- [ ] Get an EIN. A non-US responsible party applies with Form SS-4 by fax (about 4 business days), by mail (about 4-6 weeks) or by phone. Also set up a registered agent and a US business bank account.
- [ ] Prepare financials matched to the target tier: officer-certified tax-return figures up to $124k; independent-accountant-reviewed up to $618k, or up to $1.235M for a first-time issuer; audited above that.
- [ ] Choose the instrument (SAFE / common / preferred) and valuation, and draft the term sheet.
- [ ] Apply on startengine.com, go through onboarding and KYC on officers and directors, and work with StartEngine on drafting the Form C.
- [ ] Optionally "test the waters" (reservations) before the Form C is filed, following StartEngine's process.
- [ ] Earliest realistic launch is around Q1 2027. Plan for a 60-90 day campaign and annual Form C-AR filings after it.

### What must NOT be done now
- [ ] Do not register an account, apply, or start onboarding on StartEngine for the 2026-10-20 campaign.
- [ ] Do not describe the Kickstarter or pre-order campaign as an "investment", or promise equity or returns anywhere. That could count as an unregistered securities offer.
- [ ] Do not launch anything. The founder's instruction is draft and review only.

### Recommendation
Drop StartEngine from the 2026-10-20 platform set. Put the effort into reward and pre-order platforms that accept EU companies, such as Kickstarter and Indiegogo. Look at StartEngine again later as an optional US equity round once there is pre-order traction and a US entity.

---

## Republic (Republic US + Republic Europe, ex-Seedrs): not suitable for the 2026-10-20 pre-order

**Verdict: not suitable. No campaign gets drafted here.** Republic is an investment platform. It sells equity, SAFEs and other securities, not rewards or pre-orders. The IronPal $50,000 hardware pre-order does not fit any Republic product.

### Why not
| Question | Republic US (Reg CF / Reg D / Reg A+) | Republic Europe (ECSPR equity) |
|---|---|---|
| Reward / pre-order campaign? | No, securities only | No, equity only |
| Can 20deka, s.r.o. (SK) raise? | **No.** Only US-based, US-incorporated companies; a non-US company would need a US subsidiary with real US operations | **Yes in principle.** "Your business and community must be based full-time in the UK, EU, EEA or Switzerland"; Seedrs Europe Ltd is ECSPR-authorised by the Central Bank of Ireland |
| Minimum target | n/a (no eligible entity) | **"Your target raise should be over £/€150,000"**, about three times the $50k goal |
| Self-serve draft, submit, wait? | No: Form C filed with the SEC, CPA-reviewed financials | No: application, Campaign Development screening, engagement letter, Campaign Manager, campaign build, due diligence, KIIS, private phase, then public (max 30 days) |
| Ready to launch by 2026-10-20? | No (no eligible entity) | No. Republic publishes no review timeline; our estimate is 6–12+ weeks from application, and it is a different kind of raise |
| Fees | 7% cash + 2% securities (about 10–11% all-in with escrow/processing, per a 2026 third-party review) | Issuer: 6% success fee + £2,500 completion fee + payment processing (third-party figures, confirm with Republic). Investors pay 2.5% (min €5, max €250) + 5% carry on exit (Republic help page) |

Sources: see the source list. Key ones are the Republic Europe eligibility page (intercom.help/seedrs-entrepreneur/en/articles/1966629), the application process page (help-entrepreneur.republic.com/en/articles/1966669), the fundraising journey page (help-entrepreneur.republic.com/en/articles/1795086) and the Republic US help page (republic.com/help/what-kind-of-startups-are-accepted-to-raise).

### What must NOT be done
- [ ] Do **not** submit a Republic Europe "apply to raise" form as part of the 2026-10-20 pre-order plan. The application starts an equity-raise conversation and an engagement letter, which is not what the founder asked for.
- [ ] Do **not** register or start a US entity or Form C to "get onto Republic". It is out of scope and costs money.
- [ ] Do not present IronPal on any investment platform with claims that weight-reading works. It is still being built. Do not claim "no cloud" or "faces blurred" either: weight-reading sends one frame to a cloud model, which deletes it after inference. On a securities platform, an inaccurate claim becomes a misstatement in an offering document (KIIS or Form C), not just marketing copy.

### What it would take (future option, after the Kickstarter)
Republic Europe is a credible **post-Kickstarter equity round**. The Kickstarter backer count would also count as the "community / pre-committed" proof Republic Europe screens for.
- [ ] Decide on an equity round of **€150k+** and a pre-money valuation (the Republic Europe Academy has a startup valuation calculator).
- [ ] Check the 20deka, s.r.o. articles: issuing new shares (zvýšenie základného imania) to a nominee structure needs a shareholder resolution and a filing in the Slovak commercial register (obchodný register). Get Slovak legal advice.
- [ ] Prepare a business plan, financials for 20deka, s.r.o., a cap table, founder KYC (ID, proof of address) and company KYC (register extract, beneficial owner).
- [ ] Line up pre-commitments: Republic Europe expects the size of your community and the amount pre-committed to be appropriate for the raise.
- [ ] Apply through the apply-to-raise form at europe.republic.com (general support: eur-support@republic.com). Then go through screening, engagement letter, Campaign Manager, the campaign build (pitch, video, shareholder documents), due diligence and the KIIS.
- [ ] Private phase (your own network), then the public campaign (30-day limit).
- [ ] Budget about 6% + £2,500 + processing fees + legal costs (confirm current issuer fees with Republic).
- [ ] Republic US stays closed unless IronPal later sets up a US subsidiary with real US operations.

### Recommendation for the 2026-10-20 plan
Leave Republic out of the platforms launching on 2026-10-20. List it in the plan as the **"next round: equity"** option, revisited after the pre-order campaign closes and with a €150k+ target.

---

## Crowdcube: not suitable for the October pre-order campaign

**Verdict: not suitable.** Crowdcube only runs investment crowdfunding (equity, plus some debt and mini-bonds). There is no reward or pre-order campaign to build there, so this section explains why not and what an equity raise would take, rather than drafting a campaign.

> Note: Crowdcube's own pages (crowdcube.com/raise, help.crowdcube.com) blocked automated fetching (HTTP 403, re-checked 2026-10-07). The facts below come from secondary sources, cited in the sources list. Check them directly with Crowdcube before acting on any of them.

### Why not, for this brief
- **Wrong product.** Backers on Crowdcube buy shares in the company. They do not pre-order a device. A $50k IronPal pre-order goal with rewards cannot be set up.
- **Securities paperwork.** An EU raise runs under Crowdcube's EU crowdfunding (ECSP) licence from the Spanish regulator (CNMV). It needs a Key Investment Information Sheet (KIIS), a valuation, financials, director checks and Crowdcube's due diligence.
- **Corporate changes.** 20deka, s.r.o. would need its articles amended and a shareholder resolution to issue new shares. That needs Slovak legal counsel.
- **Timing.** Due diligence alone takes at least 3-4 weeks, and a private period for lining up lead investors comes before the public launch. A 2026-10-20 launch is not achievable.
- **Size and stage.** Historically the minimum raise was about £50k, and Crowdcube favours larger rounds with a lead investor. In 2025-26 it has also moved deliberately toward later-stage and secondary deals. A pre-revenue raise near the minimum is a weak fit there.

### Eligibility (for a future equity round only)
- Core market: UK and Irish limited companies. Other European companies are "considered" case by case.
- Under the ECSP licence, EU businesses can raise up to EUR 5m a year from EU investors. A Slovak s.r.o. is not excluded in principle, but needs Crowdcube's approval.

### Fees (equity)
- No upfront listing fee.
- Success fee of about 7% + VAT on the amount raised, plus a reported completion fee of about 0.75-1.5% (quoted per raise), plus card-processing costs.
- On top: legal, accounting and valuation costs.

### What it would take (only if the founder later wants an equity round)
- [ ] Decide whether to give up equity at all: pre-money valuation, size of the round, dilution
- [ ] Hire Slovak corporate counsel: amend the s.r.o. articles and approve the new share issue (or convert to an a.s., the Slovak joint-stock form, if more practical for many shareholders)
- [ ] Prepare financials: last 2 years of 20deka accounts, plus a 3-year forecast and use of funds
- [ ] Prepare a pitch deck (reuse docs/pitch_deck/IronPal_PitchDeck_2026.pdf, tightened for investors)
- [ ] Line up a lead investor or commitments from your network for the private period
- [ ] Apply via crowdcube.com/raise; pass the screening call and due diligence (director ID checks, company and shareholder review)
- [ ] Draft the KIIS and the pitch page with Crowdcube's team
- [ ] Wording rules for the pitch, which also apply to investor documents: weight-reading must be described as being built and not yet validated. Privacy must be described as hybrid: reps and exercise recognition on-device, one frame sent to a cloud model for weight-reading and deleted after inference. Never claim "no cloud" or "faces blurred".
- [ ] **Do NOT** apply, register or submit anything as part of the 2026-10-20 pre-order effort

### Recommendation
Leave Crowdcube out of the 2026-10-20 launch. Run the pre-order on a reward platform (Kickstarter, Indiegogo or similar, per docs/kickstarter-launch-execution-plan.md). Revisit Crowdcube, or EU equity platforms such as Republic Europe (formerly Seedrs) or Conda, for a seed round after the pre-order shows demand. An equity pitch with real pre-order numbers is much stronger.

---

## Makuake (Japan): not suitable for the 2026-10-20 launch

**Verdict:** Not suitable for this launch. Possible later as a Japan market-entry campaign run through a Japanese partner.

### Why not
- **Eligibility.** Makuake's executor guideline (Art. 2) lets Makuake refuse an applicant that is a *foreign corporation without a Japan branch* or *resides outside Japan* ("外国法人（日本に支店を持つ場合を除く）である場合又は日本国外に居住する場合"; https://www.makuake.com/pages/guideline/). 20deka, s.r.o. (Bratislava) and Peter Dermek both fall under this. The guideline also lets Makuake refuse if post and parcels do not reach the registered address, and it can refuse without giving reasons.
- **No self-serve draft.** Makuake is curator-led. You apply through https://www.makuake.com/apply/form/, then Makuake screens the applicant and the project before publication. The guideline does not name or time the review stages. There is no "draft and hold" state a foreign company can reach alone. Overseas makers come in through a Makuake Global Official Partner, who acts as project operator.
- **Localisation.** The page, backer communication and legal disclosures (特定商取引法) must be in Japanese, and Japanese backers expect high support standards.
- **Radio certification.** The band's BLE/Wi-Fi radios need Japan Radio Act (Giteki/MIC) conformity. Under the Japan-EU mutual recognition agreement, an EU-based conformity assessment body registered under the MRA can test and certify the band against Japan's technical standards. CE marking by itself does not count. Either way it has to be arranged and documented (https://www.tele.soumu.go.jp/e/sys/others/inbound/index.htm).
- **Timing.** Partner contract, Japanese page production and certification realistically take 2-3 months (estimate; Makuake publishes no review timeline). 2026-10-20 is 13 days away.

### Fees (for reference)
- 20% (tax-excluded) commission, payment processing included. No listing fee. Under All-or-Nothing the fee is charged only if the target is reached; under All-in it is charged on whatever is raised. Payout on the 25th of the month after the campaign ends (https://lp-mk-2.makuake.com/system-commission).
- Optional: Japanese page production from about ¥300,000; Makuake ads from 10% of the target (minimum ¥300,000 for a 2-week campaign).
- The Global Official Partner charges its own fees on top.

### What it would take (phase 2, after Kickstarter)
- [ ] Do not register, apply or submit anything for the Oct 2026 launch.
- [ ] Contact a Makuake Global Official Partner for English-speaking makers (QB Brothers, TSUMIKI, MadSpace Japan; announced Aug 2023, https://ecnomikata.com/ecnews/cross-borderec/40072/) and get a quote for operator services: page production, pre-launch promotion, backer support, Japan fulfilment.
- [ ] Alternatively, assess opening a Japanese branch of 20deka (needs a Japan-resident representative and a Japanese bank account). This is slower and costlier.
- [ ] Confirm the band's radio certification path for Japan (MIC-registered body in Japan, or an EU-based MRA-registered body testing to Japanese standards) and whether the battery and charger need PSE marking.
- [ ] Have the partner build the Japanese draft:
  - **Title:** Japanese working title, e.g. "IronPal — 一人称視点で筋トレを自動記録するヘッドバンドカメラ"
  - **Category:** ガジェット / スポーツ・フィットネス
  - **Model:** All-or-Nothing
  - **Target:** the yen equivalent of a Japan-specific target. The global $50,000 goal belongs to Kickstarter; Makuake would be a separate Japan raise.
  - **Rewards:** early-bird (超早割), early-bird (早割), and a regular Makuake price on the band plus app.
  - **Story:** the problem (manual logging), first-person camera plus IMU, on-device exercise recognition and rep counting. Weight reading must be described as *in development* and never as working. Privacy must be described accurately: reps and exercise on-device, weight-reading sends one frame to a cloud model that is deleted after inference. Never say "no cloud" or "faces blurred".
  - **Media:** campaign film (https://www.youtube.com/watch?v=5Hs_VxRIlGM) with Japanese subtitles; founder on camera.
  - **Launch date:** set only after Makuake's screening passes. Not 2026-10-20.
- [ ] Submit through the partner for Makuake's screening and keep the project unlaunched until the founder approves.

### Must NOT do
- Do not launch or schedule a Makuake campaign for 2026-10-20.
- Do not apply directly as 20deka, s.r.o. It is ineligible and would be rejected.
- Do not claim Japan delivery or certification before the radio and PSE status is confirmed.

---

