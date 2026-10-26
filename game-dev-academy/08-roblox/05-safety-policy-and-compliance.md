# Safety, Policy and Compliance (as of Oct 2026)

> **What you'll learn**
> - The 2025–2026 safety overhaul: mandatory age checks, age-based chat, Roblox Kids & Select accounts, content maturity labels.
> - The lawsuits and regulators behind it, and what actually changed for developers.
> - The rules that get games restricted or removed, plus a copy-paste compliance checklist for a kid-friendly TD game.

Tags: **[P]** Roblox said it · **[S]** reputable press/analyst · **[U]** unverified/community (incl. law-firm trackers) · **Lesson** = our guidance. **Not legal advice.**

---

## 1. Timeline: how Roblox changed (2025 → 2026)

| Date | Change | Tag |
|---|---|---|
| Jan 2025 | Germany's USK raises Roblox's rating from USK 12 to **USK 16** | [P] [FY2025 10-K][10k-25] |
| Aug 14, 2025 | **Louisiana** AG sues (first state) | [U] [MDL tracker][mdl] |
| Oct 2025 | **Kentucky** sues (Oct 7). **Florida** issues criminal subpoenas (Oct 20). | [U] [mdl] |
| Oct 30, 2025 | Roblox announces face age checks for all chat users in early 2026, limits on adult–minor chat, and IARC ratings plans | [P] [Q3'25 letter][q3-25] |
| Nov 7, 2025 | **Texas** AG sues | [U] [mdl], [ConsumerNotice][cn] |
| Nov 19, 2025 | Age-check program detailed: bands **<9, 9–12, 13–15, 16–17, 18–20, 21+**. Vendor **Persona**. Images "deleted immediately after processing". | [P] [Age-check post][agecheck] |
| Dec 2025 | Enforcement starts in **Australia, New Zealand, Netherlands** | [P] [agecheck] |
| Dec 12, 2025 | Federal child-exploitation cases centralised as **MDL No. 3166** (N.D. Cal., Chief Judge Seeborg) | [U] [mdl] |
| Dec 2025 | Florida (Dec 11), Iowa (Dec 16), Tennessee (Dec 18) suits | [U] [mdl] |
| **Jan 7, 2026** | **Age check required for chat worldwide**. Not age-checked = chat off. | [P] [Q1'26][q1-26]; date [U] [mdl] |
| Early 2026 | Social links need age checks (16+). **Creators may not post social links in experiences.** Team Create requires similar-age collaborators. | [P] [agecheck] |
| Feb–Jun 2026 | LA County (Feb 19), Nebraska, Indiana, Oklahoma, Arkansas suits | [U] [mdl], [cn] |
| Mar 20, 2026 | New advertising policies. Native rewarded video only (**May 4**). **No rewarded ads for under-13s.** | [P] [Ad policy][ad-policy] |
| Apr 2026 | Settlements: **Nevada** (~$10–12M), **Alabama** ($12.2M), **West Virginia** (~$11M) | [U] [mdl], [cn] |
| Jun 2026 | **Russia** reinstates Roblox (blocked since Dec 2025) | [P] [Q2'26][q2-26]; block date [S] [AA][aa] |
| **Jun 16, 2026** | **Roblox Kids (5–8)** and **Roblox Select (9–15)** accounts go global | [P] [Kids & Select launch][kids-launch] |
| Jul 13, 2026 | South Dakota settlement ($8.6M + conditional $5.4M) | [U] [mdl] |
| Aug 4, 2026 | **Continuous age estimation** described: daily behavioural model, 338M face age checks processed | [P] [Age assurance post][assurance] |
| Sep 24, 2026 | LA County judge denies Roblox's demurrer/anti-SLAPP. Age-verification claims proceed. | [U] [mdl] |
| Sep 29, 2026 | Kansas settlement reported (~$9.8M over 3 years) | [U] [mdl] |
| Oct 2026 | ~**180** cases pending in MDL 3166. **No** Section 230 ruling yet in the MDL. | [U] [mdl] (JPML report) |

The law-tracker items are **[U]**: secondary sites citing court/AG documents. Check the AG press release or docket before quoting amounts.

---

## 2. Age checks and chat (what players experience)

[P] [agecheck], [kids-launch], [Parental controls][parents], [Q2'26][q2-26]:

- **Age check = face estimation (Persona) or ID (13+).** Optional, but **chat stays locked** without it.
- **Chat only with similar ages.** Example from Roblox: an estimated 12-year-old can chat with users 15 or younger, and users 16+ can't start chats with her.
- **Trusted Connections:** age-checked 13+ users can chat freely with people they know. Under-13 Trusted Connections need parental approval.
- **Image/video sharing in chat is prohibited.** Chat is AI-monitored and not encrypted. Under-13 chat has strict filtering.
- **Continuous age estimation (Aug 2026):** a daily model compares behaviour with the estimated age and can prompt a re-check (e.g., account handed to a younger sibling) [P] [assurance].
- **Penetration:** 57% of global DAU age-checked by end of Q2 2026. US and Australia >70%, goal 90% [P] [q2-26].
- **Cost:** Roblox guided a mid-single-digit engagement headwind and a low-single-digit bookings headwind from age checks [P] [Q4'25][q4-25]. On-platform chat was still **below** pre-age-check levels in Q2 2026 [P] [q2-26].
- Third-party report: Persona's mean absolute error is **1.4 years** for under-18s (vendor/UK certification figure) [S] [Biometric Update][biometric].

**Developer impact:** many kids in your server **can't chat with each other**. Design co-op that works without typing: pings, emotes, Quick Words (creator-addable later in 2026) [P] [RDC 2026][rdc26].

---

## 3. Roblox Kids & Select (the new gate)

| Account | Ages | Content allowed | Chat default | Tag |
|---|---|---|---|---|
| **Roblox Kids** | 5–8 | **Minimal / Mild** games that passed selection | Off (parent can enable) | [P] [kids-launch] |
| **Roblox Select** | 9–15 | Up to **Moderate** | Gradual after age check; similar ages / Trusted Friends | [P] [kids-launch] |
| Roblox | 16+ | Everything up to their verification level | On | [P] [kids-launch] |
| Self-declared (no age check) | any | Kids/Select limits | **Off** | [P] [kids-launch] |

**Excluded by default from Kids & Select:** games with **social hangouts**, **free-form drawing**, or **sensitive issues** [P] [kids-launch].

**How your game gets in** [P] [Kids & Select docs][kids-docs], [Publishing docs][publish]:
1. Creator account in good standing. **Face check (<18) or government ID (18+).** **2FA on.**
2. Full **Maturity & Compliance Questionnaire** → Minimal, Mild or Moderate (9+).
3. **2 consecutive months of Roblox Plus/Premium**, or a one-time refundable **1,000 Robux** publishing fee. The fee is refunded if the game keeps **25 highly engaged players for 60 days** without moderation.
4. Trial with age-checked 16+ players → threshold of **250 unique plays by highly engaged age-checked users within 60 days** → **safety review**.
5. Optional **50,000 Robux** refundable expedited review for timed launches.
6. Track it in Creator Hub → **Audience Reach**.

Social links are visible only to age-checked **16+** users. **Moments** isn't available to Kids/Select at launch [P] [kids-launch].

---

## 4. Content maturity labels

[P] [Content maturity docs][maturity]:

| Label | Example content | Who can play |
|---|---|---|
| **Minimal** | Occasional mild violence, light unrealistic blood | Kids, Select, 16+ |
| **Mild** | Repeated mild violence, heavy unrealistic blood, mild crude humour | Kids, Select, 16+ |
| **Moderate** | Moderate violence, light realistic blood, moderate fear | Select, 16+ |
| **Content May Vary** | Answered only the first question | Age-checked **16+** only |
| **Restricted** | Strong violence, heavy realistic blood, romantic themes, alcohol, strong language | **ID-verified 18+** only. Servers kick others. Creator must verify 18+. |

- **Unlabelled games:** Roblox "automatically restricts the playability of the game on the platform for all players."
- Answer based on the **most mature content a player can encounter**.
- **Don't add age-restricted content before you have the label.**
- Inaccurate answers → moderator feedback, label replaced, and repeated issues → moderation of the game/account. Appeal at roblox.com/report-appeals.

**TD game tip (Lesson):** cartoon towers blasting cartoon enemies with no realistic blood usually lands **Minimal or Mild**. That keeps Kids (5–8) open. Skeletal gore, jump-scare bosses or "realistic" blood can push you to Moderate (no Kids) or higher.

**IARC ratings:** Roblox said in Oct 2025 it is "adopting IARC content ratings" [P] [q3-25]. The current maturity docs **don't mention IARC** [P] [maturity]. Status unverified as of Oct 2026.

---

## 5. Parental controls (what parents can switch off in your game)

[P] [parents]:

| Control | Detail |
|---|---|
| Spending limit | Monthly cap on Robux + experience subscriptions. Resets monthly. Gift cards are exempt. |
| Spend alerts | All / high-spend only / none. High-spend defaults at **$100, $250, $500**, then every 10 transactions. |
| Screen time | Daily limit for Kids and Select 9–12. When hit, Roblox is unavailable for the rest of the day. |
| Content | Maturity slider. **Block specific games.** Approve requested games. "Sensitive issues" blocked by default under 13. |
| Chat | Experience chat and direct chat toggles. Under-9 chat only with under-13s/Trusted Friends. Voice off for under-13s by default. |
| Robux transfers (young users) | Parent approval each time. **500/day, 1,000/month** cap. |
| Trading | Only Plus/Premium subscribers. Can be limited by parents. |

**Lesson:** if your game makes parents nervous (aggressive popups, constant purchase prompts), they can **block it by name**. Design for the parent watching over the shoulder.

---

## 6. Community Standards: the developer-relevant parts

Roblox groups the standards into Safety, Civility, Integrity and Security [P] [Community Standards][cs]. For game makers:

| Area | Rule (short) |
|---|---|
| **Misleading content/metadata** | No "deceptive, sensational, duplicative, or otherwise misleading content or metadata" to boost visibility or earnings. No re-uploading near-identical games. |
| **Paid random items** | Odds **numerically disclosed before purchase**. **Every outcome must give a benefit.** Bundles with random items count. Use `ArePaidRandomItemsRestricted`. |
| **Gambling** | No real money, Robux or valuable items in gambling. No independent Robux/real-money contests. |
| **Robux economy** | No third-party Robux trading. No selling on-platform items off-platform. No dodging Roblox payments or fees. Gate paid-item trading with `IsPaidItemTradingAllowed`. |
| **Off-platform** | Links only via the Social Links feature (16+, age-checked). "Any other efforts to direct users off of Roblox ... are prohibited." |
| **Romantic/sexual** | Prohibited, incl. sexualised avatars and items. No private spaces (bathroom stalls, bedrooms) in Social Hangouts. |
| **Advertising** | Register third-party integrations. Use only Roblox ad tools. No sharing user-level engagement data with advertisers. **No personalised ads for under-18s.** |
| **Exploits/cheating** | No using or sharing exploits. No phishing. |
| **IP** | Infringing content removed on valid takedown. Roblox may remove suspected infringement proactively. |

### Experience Notifications and ads: extra rules

- Notifications: no disguised ads, false time pressure, bait-and-switch or purchase tricks. **Never require opt-in to play.** 13+ only [P] [Notifications docs][notif].
- Ads: **no rewarded formats for under-13s** (including avatar items/dev products as completion rewards). Food, cosmetics, pharma and finance ads are restricted for U13. Brand integrations must be registered ≥5 business days before going live. Non-compliance → removal, suspension or feature limits [P] [ad-policy].

---

## 7. "Spend-to-win" and dark patterns

**What Roblox rules directly ban** (sourced above): hidden odds, "nothing" outcomes, deceptive notifications, false urgency in notifications, revoked subscription benefits, extra tasks after payment, giveaway-bait metadata, and rewarded ads for under-13s.

**What Roblox doesn't ban outright, but the repo does** (CONTRIBUTING + `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`):
- Pay-to-win walls on core progress
- Fake timers and fake discounts
- Guilt-trip popups ("Your towers will be sad if you leave!")
- Purchase prompts on spawn or after every loss

**Platform trend:** Roblox's own algorithm now favours **retention over near-term monetization**, and accepted a bookings drop to do it [P] [q2-26]. Aggressive monetization that hurts D7/D28 now also hurts discovery (see 08.03).

**Regulatory pressure (sourced):**
- UK Online Safety Act fines up to **10% of global revenue**. Australia's under-16 social media minimum-age law. Indonesia child-safety requirements from early **2027**. Texas parental consent for minors' digital purchases (2024) [P] [10-K risk factors][10k-25].
- State AG suits rely on **consumer-protection / deceptive-practices** laws (Texas DTPA, Florida FDUTPA, etc.) [U] [mdl]. "Deceptive" is the legal hook, so be honest in every store screen.

---

## 8. Copyright, IP and memes

**How takedowns work** [P] [Rights Manager docs][rights]:
- Rights holders register, verify ownership, and file removal requests in **Rights Manager** (up to 250 links per request). Holders **without** a Roblox presence can use it too.
- Requests against you show under **Claims Against Me**. Approved = content removed. The page doesn't describe strikes or counter-notices. Use Roblox Support / DMCA processes [P] [cs].

**Risk guide (Lesson; we found no Roblox ruling on specific memes):**

| What you want to use | Risk | Why / what to do |
|---|---|---|
| Anime characters, names, logos, music (any big franchise) | **High** | Owned by studios/publishers with active legal teams. Inspired-by styles are OK. Copied characters, names and art are not. |
| Brand names/logos (food, toys, games) | High | Trademark + ad rules (unregistered brand = undisclosed ad) |
| "Brainrot" meme characters | **Unclear [U]** | Ownership of viral AI-made meme characters is murky. Some creators claim rights. Make **your own** original creatures that riff on the trend. |
| Public-domain myths, generic tropes (dragons, robots, zombies) | Low | Make your own art |
| Free Creator Store models | Medium | Check the licence and author. Stolen assets get mass-removed. |
| Music | Medium–High | Use Roblox's licensed audio library. Uploading commercial songs gets removed. |

Roblox also deprioritises **non-unique** games that copy existing titles and visuals [P] [Discovery docs][disc]. Copying hurts you even before a takedown.

---

## 9. What gets games restricted or taken down

| Trigger | Result | Tag |
|---|---|---|
| No maturity questionnaire / label | Playability restricted for **all** players | [P] [maturity] |
| Restricted content without Restricted label | Moderation consequences | [P] [maturity] |
| Repeated inaccurate questionnaire answers | Game and/or account moderation | [P] [maturity] |
| Hidden odds / no-benefit outcomes on paid random items | Violates the Terms of Use and Community Standards | [P] [pri], [cs] |
| Directing users off-platform, social links in-game | Prohibited. Games built to send users off-platform are banned. | [P] [cs], [agecheck] |
| Unregistered ad integration / third-party ad SDK | Content removal, suspension, feature limits | [P] [ad-policy] |
| Valid IP takedown | Asset/game removed | [P] [rights], [cs] |
| Misleading/duplicative metadata or near-copies | Reduced exposure (banner in dashboard), possible moderation | [P] [disc], [cs] |
| Social hangout with private rooms, romantic content | Prohibited / excluded from Kids & Select | [P] [cs], [kids-launch] |
| Severe violation within 60 days of publishing | Publishing fee not refunded | [P] [publish] |

---

## ✅ Compliance checklist (kid-friendly TD game)

**Account & publishing**
- [ ] 2FA on. Face check (<18) or ID (18+) done.
- [ ] Full Maturity & Compliance Questionnaire answered for the **most mature** content. Label is Minimal or Mild.
- [ ] Plus/Premium for 2 months **or** 1,000 R$ refundable fee paid.
- [ ] Audience Reach shows progress toward 250 highly engaged plays.

**Content**
- [ ] No realistic blood/gore, romantic themes, alcohol, strong language.
- [ ] No free-form drawing, no social-hangout areas, no private rooms.
- [ ] All art, names and music original or properly licensed. No anime/brand IP.
- [ ] No social links or "join my Discord" text inside the game.

**Money**
- [ ] Every crate/egg/spin shows **numerical odds before purchase**, totals 100%, button labelled "Odds".
- [ ] `ArePaidRandomItemsRestricted` checked server-side, with a fallback (earnable path or direct buy).
- [ ] No outcome gives "nothing".
- [ ] Trading gated by `IsPaidItemTradingAllowed`.
- [ ] Subscriptions give the same benefits everywhere and are never revoked silently.
- [ ] No purchase prompt on spawn. No fake timers or discounts.

**Ads & notifications**
- [ ] Rewarded ads hidden for under-13s (check policy flags, e.g., `AreAdsAllowed`). Native Roblox rewarded video only.
- [ ] Notification opt-in shown after a happy moment, never required to play.
- [ ] Any brand deal registered in Ads Manager ≥5 business days ahead.

**Social**
- [ ] Co-op works **without chat** (pings, emotes, Quick Words).
- [ ] Report/block reachable. No custom chat that bypasses Roblox filtering.

---

## Exercise (one sitting)

Run the checklist above on your game. For every unchecked box, write: *what*, *where in the code/UI*, and *by when*. Fix the two items that could get the game **restricted** (label, odds) first.

---

## Sources

[10k-25]: https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm
[q3-25]: https://www.sec.gov/Archives/edgar/data/1315098/000131509825000326/ex991-q32025shareholderl.htm
[q4-25]: https://www.sec.gov/Archives/edgar/data/1315098/000131509826000009/ex991-q42025shareholder.htm
[q1-26]: https://www.sec.gov/Archives/edgar/data/0001315098/000162828026028882/ex991-q12026earningsshar.htm
[q2-26]: https://www.sec.gov/Archives/edgar/data/0001315098/000162828026051059/ex991-robloxq22026earnin.htm
[creator-rewards]: https://create.roblox.com/docs/creator-rewards
[agecheck]: https://about.roblox.com/newsroom/2025/11/roblox-requires-age-checks-limits-minor-and-adult-chat
[assurance]: https://about.roblox.com/newsroom/2026/08/beyond-selfie-how-roblox-age-assurance-system-helps-keep-age-checks-current-
[kids-launch]: https://about.roblox.com/newsroom/2026/06/age-based-roblox-kids-and-select-accounts-now-globally-available
[kids-docs]: https://create.roblox.com/docs/production/publishing/kids-and-select
[publish]: https://create.roblox.com/docs/production/publishing/publish-experiences-and-places
[maturity]: https://create.roblox.com/docs/production/promotion/content-maturity
[parents]: https://about.roblox.com/parental-controls
[cs]: https://about.roblox.com/community-standards
[notif]: https://create.roblox.com/docs/production/promotion/experience-notifications
[ad-policy]: https://devforum.roblox.com/t/new-advertising-policies-standards/4527365
[pri]: https://create.roblox.com/docs/production/monetization/paid-random-items
[rights]: https://create.roblox.com/docs/production/publishing/rights-manager
[disc]: https://create.roblox.com/docs/discovery
[rdc26]: https://about.roblox.com/newsroom/2026/09/rdc-2026-the-world-needs-more-play
[biometric]: https://www.biometricupdate.com/202601/roblox-rolls-out-facial-age-estimation-for-chat-access-globally
[aa]: https://www.aa.com.tr/en/science-technology/explainer-global-backlash-grows-against-roblox-over-risks-to-children/3827266
[mdl]: https://mdlupdate.com/mdl/3166-roblox-child-safety/
[cn]: https://www.consumernotice.org/legal/roblox-lawsuit/

- SEC: FY2025 10-K [link][10k-25]; letters Q3'25 [link][q3-25], Q4'25 [link][q4-25], Q1'26 [link][q1-26], Q2'26 [link][q2-26]
- Roblox newsroom: age checks (Nov 19, 2025) [link][agecheck]; age assurance (Aug 4, 2026) [link][assurance]; Kids & Select global (Jun 16, 2026) [link][kids-launch]; RDC 2026 [link][rdc26]; Parental controls [link][parents]; Community Standards [link][cs]
- Creator Docs: Kids & Select [link][kids-docs], Publishing [link][publish], Content maturity [link][maturity], Experience notifications [link][notif], Paid random items [link][pri], Rights Manager [link][rights], Discovery [link][disc], Creator Rewards [link][creator-rewards]
- DevForum: New Advertising Policies & Standards (Mar 20, 2026) [link][ad-policy]
- Press: Biometric Update (Jan 2026) [link][biometric]; Anadolu Agency explainer [link][aa]
- Legal trackers (unverified, updated Oct 2026): MDL Update [link][mdl]; ConsumerNotice [link][cn]

---

## 🤖 Train the Model

**What the model should learn:** give compliant, kid-safe advice for Roblox in 2026. That means knowing:
- age checks and chat bands,
- the Kids & Select gate and how to pass it,
- content maturity labels,
- paid-random-item rules,
- ad and notification rules for under-13s,
- IP risk.

It should separate Roblox's rules from the repo's stricter ethics. It should treat lawsuit figures as unverified unless primary. And it must never suggest workarounds (bypassing filters, sending kids off-platform, hiding odds).

**Dataset:** `08-roblox/train/safety.jsonl` (audit a feature, choose a maturity label, fix a non-compliant crate UI, explain what changed for devs in 2026, write PolicyService Luau).

**How to check it:** `08-roblox/train/safety.eval.jsonl`. A good answer:
- names the exact rule (odds before purchase, 100%, labelled button; 13+ for notifications; no rewarded ads under 13),
- knows Kids & Select requirements (questionnaire, 2FA, ID/face check, fee or subscription, 250 highly engaged plays in 60 days),
- flags IP risk,
- marks legal numbers [U].
