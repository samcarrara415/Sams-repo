# Performance and Mobile

> **What you'll learn:** why phone performance decides whether kids stay, the main performance budgets on Roblox (network, server CPU, client rendering, memory), and the techniques that let a game run smoothly on cheap phones, including how the starter kit runs hundreds of TD enemies.

Most Roblox players are on mobile (about 80% of DAU in 2024 [S]; see `01-platform-by-the-numbers.md` for the current figure). Many of those phones are cheap and old. If your game stutters, overheats or crashes on them, those players leave, and the algorithm sees short sessions.

---

## 1. The four budgets

| Budget | What eats it | Symptoms |
|---|---|---|
| **Network** | Replicating moving parts, frequent remotes, big payloads | Rubber-banding, delayed hits, high ping |
| **Server CPU** | Physics, Humanoids, per-frame loops over many objects | Server lag for everyone, slow waves |
| **Client rendering** | Part/mesh count, transparency, particles, lights, shadows, UI redraws | Low FPS, hot phone |
| **Memory** | Textures, meshes, sounds, leaked connections/instances | Crashes on low-end phones (often silent quits) |

Measure before optimising: **Developer Console** (F9) → Memory, Network, Server Stats, and the **MicroProfiler** (Ctrl+F6) for frame time. Always test on your **cheapest real phone**.

---

## 2. Big wins for tower defense

### Enemies as data, rendered by clients
The naive TD has each enemy as a Humanoid model moved by the server. With 200 enemies that means 200 physics bodies on the server, replicated to every client. Phones melt.

The starter kit does this instead:
- The server keeps `{ id, distance, hp }` per enemy and advances `distance += speed × dt`.
- The server sends a **compact snapshot ~10×/second** over an `UnreliableRemoteEvent` (parallel arrays of ids, distances, hp).
- Each client builds **its own** enemy models and moves them smoothly along the path (`EnemyRenderer.luau`).
- Targeting is math on distances and path positions, with no physics queries.

Result: server and network cost grow slowly with enemy count, and clients can reduce detail on low-end devices.

### Towers
- Anchored, non-colliding (`CanCollide = false`, `CanQuery`/`CanTouch` off unless needed).
- Check targets on each tower's cooldown, not every frame. Compare squared distances.
- Projectile visuals on the client (`TowerFired` event). Damage is decided instantly on the server.

---

## 3. General techniques

| Technique | How |
|---|---|
| **StreamingEnabled** | Clients load only nearby parts of big maps. Design for it (`WaitForChild`, models streaming in and out). |
| **Fewer, better meshes** | Merge static decoration in Blender; reuse the same mesh and texture many times |
| **Texture discipline** | 512² or smaller for most assets; a 1024² texture uses 4× the memory of 512² [P] (see `04-art/02-blender-to-roblox-pipeline.md`) |
| **RenderFidelity / LOD** | Automatic fidelity for distant meshes; low-poly versions for crowds |
| **Transparency and particles** | Overdraw is expensive on phones. Cap emit counts; few big particles beat many small ones. |
| **Lights and shadows** | Limit dynamic lights; turn off `CastShadow` on small or numerous parts |
| **Humanoids** | Expensive. Use `AnimationController` for non-player creatures. |
| **Remotes** | Batch updates; send numbers not instances; unreliable events for frequent position-like data |
| **Loops** | Event-driven over polling; one manager loop over many objects instead of a script per object |
| **Pooling** | Reuse projectiles/effects instead of creating and destroying them every shot |
| **Cleanup** | Disconnect connections, `Destroy()` what you're done with, clear per-player tables on leave |
| **UI** | Avoid rebuilding UI every frame; update text only when values change |

---

## 4. Mobile-specific checklist

- [ ] Tested on a real low-end phone, 10 minutes, worst-case wave
- [ ] No sustained FPS drops below ~30 in normal play
- [ ] Memory stable over a 20-minute session (no steady climb = no leaks)
- [ ] Loading screen appears instantly; first interaction within seconds
- [ ] UI fits safe areas (notches); buttons are thumb-sized (`04-art/04-ui-for-kids-on-phones.md`)
- [ ] Text readable at phone size; no tiny numbers
- [ ] Optional "Low graphics/effects" setting that reduces particles and decorations
- [ ] Touch controls for every action (no keyboard-only features)
- [ ] Battery/heat: no pointless per-frame work when idle (pause effects in menus)

---

## 5. Performance budget sheet (starting targets, tune per game)

| Item | Starting target |
|---|---|
| Enemies alive at once (TD, data-driven) | 150–300 |
| Particles alive at once | Low hundreds total, fewer on low graphics |
| Unique textures loaded | Keep small; reuse atlases/trim sheets |
| Remote events per client per second | Tens, not hundreds |
| Snapshot rate | ~10 Hz for positions (smoothed on the client) |

These are this academy's working targets, not Roblox limits. Measure your own game with the Developer Console and adjust.

---

## Exercise

1. Open the Developer Console on a phone during your busiest moment and write down memory, FPS and network numbers.
2. Find the top 3 costs with the MicroProfiler or Script Profiler. Fix one.
3. If your TD moves enemies with physics, port to the data + snapshot approach from the starter kit and compare the numbers.

---

## 🤖 Train the Model

**What the model should learn:**
- diagnose performance problems from symptoms and measurements
- recommend the highest-impact fixes first
- design data-driven entity systems for many enemies
- prioritise low-end phones

**Dataset:** `08-roblox/train/performance.jsonl`.

**Evals:** `08-roblox/train/performance.eval.jsonl`. Good answers:
- ask to measure first (Developer Console/MicroProfiler)
- move simulation off physics where possible
- mention testing on a cheap phone
