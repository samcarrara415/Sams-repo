# Thumbnails, Icons & the Store Page

> **What you'll learn**
> - The icon and thumbnails are the art that decides whether a kid **ever plays**. Current Roblox specs and rules, verified Oct 2026.
> - How Roblox's **Thumbnail Personalization** testing works, how to run tests, and how to test icons when there's no official icon tester.
> - A production recipe (Blender + Krita/Photopea) and a checklist you can use for every update.

---

## 1. Why this is the #1 art for growth

A kid sees your **icon** (tiny, square) or a **thumbnail** (16:9 on Home) next to dozens of others. If it doesn't win that glance, your gameplay never gets a chance.

Roblox measures this as **play-through rate** (players who play after seeing your game) and, for thumbnails, **qualified play-through rate (QPTR)**: "the percentage of users that actively engage with your experience for a significant amount of time". [P] [Roblox: Thumbnails](https://create.roblox.com/docs/production/publishing/thumbnails), Oct 2026. So **clickbait that doesn't match the game loses**, because QPTR counts players who stay, not just clicks.

Roblox staff: "Misleading icons are destructive for retention." [P] [DevForum PSA: Best practices for game metadata, 10 Sep 2020](https://devforum.roblox.com/t/psa-best-practices-for-game-metadata/764558)

---

## 2. Current specs (all [P], Roblox Creator Docs, checked Oct 2026)

| Asset | Spec | Source |
|---|---|---|
| **Icon** | Square, **at least 512×512 px**; shown as small as **~150×150 px** in places; **one icon per locale**; must pass moderation | [Experience icons](https://create.roblox.com/docs/production/publishing/experience-icons) |
| **Thumbnail (image)** | **16:9**, ideally **1920×1080**; non-16:9 gets **stretched** | [Thumbnails](https://create.roblox.com/docs/production/publishing/thumbnails) |
| Thumbnail file types | .jpg, .gif, .png, .tga, .bmp | same |
| Thumbnails per game | up to **10 images or videos** on the detail page | same |
| Personalization uploads | **under 3 MB**, 1920×1080; **2–5** active for personalization | same |
| **Video thumbnails** | free, **3 uploads per month**; rejected videos still count; not shown on Xbox, PlayStation or VR | same |
| Video rules | real gameplay only; varied camera angles, minor post-processing, highlight edits, in-game UI text and catalog music OK. **No** fake/enhanced visuals, real-life footage, voice-over/narration/voice chat/**music with lyrics**, ads or subjective claims | same |
| Overlay text | sparingly, only to **describe gameplay**; no ads, promotions or subjective claims (Roblox's examples: "50% off", "Free UGC!") | same |
| Bottom edge | keep key text/elements **off the bottom**; player-count info can cover it | same |
| Maturity | everything on the detail page (thumbnail, title, description) must be **All Ages or 9+** | [P] [DevForum staff, 6 Nov 2024](https://devforum.roblox.com/t/updating-experience-guideline-policies-to-keep-our-younger-users-safe/3249079), enforced from 2025 |

---

## 3. Thumbnail Personalization: what Roblox reported

| Fact | Source |
|---|---|
| Starts when **2+ thumbnails are active**; with 1, everyone sees it | [P] [Thumbnails docs](https://create.roblox.com/docs/production/publishing/thumbnails), Oct 2026 |
| Shows each thumbnail to random users, then sends more impressions to the best one **per user group**, keeping a little traffic on the others | same |
| In Roblox's testing: **+8.5% average** QPTR; **some games +50%** | same |
| Roblox advises keeping **several thumbnails active** (trends change) and testing new ones **with major updates**, then holding until the next update | same |
| **Thumbnail Performance** table fills in after a few hours: impressions, qualified plays, average playtime, QPTR, winning segment | same |
| Since **1 Jul 2025**, starting a new test **keeps your current winner** on most traffic instead of resetting to an even split. Roblox measured **+0.19% QPTR** and **21% fewer impressions** on non-winners. Uploads stay capped at **5** | [P] [DevForum announcement, 1 Jul 2025](https://devforum.roblox.com/t/thumbnail-personalization-now-remembers-your-existing-winning-thumbnails/3793665) |
| Roblox: **"always include your highest QPTR existing thumbnail"** in a new test | same |

**Icons:** I found **no official icon A/B tool** as of Oct 2026. A DevForum feature request from Nov 2024 had no staff reply as of its last post (Jul 2026). [U] [DevForum: Icon A/B testing](https://devforum.roblox.com/t/icon-ab-testing/3274267). Use the manual method in §6.

---

## 4. What top icons do

> Pattern observations from top Roblox charts and common DevForum advice. **[U]**: no Roblox data shows *which* of these causes more clicks. Test them.

| Pattern | Why it likely works | How to do it |
|---|---|---|
| **One face, close-up** | Faces grab attention; the emotion tells you the vibe | Head + shoulders fill ~60–70% of the square |
| **Huge emotion** | Must read at 150 px | Wide-open mouth, big eyes, eyebrows up (excited) or "determined" |
| **1–3 elements max** | Small squares can't hold a scene | Character + one prop (the tower, a pet, a seed) + background |
| **Bright rim light** | Separates subject from background at tiny size | Strong back light in a contrasting colour (cyan/yellow rim on a purple background) |
| **Simple, saturated background** | Busy backgrounds turn to mush | Radial gradient or soft blurred game scene |
| **Thick outline / glow** | Silhouette pops on any Home-screen colour | 4–8 px outer stroke at 512 (judge by eye at 150 px) |
| **No small text** | Unreadable tiny; DevForum devs advise putting detail in thumbnails, not icons [U] [DevForum feedback thread](https://devforum.roblox.com/t/feedback-on-icon-for-my-game/3223338) | 0–2 big words, or none |
| **Recognisable "brand"** | Returning players find you again | Same mascot, palette and logo shape every update; swap *pose/props*, not identity |

A third-party article claims faces and close crops tend to win A/B tests. [U] [RoWatcher](https://rowatcher.com/news/the-roblox-thumbnail-is-a-conversion-ad-stop-designing-it-like-art). Treat it as a hypothesis to test.

### Thumbnails (16:9) are different
- They have room for **one moment of gameplay**: "your tower freezing a giant boss", "a huge rare pet hatch".
- Show **what the player does**, from the **real game** (Roblox's rule: accurate imagery).
- Each thumbnail tests **one idea**: (A) hero character close-up, (B) epic battle moment, (C) collection/rarity showcase, (D) new update feature.
- Keep the **bottom ~15%** free of anything important (my safety margin, not a Roblox number; Roblox only says "the bottom").

---

## 5. Titles, descriptions and update tags (for kids)

**Staff guidance** [P] [Metadata PSA, Sep 2020](https://devforum.roblox.com/t/psa-best-practices-for-game-metadata/764558):
- **Keep the title consistent.** "Excessively decorative or distracting titles can also be harmful for retention." Heavy emoji makes it hard to recognise a game you've played.
- **Description: the first sentence matters most.** It may show in search. Use real **keywords**, but don't stuff irrelevant words (can get demoted).
- Don't use the default icon; use a unique, relevant icon of at least 512×512.

**Writing for kids**
- Title: **2–4 easy words** naming the fantasy ("Garden Tower Defense", "Bug Battle TD"). No made-up spellings.
- First description line: **what you do + what's new**, ≤ 1 short sentence. E.g. "Plant towers, stop the bug army, collect 40+ heroes!" (only if you really have 40+).
- Then 3–5 short bullets with emoji as bullet points (✅ 🌱 🐞), a "NEW:" line for the update, and a safety-friendly tone.
- **No** "FREE ROBUX", "50% OFF", fake promises, or things not in the game (Roblox rules + kids feel tricked).

**Update tags.** e.g. `[🌱 UPDATE] Garden Tower Defense`
- This is a **community convention**, not a Roblox feature. I found **no official rule** on brackets/update tags (Oct 2026). [U] Staff only asked to keep titles consistent and not overly decorative. [P]
- Sam's rule: **base name never changes**; **one** short tag at the front, max **one emoji**, on during update week, removed after ~2 weeks or at the next update. Match the tag emoji to the icon change.
- Never "[🔥FREE🔥]"-style tags. That's a subjective/promo claim.

**Seasonal swaps** (Halloween, winter, summer)
- Change **outfit, props, background, lighting** on the mascot; keep **face, palette anchor and logo shape**.
- Upload seasonal thumbnails **alongside** your best evergreen one (Roblox: always include your best). Put the old icon back after the event and compare.

---

## 6. Testing process

### Thumbnails (official tool)
1. **Hypothesis:** "A close-up of the new boss beats a wide battle shot for new players."
2. Make **2–3 new thumbnails**, each changing **one** thing.
3. Activate them **plus your current best** (≤ 5 active).
4. Ship with a **major update** (Roblox's advice), then don't touch it until the next update.
5. Read the **Thumbnail Performance** table: QPTR first, then average playtime. Impressions tell you whether there's enough data. Roblox doesn't publish a minimum, so I'd wait for **at least one full weekday + weekend cycle** before deciding (my rule, not Roblox's).
6. Keep the winner(s) active; retire the clear losers; log results in `vault/thumbnail-tests.md`.

### Icons (manual, no official tool as of Oct 2026)
1. Note **play-through rate by source** in **Creator Dashboard → Analytics → Acquisition** for the 7 days before. [P] [Acquisition docs](https://create.roblox.com/docs/production/analytics/acquisition) (updated 23 Oct 2026)
2. Change **only the icon**: no update, no title change, no sponsored ads that week.
3. Compare the next 7 days, same weekdays. Look at **Home recommendations** and **Search** separately.
4. If the change is within normal day-to-day wobble, call it "no difference", not a win.
5. Caveat: before/after tests are confounded by trends, holidays and algorithm changes. Repeat a winner once before trusting it.

Analytics access needs enough traffic: per Roblox, games with **more than 10 DAU and 10 play hours for 7 consecutive days** can see all dashboard KPIs. [P] [Analytics dashboard docs](https://create.roblox.com/docs/production/analytics/analytics-dashboard) (seen via search summary, Oct 2026; re-check on the page).

---

## 7. How to make them: Blender + Krita/Photopea

### Render (Blender)
1. **Pose:** import your unit/mascot (or avatar) rig; push the pose further than in-game (head tilt, lean toward camera, open hand).
2. **Face:** biggest expression you can; eyes looking at the camera or at the "threat".
3. **Camera:** fairly long lens and close, so the face doesn't distort; frame for **both** 1:1 (icon) and 16:9 (thumbnail) by rendering big and cropping.
4. **Lighting:** key light (soft, warm), fill (weak), **strong rim** from behind in a contrasting colour. Optional: emission on eyes/weapon.
5. **Render:** EEVEE is fine. Enable **Film → Transparent** so you can composite. Render at 2× final (e.g. 3840×2160) and downscale.
6. Render **separate layers** (character, prop, effects) if you can; it makes variants fast.

### Composite (Krita / Photopea / Photoshop)
1. Background: radial gradient in your palette's hero hue, or a blurred in-game scene.
2. Character layer + **outer stroke** (layer style) + soft outer glow in the rim colour.
3. **Value pass:** darken the background edges (vignette), brighten the face. Do the squint test.
4. **Colour pass:** saturate the subject, not the background.
5. Text (thumbnail only, optional): 1–3 words, heavy rounded font, thick outline, top half of frame, **gameplay-descriptive only** (e.g. "NEW BOSS").
6. Export: icon **512×512+** PNG; thumbnail **1920×1080** PNG/JPG under **3 MB**.
7. **Preview at real size:** downscale a copy of the icon to **150 px and 100 px**, paste it into a screenshot of the Roblox Home screen next to top games. Does it win the glance?

**Fast option:** shoot the scene in Studio with a clean camera angle, then paint over in Krita. It's honest by default because it *is* the game.

---

## 8. Production checklist (every update)

- [ ] Icon ≥ 512×512, square, readable at **150 px and 100 px** (name it in 1 s).
- [ ] Icon: 1 face/subject, big emotion, ≤ 3 elements, no small text, rim light, outline.
- [ ] Thumbnails 1920×1080, 16:9, < 3 MB; nothing important on the bottom edge.
- [ ] Every image shows something **actually in the game** (Roblox rule + QPTR).
- [ ] No "free", "% off", "best game ever", Robux promises, or other subjective/promo text.
- [ ] All Ages / 9+: no gore, horror faces, weapons pointed at camera in a scary way.
- [ ] 2–5 thumbnails active, **including the current QPTR winner**.
- [ ] Title base name unchanged; update tag ≤ 1 emoji; tag removal date noted.
- [ ] Description line 1 = what you do + what's new, real keywords.
- [ ] Results logged in `vault/thumbnail-tests.md` (date, variants, QPTR, winner).
- [ ] Colour-blind check: subject doesn't rely on red/green contrast to pop.

---

## 9. Exercise (one sitting, ~90 min)

1. Screenshot the Roblox Home "tower defense" search results on your phone. List what the top 5 icons share.
2. Make **3 icon variants** of your game: (A) mascot face close-up, (B) mascot + tower, (C) boss face.
3. Shrink each to 150 px and 100 px and place them in that screenshot. Pick the one that reads best; write why.
4. Make **2 thumbnails** testing different ideas + keep your current best. Upload with your next update.
5. Set a reminder to read the Thumbnail Performance table after a week.

---

## 🤖 Train the Model

**What the model should learn:** to design, critique and test Roblox icons/thumbnails like a growth-minded artist: verified specs, honesty rules (accurate imagery, no promo text, All Ages/9+), readability at 150 px, one idea per image, how Thumbnail Personalization works (2–5 active, keep the winner), and a careful manual method for icons with caveats. It should rate a described thumbnail and give a concrete fix.

**Dataset:** `04-art/train/thumbnails.jsonl` (critique + fix, specs, test planning, titles/descriptions).

**How to check it:** `04-art/train/thumbnails.eval.jsonl`. A good answer:
- uses correct specs (icon ≥ 512², ~150 px display; thumbnail 16:9 1920×1080; < 3 MB; 2–5 active),
- rejects promo/subjective text and misleading imagery,
- gives a specific redesign (subject, emotion, element count, rim light, text),
- includes the current winner when testing and names QPTR as the metric,
- doesn't claim an official icon A/B tool exists.
