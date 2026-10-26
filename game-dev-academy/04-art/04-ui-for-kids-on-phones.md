# UI for Kids on Phones

> **What you'll learn**
> - How to lay out a tower-defense HUD that kids can use with thumbs on a small phone: safe areas, thumb zones, touch sizes, icon-first design.
> - The Roblox APIs that make it work on every screen (ScreenInsets, UIScale, constraints, accessibility settings), verified Oct 2026.
> - Button "juice", number formatting, rarity colours, popups and notification dots that help kids and don't trick them.

---

## 1. Facts that shape the UI

| Fact | Source |
|---|---|
| ~**80%** of Roblox DAU played on mobile in 2024 | [S] [PocketGamer.biz on Roblox 2024 annual report](https://www.pocketgamer.biz/80-of-roblox-users-are-on-mobile-contributing-46-of-robux-revenue) |
| Apple: make controls at least **44×44 pt** so they can be tapped accurately | [P] [Apple: UI design dos and don'ts](https://developer.apple.com/design/tips/) (seen via search, Oct 2026; the HIG body didn't load for me) |
| Google/Android: touch targets at least **48×48 dp**; "larger is even better" | [P] [Android: Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps), Oct 2026 |
| 48 dp ≈ **9 mm** physically | [S] Material guidance as quoted in [W3C WCAG issue #1831](https://github.com/w3c/wcag/issues/1831) |
| Text contrast: **4.5:1** for small text (< 18 sp, or bold < 14 sp), **3:1** for other text | [P] [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/apps) |
| Over **5%** of people have some form of colour blindness; pair colours with symbols | [P] [Roblox: Accessibility](https://create.roblox.com/docs/production/publishing/accessibility), Oct 2026 |
| Roblox doesn't publish its own minimum button size (that I could find, Oct 2026) | Use Apple/Google as the **floor** |

**Kids add two more rules** (design judgment, not measured numbers): their taps are **less precise**, and many **can't read well yet or don't read English**. So: **bigger than the minimum, icons first, words second.**

---

## 2. Safe areas: don't let the notch or Roblox's buttons eat your UI

Roblox's `ScreenGui.ScreenInsets` [P] ([On-screen containers](https://create.roblox.com/docs/ui/on-screen-containers), [ScreenInsets enum](https://create.roblox.com/docs/reference/engine/enums/ScreenInsets), Oct 2026):

| Value | What it avoids | Use for |
|---|---|---|
| **CoreUISafeInsets** (default) | device cutouts **and** Roblox's top-bar buttons | **Anything you tap** or must read (HUD, buttons, prompts). Roblox recommends it for interactive UI |
| **DeviceSafeInsets** | notch/cutouts only, **not** the top bar | HUD meters that can sit beside the top bar (Roblox's HUD-meters tutorial uses it) |
| **TopbarSafeInsets** | the area within the top bar | small widgets that live *in* the top-bar strip |
| **None** | nothing | **backgrounds only**; Roblox warns UI may be hidden by notches |

- `ClipToDeviceSafeArea` defaults to **true** (ignored when ScreenInsets is None). [P]
- To place things yourself: `GuiService:GetInsetArea(Enum.ScreenInsets.X)` returns a `Rect`; `GuiService.TopbarInset` is the free space in the top bar. [P] [GuiService reference](https://create.roblox.com/docs/reference/engine/classes/GuiService)

**Default touch controls.** On phones Roblox puts a **thumbstick bottom-left** and **jump bottom-right** (open any game to see; sizes vary by device). Keep your buttons **out of those corners** unless you've disabled character movement during matches.

---

## 3. Thumb zones (landscape phone)

```text
┌──────────────────────────────────────────────────────────────┐
│ [Roblox top bar]          HARD to reach        [top bar]     │  ← info only (wave, cash). No frequent buttons
│                                                              │
│   OK reach               HARD (center =          OK reach    │  ← occasional buttons (shop, settings)
│                          the game view!)                     │
│                                                              │
│ [thumbstick]    EASY ─────────────────── EASY       [jump]   │  ← frequent actions (place tower, upgrade)
└──────────────────────────────────────────────────────────────┘
```

- **Frequent** actions (place, upgrade, speed up, start wave) → **bottom band and lower sides**, near where thumbs rest.
- **Info** (wave count, cash, base HP) → **top**, read-only.
- **Rare** actions (settings, codes, shop) → **top corners / side**, smaller.
- **Centre** is the battlefield. Panels that cover it must be quick to close.

---

## 4. Icon-first, kid-readable design

| Do | Don't |
|---|---|
| Icon + 1 word ("🪙 Sell", "⬆ Upgrade") | Sentences on buttons |
| Numbers big, words small | Paragraphs of rules; show a 3-second animated hint instead |
| Same icon for the same thing everywhere (coin = cash, always) | Two icons for one currency |
| Colour **plus** shape (green ⬆ arrow = upgrade, red 🪙 = sell) | Colour as the only signal |
| Rounded, bold font with an outline (`UIStroke`) | Thin, script or decorative fonts |
| Localize text (Roblox auto-translation + your own key strings) | Text baked into images |

**Fonts:** pick **one** heavy, rounded sans for the whole game (Roblox's font picker has several; check how it renders on device). Roblox advises testing that text is legible "at the smallest expected size" on real devices. [P] [Adaptive design](https://create.roblox.com/docs/production/publishing/adaptive-design)

**Text size and accessibility** [P] [Roblox: Accessibility](https://create.roblox.com/docs/production/publishing/accessibility):
- Players can set `GuiService.PreferredTextSize` (Medium default → Large → Larger → Largest).
- **`TextScaled` text is *not* scaled by PreferredTextSize.** For important labels, prefer fixed sizes + `AutomaticSize`/`TextWrapped`, or `TextScaled` with a `UITextSizeConstraint` so it never shrinks below a readable `MinTextSize`.
- Respect `GuiService.ReducedMotionEnabled` (snap or fade instead of bouncing) and `GuiService.PreferredTransparency` (multiply your BackgroundTransparency by it).

---

## 5. Numbers kids can read

Short numbers read faster: **1.2K, 3.4M, 5.6B**. Rules:
- 1 decimal max, drop trailing ".0" (5K not 5.0K).
- Below 1,000 show the full number.
- **Prices**: show exact numbers when it matters for "can I afford it?" (e.g. 1,250 vs 1,200). Show "1.2K" on HUD counters, but the shop button should never say "1.2K" if the real price is 1,250 and the player has 1,240.

```lua
-- Abbreviate numbers for HUD counters: 999 -> "999", 1250 -> "1.2K", 3400000 -> "3.4M"
local SUFFIXES = { "", "K", "M", "B", "T", "Qa" }

local function abbreviate(n: number): string
	local sign = if n < 0 then "-" else ""
	n = math.abs(n)
	if n < 1000 then
		return sign .. tostring(math.floor(n))
	end
	local i = 1
	while n >= 1000 and i < #SUFFIXES do
		n /= 1000
		i += 1
	end
	-- floor to 1 decimal so we never round UP past what the player has (1999 -> 1.9K, not 2K)
	local floored = math.floor(n * 10) / 10
	local text = if floored % 1 == 0 then string.format("%d", floored) else string.format("%.1f", floored)
	return sign .. text .. SUFFIXES[i]
end

-- Full number with commas for prices: 1250 -> "1,250"
local function commas(n: number): string
	local sign = if n < 0 then "-" else ""
	local s = tostring(math.floor(math.abs(n)))
	local out = s:reverse():gsub("(%d%d%d)", "%1,"):reverse()
	return sign .. (out:gsub("^,", ""))
end
```

---

## 6. Rarity colours (with a colour-blind backup)

| Rarity | Colour (convention [U]) | Backup signal |
|---|---|---|
| Common | grey | plain square frame |
| Uncommon | green | frame + 1 notch / star |
| Rare | blue | frame + 2 stars |
| Epic | purple | frame + 3 stars, soft glow |
| Legendary | gold/orange | ornate frame, animated shine |
| Mythic/Secret | red-pink or rainbow | unique frame shape, particles |

The colour ramp is a cross-game convention, not a rule. Use the **same ramp in UI, VFX and thumbnails** (see 04-01). Stars/frames make it work for colour-blind players.

---

## 7. Buttons: states and juice

**Every button has 4–5 states:**

| State | Look |
|---|---|
| Normal | full colour, thick outline, darker "lip" under it |
| Pressed | darker, shifts down 2–4 px or scales to ~0.92, lip hidden |
| Disabled / can't afford | grey + lock or red cost text **plus** an icon; still tappable to **explain why** ("Need 250 🪙") |
| Selected | outline glow or check mark |
| Attention | gentle pulse, only for the one thing to do next (tutorial) |

**Juice** = small, fast motion that says "you did it". Keep it short (~0.1–0.25 s) so tapping fast never feels laggy, and turn it off for reduced-motion players.

```lua
local TweenService = game:GetService("TweenService")
local GuiService = game:GetService("GuiService")

-- Adds a squash-and-bounce press effect to an ImageButton/TextButton that has a UIScale child.
local function addJuice(button: GuiButton)
	local scale = button:FindFirstChildOfClass("UIScale") or Instance.new("UIScale", button)
	local function tweenTo(target: number, time: number, style: Enum.EasingStyle)
		if GuiService.ReducedMotionEnabled then
			scale.Scale = 1 -- snap; no bouncing for reduced-motion players
			return
		end
		TweenService:Create(scale, TweenInfo.new(time, style, Enum.EasingDirection.Out), { Scale = target }):Play()
	end
	button.MouseButton1Down:Connect(function() tweenTo(0.92, 0.06, Enum.EasingStyle.Quad) end)
	button.MouseButton1Up:Connect(function() tweenTo(1, 0.18, Enum.EasingStyle.Back) end)
	button.MouseLeave:Connect(function() tweenTo(1, 0.12, Enum.EasingStyle.Quad) end)
end
```

Pair the visual with a short click sound and (on supported phones) light haptics. Roblox lists haptic feedback as a cross-platform feature. [P] [Cross-platform](https://create.roblox.com/docs/projects/cross-platform)

---

## 8. Notification dots and popups: helpful, not pushy

**Notification dots**
- Only for something **new the player can act on** (new unit to equip, quest reward ready).
- Disappear as soon as the player opens that screen.
- Max **one** level deep (dot on "Units" button → the new unit glows inside). No dots that never clear.

**Popups**
- **One at a time**, queued. Never stack 4 popups on join.
- **Never** during a wave. Show rewards *between* waves or after the match.
- Big, obvious **close ✕** (at least the touch minimum), top-right of the panel, plus tap-outside-to-close.
- No guilt-trip "No thanks, I like losing" buttons and no fake timers. That's against this repo's rules (see `CONTRIBUTING.md`) and kids notice.
- Offers belong in the shop; one gentle "New in shop!" dot is enough.

---

## 9. Making it fit every screen

[P] Roblox [Cross-platform](https://create.roblox.com/docs/projects/cross-platform) and [UI tutorial](https://create.roblox.com/docs/tutorials/curriculums/user-interface-design/implement-designs-in-studio), Oct 2026:
- Position with **Scale**, not pixels ("pixels can vary arbitrarily by both number and density across devices"); set `AnchorPoint` for each corner element.
- `UIAspectRatioConstraint` keeps square buttons square and bars the right shape on any screen.
- `ViewportDisplaySize` (Small = most phones/tablets, Medium, Large = TVs) and **Style Queries** like `@ViewportDisplaySizeSmall` / `@PreferredInputTouch` can swap sizes automatically.
- `UITextSizeConstraint` so text stays legible.

**One UIScale for the whole HUD** (simple and predictable):

```lua
-- Put a UIScale in your HUD ScreenGui's root Frame. Design the HUD at a reference size,
-- then scale it by the screen's short side, clamped so it never gets tiny or huge.
local REFERENCE_SHORT_SIDE = 400 -- tune: the short side you designed at, measured in Studio
local camera = workspace.CurrentCamera
local hudScale: UIScale = script.Parent:WaitForChild("Root"):WaitForChild("UIScale")

local function update()
	local v = camera.ViewportSize
	local shortSide = math.min(v.X, v.Y)
	hudScale.Scale = math.clamp(shortSide / REFERENCE_SHORT_SIDE, 0.8, 1.6)
end

camera:GetPropertyChangedSignal("ViewportSize"):Connect(update)
update()
```

The reference size and clamp values are starting points. Tune them in Device Simulator, don't trust them blindly.

### Testing on many screens
- **Device Simulator** (beta, Oct 2026): *File → Beta Features → New Device Simulator*, restart Studio. Phone devices are grouped **Flagship / Mid-range / Entry level**; **Physical size** display mode (after calibrating your monitor) shows real-world size. [P] [Device Simulator](https://create.roblox.com/docs/studio/device-simulator)
- Older/alternate flow: **Test → Device Emulator**, set **Actual Resolution**, and test at least one Phone, Tablet, Desktop and Console. [P] [UI tutorial](https://create.roblox.com/docs/tutorials/curriculums/user-interface-design/implement-designs-in-studio)
- **Must-test list:** smallest entry-level phone, a tall modern phone with a notch, a tablet (squarer screen), and **your real phone**. In Physical size mode, check every frequent button is at least ~9 mm across (the 48 dp floor), bigger for the main actions.

---

## 10. Reference layout: tower-defense HUD (landscape phone)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ≡ [Roblox]    🌊 Wave 7/30   ❤️ ███████░░ 70        🪙 1.2K   💎 35      │ TOP: info only (CoreUISafeInsets)
│                                                                          │
│                                                         ┌──────────┐     │
│                                                         │ ⏩ x2    │     │ RIGHT: speed toggle
│                    (battlefield: keep clear)            ├──────────┤     │
│                                                         │ ▶ START  │     │ RIGHT: start/skip wave (big, pulses only when idle)
│                                                         └──────────┘     │
│  ┌───────────────── selected tower panel (slides up) ─────────────────┐  │
│  │ 🧊 Frost L2   ⬆ UPGRADE 🪙250 (big, green)   🪙 SELL (small, red)  🎯 │  │ only when a tower is tapped
│  └────────────────────────────────────────────────────────────────────┘  │
│ (stick)  [🧊150] [🔥200] [⚡300] [🌱100] [💣450] [🔒]            (jump)  │ BOTTOM: tower hotbar, costs under icons
└──────────────────────────────────────────────────────────────────────────┘
```

Rules baked in:
- **Hotbar** bottom-centre: 5–6 slots, icon + cost; can't-afford slots grey out with the cost in red **and** a lock icon.
- **Upgrade** is the biggest button in the tower panel; **Sell** is smaller, separated and needs a second tap ("Sure? 🪙 +120") to avoid kid mis-taps.
- **Range circle** appears when placing or selecting, in your hero hue (enemy hue reserved for danger).
- **Wave/HP/cash** top-centre/top-right, inside CoreUISafeInsets, not under the Roblox buttons.
- If you disable character movement during matches, you can move the hotbar lower and bigger.

---

## 11. Exercise (one sitting, ~60 min)

1. Open your game in Device Simulator on an **entry-level phone** and a **tablet**. Screenshot both.
2. Mark every button: is it in a thumb-easy zone? Is it at least ~9 mm in Physical size mode?
3. Switch the HUD ScreenGui to **CoreUISafeInsets** if it isn't; add the UIScale script above.
4. Replace one text-only button with **icon + 1 word**; add the `addJuice` press effect.
5. Turn on **Reduced Motion** in Roblox settings and check nothing bounces.
6. Hand your phone to a kid (or a friend who's never played) and say only "play". Note where they tap first.

---

## 🤖 Train the Model

**What the model should learn:** to design and critique mobile Roblox UI for young players: safe areas (ScreenInsets), thumb zones, touch-size floors (44 pt / 48 dp), icon-first labels, readable numbers, rarity with colour-blind backups, honest popups/dots, accessibility settings, and multi-screen testing. It should produce working Luau when asked.

**Dataset:** `04-art/train/mobile-ui.jsonl` (layout critique, Luau, decide, debug, explain).

**How to check it:** `04-art/train/mobile-ui.eval.jsonl`. A good answer:
- uses CoreUISafeInsets for interactive UI and keeps buttons out of the default-control corners,
- cites 44 pt (Apple) / 48 dp (Google) as floors and says Roblox has no official minimum,
- never relies on colour alone,
- respects ReducedMotionEnabled / PreferredTextSize where relevant,
- rejects manipulative popups (fake timers, guilt-trip buttons, popups mid-wave).
