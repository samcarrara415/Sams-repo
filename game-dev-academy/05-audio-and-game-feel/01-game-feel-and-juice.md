# Game Feel, Juice and Audio

> **What you'll learn:** why two games with the same rules can feel completely different, the "juice" techniques that make actions feel satisfying (tweens, particles, shake, hit-stop, sound), and how to do audio on Roblox legally and well.

---

## 1. What "game feel" is

**Game feel** is how an action feels in your hands: the click, the bounce, the boom. Kids may not name it, but they feel it instantly. It's often the difference between "meh" and "one more round".

The classic demo is the talk *"Juice it or lose it"* (Jonasson & Purho, 2012). They took a plain Breakout clone and kept adding feedback: tweens, particles, shake, sound. Same rules, completely different experience.

**Rule:** every player action needs a reaction you can see **and** hear within about 100 ms.

---

## 2. The juice toolbox

| Technique | What it does | Roblox tool | Use it on |
|---|---|---|---|
| **Squash & stretch / pop** | Objects bounce when they change | `TweenService` with `EasingStyle.Back` / `Elastic`, `UIScale` | Buttons, placing towers, collecting coins |
| **Particles** | Bursts, sparks, dust, confetti | `ParticleEmitter` (`:Emit(n)`) | Hits, kills, level-ups, rare drops |
| **Screen shake** | Impact | Camera offset in `RenderStepped` (keep it small) | Explosions, boss stomps |
| **Hit-stop** | A tiny freeze on impact | Pause the attacker's animation for 0.03–0.08 s | Melee hits, crits |
| **Flash** | The target blinks white/red | `Highlight` instance or a quick colour tween | Damage taken |
| **Numbers** | Damage/coins fly up | `BillboardGui` + tween up and fade | Every hit, every reward |
| **Trails** | Motion lines | `Trail`, `Beam` | Projectiles, fast units |
| **Sound** | Confirms everything | `Sound` / audio API | Literally every action |
| **Anticipation** | Wind-up before a big action | Animation, scale-up | Boss attacks, so players can react |
| **Rarity reveal** | Build-up before a reward | Shake → glow in the rarity colour → burst | Summons, eggs, chests |

### Example: coin pickup that feels great

```lua
-- Client-side effect, after the server has already awarded the coin
local TweenService = game:GetService("TweenService")

local function coinPop(coin: BasePart, sound: Sound)
	sound:Play()
	coin.Anchored = true
	local up = TweenService:Create(coin, TweenInfo.new(0.25, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
		{ Position = coin.Position + Vector3.new(0, 3, 0), Size = coin.Size * 1.4 })
	local fade = TweenService:Create(coin, TweenInfo.new(0.15), { Transparency = 1, Size = coin.Size * 0.2 })
	up.Completed:Connect(function() fade:Play() end)
	fade.Completed:Connect(function() coin:Destroy() end)
	up:Play()
end
```

### Don't overdo it
- **Phones:** too many particles tank frame rate on cheap devices. Cap emit counts and use fewer, bigger particles.
- **Readability:** effects must never hide enemies, the path, or buttons.
- **Shake:** small and short. Add an option to turn it off (some players get motion-sick).
- **Rarity colours:** keep one system across the whole game (e.g. grey → green → blue → purple → gold → red/rainbow). See `04-art/01-art-direction-that-sells.md`.

---

## 3. Rarity reveals: the most important juice in collection games

Summons, eggs and chests are where kids feel the most excitement. A good reveal:

1. **Anticipation (0.5–1.5 s):** the egg wobbles, light leaks through cracks, the music builds.
2. **Hint:** the glow colour hints at the rarity (higher rarity = longer, bigger build-up).
3. **Payoff:** burst, the character's pose and name, the rarity banner, a sound sting.
4. **Skip button:** for repeat summons. Veterans don't want to watch 10 animations.
5. **Honesty:** no fake-out "near miss" animations that pretend you almost got a legendary. Near-miss tricks on paid random items are a manipulative pattern (see module 07).

---

## 4. Audio on Roblox

### What to use
- **Roblox's licensed audio library** in the Creator Store has music and sound effects that are cleared for use in Roblox experiences. It's the safest source of music.
- **Your own sounds:** recorded or made with free tools (Audacity, sfxr/jsfxr/Bfxr for retro effects).
- **Purchased sound packs:** check the licence allows use in games and uploading to Roblox.
- **Never upload copyrighted songs** you don't have rights to. Uploads can be moderated and your account can get strikes.

Roblox has rules on audio privacy and sharing, and a newer audio API (`AudioPlayer`, `AudioEmitter`, wires) alongside the classic `Sound` instance. Check the current Creator Docs for what's recommended now [U].

### Sound design checklist
- [ ] Every button has a click (short, soft, not annoying after 500 presses)
- [ ] Every reward has a "ding" that grows with value (coin → gem → rare)
- [ ] Hits have weight (layer a thump under the crack)
- [ ] Music changes with intensity (calm lobby → tense waves → boss theme → victory sting)
- [ ] Master, music and SFX volume sliders in settings
- [ ] No sounds that are painful on phone speakers (piercing highs, very long loud loops)
- [ ] Sounds play from the right place in 3D (parent them to the part), UI sounds in 2D (`SoundService`)

---

## 5. Animation basics for feel

- **Idle animations** make units feel alive. A tower that breathes or bobs reads as a character.
- **Attack anticipation + follow-through:** wind up, strike, settle. Even 3 keyframes make a big difference.
- **Personality:** a cute unit hops, a heavy unit stomps. Animation tells kids what a unit is like before they read anything.

Full rigging/animation pipeline: `04-art/02-blender-to-roblox-pipeline.md`.

---

## Exercise

1. Pick your game's most common action (placing a tower, collecting a coin). Add pop + sound + particles. Record before/after videos and watch them side by side.
2. Build a 3-stage rarity reveal for one summon/egg.
3. Play on your cheapest phone with 50 enemies on screen. If the frame rate drops, halve the particle counts.

---

## 🤖 Train the Model

**What the model should learn:**
- suggest specific, performant feedback for any player action
- write the Roblox tween/particle/sound code for it
- keep effects readable and honest (no fake near-misses)
- respect audio licensing

**Dataset:** `05-audio-and-game-feel/train/game-feel.jsonl`.

**Evals:** `05-audio-and-game-feel/train/game-feel.eval.jsonl`. Good answers:
- pair visual and audio feedback
- consider phone performance
- avoid copyrighted audio
- avoid near-miss manipulation
