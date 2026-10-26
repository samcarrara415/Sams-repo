# Art Direction That Sells

> **What you'll learn**
> - What "good art" means for a Roblox game played by kids on phones: **readable at a glance, consistent, and appealing**, not "detailed".
> - The tools that get you there: silhouette, shape language, value, colour, and one art bible.
> - Pass/fail tests (squint, phone-size, silhouette, grayscale) you can run on any asset in 2 minutes.

---

## 1. The one-line answer

**Good art = a kid on a cheap phone understands what they're looking at in under a second, and wants it.**

Everything else (polish, detail, lighting) only matters after that. Why it's the bar for us:

| Fact | Why it matters for art | Source |
|---|---|---|
| ~80% of Roblox daily users played on mobile in 2024; PC 17%, console 3% | Your art is judged on a 6-inch screen first | [S] [PocketGamer.biz on Roblox 2024 annual report](https://www.pocketgamer.biz/80-of-roblox-users-are-on-mobile-contributing-46-of-robux-revenue), data for 2024 |
| 39.7M daily users under 13 in Q2 2025 (up from 32.4M a year earlier) | Lots of young eyes. Simple, bold, friendly beats subtle | [S] [Statista citing Roblox](https://www.statista.com/statistics/1190309/daily-active-users-worldwide-roblox), Q2 2025 |
| Game icons can show as small as ~150×150 px | If it doesn't read tiny, it doesn't read | [P] [Roblox Creator Docs: Experience icons](https://create.roblox.com/docs/production/publishing/experience-icons), as of Oct 2026 |
| Detail pages (title, thumbnail, description) must be All Ages or 9+ | No gore, scary faces, or edgy art on your store page | [P] [DevForum staff announcement, 6 Nov 2024](https://devforum.roblox.com/t/updating-experience-guideline-policies-to-keep-our-younger-users-safe/3249079), enforced from 2025 |

---

## 2. Readability: the order the eye reads things

Valve's Team Fortress 2 team described **three levels of readability**: first **colour** (which team), then **silhouette** (which class), then **fine detail** (put on the chest, away from the edges). They also graded each character from **dark legs to a lighter torso** so the eye lands on the chest and weapon. [S] [Game Developer, 2008](https://www.gamedeveloper.com/art/in-depth-how-valve-makes-art-to-enhance-gameplay)

For a tower-defense game, the same order is:

1. **Value + colour** → "is that mine or an enemy? is it dangerous?"
2. **Silhouette** → "which tower / which enemy type?"
3. **Detail** → "which upgrade level / which skin?"

**Top-down cameras change the silhouette.** Blizzard said StarCraft II units were designed for a top-down, three-quarter view, with **bigger shapes and less detail**. [S] [Eurogamer interview with Samwise Didier, via Blizzplanet](https://www.blizzplanet.com/blog/comments/eurogamer_interviews_samwise_didier) Most TD cameras look down too, so **check silhouettes from your real game camera**, not from a front view in Blender.

**Big shapes beat many small ones.** Read order on a phone: big shape → medium shape → small shape. A good unit is roughly one big shape (body/head), a few medium (arms, weapon, hat), and few small (eyes, buttons). Small details that don't change the silhouette are noise at 150 px.

---

## 3. Shape language

| Shape | Reads as | Use for |
|---|---|---|
| **Circle / round** | friendly, safe, soft, cute | player units, pets, coins, "good" buttons |
| **Square / block** | solid, sturdy, reliable | tanks, walls, defensive towers, menus |
| **Triangle / spikes** | danger, speed, aggression | enemies, bosses, attack towers, warnings |

This isn't just art-school lore:
- People quickly prefer curved objects over sharp-angled ones; the authors proposed that sharp angles signal threat. [P] [Bar & Neta 2006, *Psychological Science* 17(8)](https://nmr.mgh.harvard.edu/publications/journal_articles/743) (peer-reviewed; the threat explanation is a hypothesis, not settled fact)
- A 2011 follow-up by Leder, Tinio & Bar reportedly found the curve preference held for neutral/positive objects but **not** for negative ones (razor blades, spiders). [U] (seen in secondary summaries; I did not read the paper) → so spiky = bad guys works with the brain, not against it.
- Related work on curvature preference: [Carbon 2010, *Acta Psychologica* 134](https://www.experimental-psychology.de/ccc/docs/pubs/Carbon2010b.pdf) [P].

**Rule for Sam's TD games:** your towers/units are **round-dominant**, enemies are **angular-dominant**, bosses are **big + angular + one bright weak spot**.

---

## 4. Colour that works for kids on phones

### 4.1 Value first, hue second
- **Value** (light vs dark) carries readability. Colour only decorates it. If the grayscale version doesn't read, no palette will save it (see the grayscale test, §9).
- Keep **paths/ground mid-value and low-saturation**, **units and enemies high contrast**, and **UI the most saturated thing on screen**. Backgrounds are quiet; gameplay is loud.

### 4.2 Saturation: bright, but not everywhere
- A review argues young children and adults both prefer highly saturated colours. [P] [Pitchford, Davis & Scerif 2011 (Oxford record)](https://www.psy.ox.ac.uk/publications/395589)
- An eye-tracking study of children aged 4–7 was more nuanced: appeal rose as saturation dropped **within a range**, then fell off; warm hues slightly dominated. [P] [Chen et al. 2023, *Frontiers in Psychology*](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10771309/)
- **Takeaway:** don't max out every colour. Use **a few** fully saturated accents on the things kids should look at (rare units, coins, the "Play" button), and slightly softer colours for everything else. Saturation is a budget.

### 4.3 Colour-blind safety
- Roblox says **over 5% of people** have some form of colour blindness and recommends pairing colours with symbols. [P] [Roblox Creator Docs: Accessibility](https://create.roblox.com/docs/production/publishing/accessibility), as of Oct 2026
- Colour vision deficiency affects up to **8% of men of Northern European descent** and **under 1% of women**. [P] [2025 review, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12385717/)
- So: **never use red vs green alone** for "enemy vs friendly" or "can't afford vs can afford". Add shape (✕ vs ✓), icon, outline, or value difference. Rarity needs a **frame shape or particle** too, not just colour.

### 4.4 A starting palette recipe (no magic numbers, just a method)
1. Pick **one hero hue** for your game (Grow-a-Garden-style green, candy pink, ocean teal…). It goes in the icon, logo and main button.
2. Pick **one enemy hue** far from it on the colour wheel (e.g. hero teal → enemy purple/red-orange).
3. Pick **neutral ground** colours: desaturated, mid-value versions of the hero hue.
4. Reserve **gold/yellow** for money and rewards only.
5. Reserve the **rarity ramp** for rarity only (see §7).
6. Write it in the art bible as swatches with hex codes. Use them everywhere, including UI.

---

## 5. Stylized beats realistic on Roblox (and on phones)

| Reason | Detail |
|---|---|
| **Performance** | Stylized art can use flat colours, small/shared textures and tint variants. Roblox notes a 1024×1024 texture uses **4× the memory** of a 512×512, and most images need at most 512×512. [P] [Roblox: Improve performance](https://create.roblox.com/docs/performance-optimization/improve), Oct 2026 |
| **Tint is free** | One SurfaceAppearance colour map can be reused with different tints; Roblox says tinting doesn't affect performance. [P] [SurfaceAppearance docs](https://create.roblox.com/docs/art/modeling/surface-appearance) → perfect for team colours and rarity skins |
| **Readability** | Exaggerated shapes and clean colour read at 150 px; photo-real noise doesn't |
| **Longevity** | Stylized games age slower than "realistic for 2026" |
| **Fits the platform** | Players' own avatars are stylized; realistic environments clash with them |
| **Fortnite's lesson** | Epic's art director said the look moved from drab, monotone environments to brighter, more colourful set pieces. [S] [Game Developer: Developing the art of Fortnite (GDC 2018)](https://gamedeveloper.com/art/video-developing-the-stylized-art-of-i-fortnite-i-). A third-party summary says hand-painted textures gave more character than simplified photo textures [U] [habrador blog](https://blog.habrador.com/2018/08/stylized-graphics-fortnite-sea-of-thieves.html) |

**Stylized ≠ low effort.** It means **deliberate simplification**: you decide what to keep.

---

## 6. Appeal: making units kids want to own

- **Baby schema** (big head, round face, big eyes, high forehead) makes faces read as cute and raises the urge to care for them; this was shown experimentally on real infant photos (n = 122 adults). [P] [Glocker et al. 2009, *Ethology* 115(3)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3260535/)
- For units/pets/towers that should feel **lovable**: head ≈ big share of body, big eyes set low on the face, short limbs, round silhouette.
- For units that should feel **cool**: keep the big head, but add **one** sharp accent (visor, horns, sword) and a confident pose.
- **Pose > model.** A dynamic idle (weight on one leg, chest out, weapon up) sells more than extra polygons. Every unit needs a **"hero pose"** for shop cards and thumbnails.
- **Expression.** Big readable emotions: happy, determined, scared, angry. Subtle expressions disappear at phone size.
- **Upgrade escalation (TD-specific).** Each tower level should change the **silhouette**, not just the colour: L1 small and plain → L2 adds a medium shape (barrel, shield) → L3 adds height/glow → max level gets an aura or particle. Kids should see "stronger" without reading a number.

---

## 7. VFX language

Riot's League of Legends VFX style guide put **gameplay clarity** and **less clutter** first, and tied **visual size to gameplay importance**: a basic attack shouldn't look as dramatic as an ultimate. [P] Riot, Oct 2017 (original Nexus URL now redirects to leagueoflegends.com; summary via search, Oct 2026)

Rules to copy:

| Rule | In practice |
|---|---|
| **Effect size = gameplay importance** | Basic shots: small, quick. Abilities: medium. Boss attacks / ultimates: big, slow wind-up |
| **Anticipation → impact → fade** | Telegraph danger (glow/charge), then a sharp hit frame, then quick fade so the screen clears |
| **Hit feedback** | Enemy flashes white for a frame or two, small knock/squash, damage number pops; never hide the enemy behind particles |
| **Rarity colour ramp** | Common grey → Uncommon green → Rare blue → Epic purple → Legendary gold/orange → Mythic red/pink. This ramp is an industry convention, not a rule [U]. Pair each with a **frame shape + particle level** for colour-blind players |
| **Friend vs foe** | Your effects in your hero hue; enemy effects in the enemy hue. Never swap |
| **Performance** | Roblox warns that overlapping semi-transparent objects force the engine to redraw pixels several times, and particle property changes can have a "dramatic" performance impact. [P] [Improve performance](https://create.roblox.com/docs/performance-optimization/improve) → fewer, bigger, shorter-lived particles |

---

## 8. UI art (short version; full lesson in 04-04)

- **Chunky** buttons: thick outline, a darker bottom edge ("lip") so they look pressable, rounded corners (friendly shape language).
- **Icons over text.** A coin, a sword, a gift box. One or two words max.
- UI uses the **same palette** as the world (hero hue for primary buttons, gold for money).
- One **font family** (bold, rounded) for the whole game.

---

## 9. "Is this art good?": pass/fail checklist

Run these on every unit, enemy, tower, icon and thumbnail. **Any FAIL = fix before shipping.**

| # | Test | How | PASS if… |
|---|---|---|---|
| 1 | **Squint test** | Squint (or blur 8–10 px in Photopea) | You can still find the main subject and tell it apart from the background |
| 2 | **Phone-size test** | View the in-game screenshot on your real phone at arm's length; icons at ~150 px | A kid could name it ("that's the ice tower") in 1 second |
| 3 | **Silhouette test** | Fill the asset solid black on white (Blender: Workbench → Flat + single colour; or screenshot + threshold) | Each unit/enemy is recognisable from its black shape alone, **from the game camera angle** |
| 4 | **Grayscale test** | Desaturate the screenshot | Friend vs enemy vs ground are still clearly different values |
| 5 | **Colour-blind test** | Use a deuteranopia/protanopia simulator (Photoshop View → Proof Setup, or a free web simulator) | Nothing important relies on red/green alone |
| 6 | **Line-up test** | Put all units side by side | Same style, same proportions, same outline/shading rules: they look like one game |
| 7 | **Busy-scene test** | Screenshot the worst wave (most enemies + effects) | You can still see the path, enemies and your towers |
| 8 | **Appeal test** | Show it to a kid (or 3) for 3 seconds, ask "do you want this one?" | They say yes or point at it without prompting |
| 9 | **Store-page test** | Detail-page art | All Ages / 9+ appropriate; matches the real game |

---

## 10. Study the hits: what to copy

> These are observations of the games' public art, **[U]** unless a source is given. Play each for 10 minutes and screenshot what you see.

| Game | What they do | Copy this |
|---|---|---|
| **Brawl Stars** (Supercell) | Huge heads, very distinct silhouettes from a top-down camera, each character a clear "pop-culture idea" | One clear idea per unit; check silhouettes from above. Supercell has given GDC talks on this; I saw only short previews [U], so watch them on [GDC Vault](https://gdcvault.com) |
| **Clash Royale / Clash of Clans** | Chunky proportions, bright team colours, very bold UI with thick outlines | Chunky UI, team colour on every unit |
| **Fortnite** | Stylized, saturated, cartoon deformation, bright set pieces [S] (see §5) | Exaggerate; brighten "drab" environments |
| **Pokémon** | Each creature = one strong idea + simple shape + 2–3 colours | Limit each unit to 2–3 main colours |
| **League of Legends / Riot** | Clarity rules for VFX and cosmetics (Riot job ads ask art directors to "drive clarity, readability, and emotional impact") [P] [Riot careers listing](https://www.riotgames.com/en/j/7459632) | VFX scale = gameplay importance |
| **Grow a Garden** (Roblox) | Very simple, bright, "studded" textures recalling old-school Roblox [S] [PCGamesN via Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden); peaked at 22.3M+ concurrent players on 23 Aug 2025 [S] (IGN / PocketGamer.biz via Wikipedia) | Proof that **clear and charming beats complex**. Simple art + strong loop + great updates |
| **Anime Vanguards / anime TD games** (Roblox) | Recognisable character archetypes, big rarity effects, flashy summon screens [U] | Rarity reveal as a VFX moment; units that look like "a character", not "a turret" |
| **Pet Simulator 99** (Roblox) | Round, cute pets; strong rarity tiers via colour, glow and "huge" variants [U] | Size + glow as rarity signals, not just colour |
| **Adopt Me!** (Roblox) | Soft pastel palette, baby-schema pets, very friendly UI [U] | Round everything for a younger audience |

**Don't copy their characters or logos.** Copy their *rules*.

---

## 11. One-page art bible template

Copy this into `vault/` for each game and keep it to **one page** (plus a reference board).

```text
GAME:                       ONE-LINE FANTASY: "Cute garden heroes defend against bug armies"
CAMERA: angle + distance the art is judged from (screenshot)

1. PILLARS (3 words):        e.g. Bright · Chunky · Friendly
2. PALETTE:                  hero hue | enemy hue | ground neutrals | gold (money only) | rarity ramp (6 swatches + frame shapes)
3. SHAPE LANGUAGE:           player side = round/square; enemies = triangles/spikes; bosses = big + angular + one weak spot
4. PROPORTIONS:              head:body ratio for units (e.g. 1:1.5), eye size rule, outline Y/N + thickness
5. MATERIALS/TEXTURES:       flat colour + gradient | hand-painted | trim sheet | PBR? Max texture size per asset class
6. LIGHTING/MOOD:            time of day, Lighting preset, fog, bloom limits
7. VFX:                      size-by-importance table, friend/foe colours, hit flash rule, particle budget
8. UI:                       font, button style (outline, lip, corner radius), icon style, number format
9. BUDGETS:                  triangles per unit/tower/prop, texture sizes, max particles per tower
10. DO / DON'T:              6 thumbnails of "yes" and 6 of "no"
11. REFERENCE BOARD:         link (PureRef/Miro/Figma)
```

---

## 12. Exercise (one sitting, ~45 min)

1. Screenshot your current game at the **worst wave** on your phone.
2. Run tests 1–5 from §9. Write PASS/FAIL for each.
3. Pick your 3 most-used towers and 3 most common enemies. Black-fill silhouettes from the game camera. Can you name each?
4. Write the **palette + shape language** lines of the art bible (§11, items 2–3).
5. Fix **one** FAIL today (usually: darken the ground, brighten enemies, or add an outline).

---

## 🤖 Train the Model

**What the model should learn:** to judge game art the way a mobile-first, kid-first art director does: readability before detail, silhouette/value/colour order, shape language, colour-blind safety, consistency via an art bible, and running concrete pass/fail tests. It should critique specific descriptions and give actionable fixes, not vague praise. It must not invent stats and should tag sources.

**Dataset:** `04-art/train/art-direction.jsonl` (explain, decide, critique, and plan tasks).

**How to check it:** `04-art/train/art-direction.eval.jsonl`. A good answer:
- names the readability order (value/colour → silhouette → detail) or uses the squint/silhouette/grayscale tests,
- gives a concrete fix (what to change, by how much, where),
- flags red/green-only signals as a colour-blind problem,
- keeps the store page All Ages / 9+,
- does not claim realistic art is better for Roblox mobile without trade-offs.
