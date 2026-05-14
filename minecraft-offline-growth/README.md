# OfflineGrowth

A Paper plugin that advances crop growth when chunks reload, so crops keep
growing while no one is nearby (or while the server is offline).

## How it works

- On chunk **unload**: stores the current time on the chunk's
  `PersistentDataContainer`.
- On chunk **load**: reads the stored time, computes elapsed seconds, and
  advances every supported Ageable crop in the chunk by
  `elapsed / seconds-per-stage` growth stages (capped at the crop's max age).

Persists across server restarts because the timestamp lives in the chunk's
PDC, which is saved with the region file.

## Supported crops

`WHEAT`, `CARROTS`, `POTATOES`, `BEETROOTS`, `NETHER_WART`, `COCOA`,
`SWEET_BERRY_BUSH`, `MELON_STEM`, `PUMPKIN_STEM`.

Sugar cane, cactus, saplings, kelp, and bamboo are not supported — they
grow by spawning new blocks rather than incrementing an age, which needs
neighbor checks and is out of scope.

## Build

Requires JDK 25 (Paper 26.1.2 ships Java 25 bytecode) and Maven.

```
cd minecraft-offline-growth
mvn -q -DskipTests package
```

Output jar: `target/offline-growth-1.0.0.jar`. Drop it into your server's
`plugins/` folder and restart.

## Configuration

`plugins/OfflineGrowth/config.yml` is generated on first launch. Edit
`seconds-per-stage` per crop, or set a value to `0` to disable that crop.

## Compatibility

Built against `paper-api 26.1.2.build.63-stable` with `api-version: '26.1.2'`
in plugin.yml.
