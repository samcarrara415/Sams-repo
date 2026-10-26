# Ethics and Law for Kids' Games

> **What you'll learn**
> - The rules that now apply to games kids play: COPPA (amended in 2025), FTC dark-pattern cases, UK and EU codes, loot box laws, US app store age laws, and what the 2025–2026 Roblox lawsuits changed.
> - A one-page **Kid-Safe Engagement Checklist** and a **red line** list.
> - Short version: **disclose odds, keep prices clear, no paid random items for kids where restricted, no fake urgency, no guilt popups, collect almost no data.** Do that and you are both on the safe side and building trust.

⚖️ **Not legal advice.** This is a developer's summary as of Oct 2026. Laws change, and details depend on where your players are. For anything with money on the line, ask a lawyer.

Tags: **[P]** primary (regulator, court, law text, the company), **[S]** secondary, **[U]** unverified.

---

## 1. United States

### COPPA and the 2025 amendments

COPPA covers personal info from **under-13s**. It applies if your game is child-directed, **or** if you have "actual knowledge" you're collecting from a child [P] ([FTC business blog, Jan 2025](https://www.ftc.gov/business-guidance/blog/2025/01/level-tips-businesses-ftcs-settlement-genshin-impact-developer-hoyoverse)).

The FTC finalised amendments on Jan 16 2025 [P] ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data)):

| Date | What | Tag |
|---|---|---|
| Apr 22 2025 | Published in the Federal Register | [S] [Securiti](https://securiti.ai/ftc-coppa-final-rule-amendments/) |
| Jun 23 2025 | Rule effective | [S] same |
| **Apr 22 2026** | **Compliance deadline for most obligations. It has passed and is now enforceable.** | [S] same; [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches) |

Key changes:
- **Separate parental consent** to share kids' data with third parties (e.g. for targeted ads) [P].
- **Data retention:** keep data only as long as needed, with a written retention policy in your privacy notice. Indefinite retention is not allowed [P]/[S].
- **Security program** for children's data [S].
- **"Personal information" now includes** biometric and government-ID identifiers [P].
- The FTC **did not** finalise limits on push notifications to kids [P].
- Feb 25 2026: an FTC policy statement limits COPPA enforcement for data collected **only for age verification**. You still have to comply in every other respect [S] ([Davis Polk](https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect)).

**For a Roblox dev:** Roblox handles accounts and parental consent. **You** are responsible for anything extra you collect: external analytics, Discord or email sign-ups, voice or photo uploads. The default should be: collect nothing personal.

### FTC v. Epic Games (Fortnite), Dec 19 2022: $520M

| Part | Amount | Why | Tag |
|---|---|---|---|
| COPPA penalty | **$275M** | Collected kids' data without parental consent. Voice and text chat **on by default** for kids and teens | [P] [FTC](https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations) |
| Refunds (dark patterns) | **$245M** | "Counterintuitive, inconsistent, and confusing button configuration" caused unwanted purchases. Kids could buy without card-holder action until 2018. Accounts locked after chargebacks | [P] same |

Refunds sent: >$72M in Dec 2024 [S] ([TechCrunch](https://techcrunch.com/2024/12/09/ftc-distributes-72m-to-fortnite-customers-tricked-into-making-unwanted-purchases)) and >$126M in Jun 2025. The FTC expected more payments in 2026 [P] ([FTC refunds page, Jul 2025](https://www.ftc.gov/enforcement/refunds/fortnite-refunds)).

**What it means for you:** purchase buttons must be unmistakable, with a confirm step. Never put "buy" where "play" or "close" usually is. Chat for kids is off or limited by default. Never punish a player for disputing a charge.

### FTC v. Cognosphere / HoYoverse (Genshin Impact), Jan 17 2025: $20M

Alleged: deceptive 5-star odds, confusing multi-step currency exchanges, marketing to kids, and COPPA violations. Proposed order: **no loot box sales to under-16s without parental consent**, disclose odds **and** currency exchange rates, offer a direct real-money price, and stop misrepresenting odds [P] ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental)). The order needed court approval, and I didn't confirm its entry.

### Other FTC actions since

- **Disney, $10M** (announced Sep 2 2025, court-approved Dec 2025): kids' YouTube videos not labelled "Made for Kids" [S] ([Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/court-approves-disneys-10-million-ftc-settlement-resolving-coppa-enforcement-action)).
- **Apitor** (Sep 2025): a toy-robot app whose third-party SDK collected kids' data. **Your SDKs are your responsibility** [P] ([FTC blog](https://www.ftc.gov/business-guidance/blog/2025/09/using-third-partys-software-your-app-make-sure-youre-all-complying-coppa)).
- **Roblox:** in May 2026 Fairplay and NCOSE asked the FTC to investigate Roblox games' "scarcity marketing", gambling-like mechanics and Robux pricing. Roblox "strongly disputes these claims" [S] ([News Tribune, May 22 2026](https://www.newstribune.com/news/2026/may/22/child-safety-groups-want-ftc-to-investigate-roblox/)). I found **no 2026 FTC game settlement** as of Oct 2026.

### State app store age laws

| State | Status (as of Oct 2026) | Tag |
|---|---|---|
| **Texas** (SB 2420) | Blocked by a district court in Dec 2025, then in effect after the 5th Circuit stayed that block (May 28 2026). Appeal continues | [S] [FPF, Jun 2026](https://fpf.org/blog/comparing-enacted-app-store-accountability-acts/) |
| **Utah** (SB 142, amended by HB 498) | Core duties **delayed to May 6 2027**. AG enforcement removed. Parents or minors can sue | [P] [HB 498 text](https://le.utah.gov/Session/2026/bills/enrolled/HB0498.pdf); [S] [FKKS](https://technologylaw.fkks.com/post/102mpap/utah-first-state-to-amend-its-app-store-accountability-act) |
| **Louisiana** | Enacted and amended in 2026. I didn't verify the effective date | [S] [FPF](https://fpf.org/blog/comparing-enacted-app-store-accountability-acts/) |
| **California** (AB 1043, Digital Age Assurance Act) | Signed Oct 13 2025, operative **Jan 1 2027**. The OS or app store sends an age bracket, and developers must request and respect it | [S] [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/california-introduces-new-age-verification-requirements-for-software-applications) |

Common thread: developers must **request age signals and use them** to adjust what minors see. On Roblox, the platform does this for you through account tiers and PolicyService. Your job is to **respect the signals** in your code.

### Lawsuits against Roblox (2025–2026) and what changed

- **State AG suits:** Louisiana (Aug 14 2025), Kentucky (Oct 7 2025), Texas (Nov 6 2025). They allege Roblox didn't protect kids from predators and misled parents about safety. Roblox disputes them [S] ([Massively OP](https://massivelyop.com/2025/10/09/roblox-faces-a-second-state-lawsuit-this-time-from-kentucky-over-alleged-child-safety/), [Texas Tribune](https://www.texastribune.org/2025/11/07/texas-roblox-lawsuit-ken-paxton/)).
- **More states, settlements, and a federal MDL** (N.D. Cal.) have been reported through 2026. Totals and counts vary between sources, so treat them as [U] ([ConsumerNotice](https://www.consumernotice.org/legal/roblox-lawsuit/)).

**What changed on the platform (all [P]):**
- **Age checks to chat**, required worldwide from Jan 2026 (facial age estimation or ID). Users can chat only with nearby age groups by default, and under-9s need parental consent ([Roblox, Jan 2026](https://about.roblox.com/newsroom/2026/01/roblox-age-checks-required-to-chat)).
- **Roblox Kids (5–8) and Roblox Select (9–15) accounts**, announced Apr 13 2026 and rolled out from June. Kids accounts see only Minimal/Mild games, Select up to Moderate, and only games that pass a **selection process**. Unverified users get limited access ([Roblox, Apr 2026](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts)).
- **To reach under-16s, developers need:** ID or face verification, two-step verification, the full maturity questionnaire, and either 2 months of Roblox Plus/Premium or a refundable 1,000 Robux fee. The game must then reach 250 plays from highly engaged age-checked users within 60 days and pass a safety review ([Kids & Select docs](https://create.roblox.com/docs/production/publishing/kids-and-select); full detail in `08-roblox/05-safety-policy-and-compliance.md`). **Sam: check this today, because it decides whether most of your audience can even see your game.**
- **Paid Random Items rules clarified** (May 26 2026). Odds must be shown for every outcome before purchase, as percentages summing to 100%. Luck boosts and pity must be disclosed numerically. Every outcome must give some value. Use `PolicyService` (`ArePaidRandomItemsRestricted`, `IsPaidItemTradingAllowed`) to gate users. Regulated markets named: Australia, Belgium, Netherlands, UK, Brazil. Violations can mean game removal and account suspension ([DevForum](https://devforum.roblox.com/t/clarifying-requirements-for-paid-random-items/4654622), [Creator Docs](https://create.roblox.com/docs/production/monetization/paid-random-items)).
- Age-check coverage: 57% of global DAU by end of Q2 2026 [P] ([Roblox 8-K](https://www.sec.gov/Archives/edgar/data/0001315098/000162828026051059/ex991-robloxq22026earnin.htm)).

---

## 2. United Kingdom

- **ICO Age Appropriate Design Code ("Children's Code").** In force since Sep 2 2020, with a conformance deadline of Sep 2 2021 [S] ([PrivacyLaws](https://www.privacylaws.com/news/icos-childrens-code-enters-into-force-2-september/)). It has 15 standards, including **high-privacy defaults**, **geolocation off**, and **no nudge techniques** that push kids to weaken privacy or hand over data [P] ([ICO code PDF](https://ico.org.uk/media/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf)). The ICO's 2023 games guidance encourages **positive nudges** (breaks, sensible purchases) and asks you to assess time-limited offers aimed at kids [S] ([BTO summary](https://bto.co.uk/blog/ico-publishes-guidance-for-games-designers-on-complying-with-childrens-code.aspx.html)).
- **Online Safety Act.** Ofcom's Protection of Children Codes took effect **Jul 25 2025** for user-to-user services (anything with chat or UGC). They require risk assessments, age assurance, safer defaults and reporting. Fines go up to £18M or 10% of global turnover [S] ([CMS](https://cms.law/en/gbr/legal-updates/online-safety-act-ofcom-publishes-children-s-online-safety-codes-and-risk-assessment-guidance), [Crowell](https://www.crowell.com/en/insights/client-alerts/children-first-how-ofcoms-childrens-code-and-age-checks-change-the-digital-game)). Roblox, as the platform, carries most of this. Your in-game chat or UGC features should still follow it.
- **Loot boxes:** no gambling ban. Instead, industry principles (Ukie, 2023): controls so under-18s can't buy loot boxes without parental consent, disclosure, and lenient refunds [S] ([CMS](https://cms.law/en/gbr/legal-updates/loot-boxes-11-new-principles-for-an-industry-led-approach)). Roblox restricted Paid Random Items for UK under-18s from Aug 13 2024 [P] ([DevForum](https://devforum.roblox.com/t/update-on-paid-random-items-restriction-for-uk-users-under-18/3072183)).

---

## 3. European Union

- **DSA Article 28 guidelines on minors** (adopted Jul 14 2025). They include age assurance, private-by-default accounts, **engagement features like streaks off by default**, and protecting minors from exploitative virtual currencies and loot boxes. Micro and small companies are mostly out of scope unless designated as a very large platform [S] ([IRIS Merlin](https://merlin.obs.coe.int/article/10383)). Roblox is the "platform" here, but the direction is clear.
- **CPC Network key principles on in-game virtual currencies** (Mar 2025, non-binding): show the **real-money price**, don't obscure costs, don't force currency you don't need, and account for vulnerable players such as kids. Issued alongside action against *Star Stable Online* [S] ([Bird & Bird](https://www.twobirds.com/en/insights/2025/european-move-towards-protecting-users-from-harmful-practices-in-video-games-eu-consumer-protection)).
- **Digital Fairness Act.** The Commission plans a proposal in **Q4 2026** covering dark patterns, addictive design and possibly virtual currencies and loot boxes. **Not yet proposed as of late Oct 2026; scope unconfirmed** [S] ([EP Legislative Train](https://www.europarl.europa.eu/legislative-train/theme-protecting-our-democracy-upholding-our-values/file-digital-fairness-act)). The European Parliament voted in Nov 2025 (483–92–86) for a resolution asking to ban paid loot boxes and similar randomised content in games likely accessed by minors [S] (reported by [VGTimes](https://vgtimes.com/articles/172316-eu-gaming-law-plans.html)). Treat the detail as [U] until you read the resolution text.

---

## 4. Loot box laws around the world

| Where | Rule | Tag |
|---|---|---|
| **Belgium** | The regulator has treated paid loot boxes as illegal gambling since 2018. Enforcement is weak: in a 2022 sample, 82% of the top 100 grossing iPhone games still had them | [P] [Xiao 2023](https://pure.itu.dk/en/publications/breaking-ban-belgiums-ineffective-gambling-law-regulation-of-vide/) |
| **Netherlands** | The Council of State (Mar 9 2022) overturned the €10M penalty on EA. FIFA packs were part of a game of skill, not a standalone game of chance | [P] [Raad van State](https://www.raadvanstate.nl/actueel/nieuws/@130150/202005769-1-a3/) |
| **Brazil** | Law 15.211/2025 ("ECA Digital"), effective **Mar 17 2026**. Art. 20 bans loot boxes in games aimed at or likely accessed by minors. Fines up to R$50M per violation. Unsettled whether free random mechanics are covered | [S] [Kasznar Leonardos](https://www.kasznarleonardos.com/en/brazil-enacts-the-eca-digital-a-landmark-law-for-childrens-rights-in-the-digital-age/), [Factotum](https://factotumcom.substack.com/p/brazil-digital-eca-bans-loot-boxes) |
| | Roblox: no Paid Random Items for Brazilian under-18s from Mar 17 2026, and for unverified adults from Mar 31 2026 | [U] [Bloxy News](https://x.com/Bloxy_News/status/2034153291899408514); Brazil is listed as regulated in Roblox's May 2026 post [P] |
| | Oct 15 2026: the Ministry of Justice asked the data authority to monitor games selling loot boxes without age checks (Counter-Strike 2 named, no breach found) | [U] [Pley.gg](https://pley.gg/cs2/brazil-asks-data-watchdog-to-monitor-cs2-loot-boxes-under-new-child-protection-law/) |
| **Australia** | From Sep 22 2024, new classifications: games with paid chance-based items get at least **M** (advisory, not recommended under 15). Simulated gambling gets **R18+** (legal restriction) | [P] [Classification Board](https://classification.gov.au/about-us/media-and-news/news/new-classifications-for-gambling-content-video-games) |
| | Roblox made Paid Random Items unavailable to Australian users from Sep 20 2024 | [P] [DevForum](https://devforum.roblox.com/t/update-on-paid-random-items-restriction-for-australian-users/3153602) |
| **China** | The first jurisdiction to legally require loot box **odds disclosure**. Compliance was uneven (only 5.5% showed odds on the purchase page itself) | [P] [Xiao et al.](https://openaccess.city.ac.uk/id/eprint/26508/) |
| | Since Sep 1 2021, under-18s may play online games only 8–9pm on Fri, Sat, Sun and holidays | [S] [Asia Financial](https://www.asiafinancial.com/china-cuts-amount-of-time-minors-can-spend-on-online-games) |
| | Dec 22 2023 draft rules would ban daily login and first-recharge rewards. Withdrawn or shelved status unclear | [S] [TechNode](https://technode.com/2023/12/22/draft-gaming-regulations-cause-sharp-fall-in-netease-and-tencent-share-prices/), [Fortune](https://fortune.com/asia/2024/01/03/beijing-reportedly-removes-official-video-game-draft-rules-tencent-netease-shares) |
| **South Korea** | Mandatory probability disclosure from **Mar 22 2024**, covering foreign companies too. 266 games were found in violation in early monitoring, 60% of them foreign | [S] [Vixio](https://www.vixio.com/insights/gc-south-korean-reforms-impose-loot-box-transparency-refunds), [Game World Observer](https://gameworldobserver.com/2024/07/08/266-games-violated-loot-box-rules-south-korea) |

---

## 5. Why ethics also wins

- Kids and parents notice. The FTC alleged Epic **locked accounts** over disputes, and the refunds went to hundreds of thousands of players.
- A 2026 University of Sydney review found 14 misleading, deceptive or unfair monetisation practices across 15 top-earning Roblox games [P] ([USyd](https://ses.library.usyd.edu.au/handle/2123/35033)). This is the kind of evidence that regulators and journalists use.
- The tactics that work long-term (friends, mastery, real surprises, the player's own creations) **don't need tricks**. See [01-how-big-studios-hook-players.md](01-how-big-studios-hook-players.md).

---

## 📋 Kid-Safe Engagement Checklist (one page)

**✅ DO**
- [ ] Show **odds as percentages** for anything random, even if it's free.
- [ ] Gate any Robux-bought random item with `PolicyService:GetPolicyInfoForPlayerAsync` → `ArePaidRandomItemsRestricted`, and give a non-random alternative.
- [ ] Show prices in **Robux, with no extra conversion layers**. If you have a gem currency, show what each item costs in Robux too.
- [ ] Put a **confirm step** on every purchase. Keep "Buy" away from "Play" and "Close".
- [ ] Use **honest timers**: a countdown is real, and the item returns later or has another route.
- [ ] **Streaks with grace:** freeze days and catch-up, and never reset to zero.
- [ ] Make the **free path finishable**: a free player can finish the season pass track.
- [ ] Gate **power by play**. Money buys cosmetics or time-savers, never wins.
- [ ] Use **positive nudges**: "Great session! Take a break?" after long play.
- [ ] Keep chat and UGC on Roblox's systems (TextChatService, filtering). Don't add your own unfiltered channels.
- [ ] Collect **no personal data** outside Roblox. Audit every third-party SDK or analytics tool.
- [ ] Post events and schedules **in advance**.
- [ ] Meet Roblox's Kids & Select requirements (verification, 2-step, questionnaire, Plus/Premium or the 1,000 Robux fee, 250 engaged plays, safety review) if kids are your audience.

**❌ DON'T**
- [ ] Hidden or vague odds ("rare!" with no %).
- [ ] Fake countdowns, fake "only 3 left", fake "was 1000, now 500".
- [ ] Guilt or parasocial popups ("Your pet is sad you left", "Don't abandon your team!").
- [ ] Pay-to-win, or paywalls placed at "almost won" moments.
- [ ] Nested currencies that hide the real price.
- [ ] Losing progress for missing a day.
- [ ] Pushing kids to share, invite or spend in exchange for rewards (pay or invite to unlock).
- [ ] Off-platform trading, gambling or "real money" claims.
- [ ] Targeted ads or data sharing about kids.

---

## 🚫 Red lines (never ship, no matter the numbers)

1. Paid random items **without** shown odds, or shown to restricted users.
2. Any countdown, stock count or "discount" that isn't true.
3. Interface tricks that cause accidental purchases.
4. Collecting kids' personal data (names, photos, voice, location, contact info) outside Roblox's systems.
5. Messages that guilt, shame or scare a child into playing or paying.
6. Simulated gambling (slots, roulette, coin-flip betting with currency bought with Robux).
7. Ways for adults to privately contact kids outside Roblox's chat rules.
8. Punishing a player (lock, wipe) because a parent disputed a charge.

---

## Exercise (one sitting)

1. Go through your game with the checklist and tick each box honestly.
2. For every ❌ you find, write the fix and the date you'll ship it.
3. In Studio, use the Player Emulator to test your game with `ArePaidRandomItemsRestricted = true` and check the alternative path works.

---

## 🤖 Train the Model

**What the model should learn:** know the main rules (COPPA 2025, FTC Epic/HoYoverse, UK, EU, loot box laws, Roblox Paid Random Items and age tiers) with dates and sources. Apply them to a concrete design. When asked to add a manipulative mechanic for kids, **say no to that version and give the effective kid-safe alternative**, explaining law, platform rules and player trust. Always note "not legal advice" for legal questions.

**Dataset:** `07-engagement-and-retention/train/ethics-law.jsonl`

**Check it with:** `07-engagement-and-retention/train/ethics-law.eval.jsonl`. A good answer:
- cites the correct rule and date (e.g. COPPA compliance deadline Apr 22 2026, Brazil Mar 17 2026),
- gives the PolicyService / odds-disclosure fix for Roblox,
- offers an alternative that still drives engagement,
- doesn't overclaim (flags unsettled points like Utah's dates or the Digital Fairness Act's scope).
