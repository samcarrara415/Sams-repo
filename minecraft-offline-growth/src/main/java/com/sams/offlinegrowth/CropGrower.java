package com.sams.offlinegrowth;

import org.bukkit.Chunk;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.block.data.Ageable;
import org.bukkit.block.data.BlockData;

import java.util.EnumMap;
import java.util.Map;

public final class CropGrower {

    private final OfflineGrowthPlugin plugin;

    public CropGrower(OfflineGrowthPlugin plugin) {
        this.plugin = plugin;
    }

    public void advanceChunk(Chunk chunk, long elapsedSeconds) {
        long maxElapsed = plugin.getConfig().getLong("max-elapsed-seconds", 2_592_000L);
        if (maxElapsed > 0 && elapsedSeconds > maxElapsed) {
            elapsedSeconds = maxElapsed;
        }
        Map<Material, Long> secondsPerStage = loadSecondsPerStage();
        if (secondsPerStage.isEmpty()) {
            return;
        }

        final long elapsed = elapsedSeconds;
        plugin.getServer().getScheduler().runTask(plugin, () -> scan(chunk, elapsed, secondsPerStage));
    }

    private void scan(Chunk chunk, long elapsedSeconds, Map<Material, Long> secondsPerStage) {
        if (!chunk.isLoaded()) {
            return;
        }
        int minY = chunk.getWorld().getMinHeight();
        int maxY = chunk.getWorld().getMaxHeight();
        int advanced = 0;

        for (int x = 0; x < 16; x++) {
            for (int z = 0; z < 16; z++) {
                for (int y = minY; y < maxY; y++) {
                    Block block = chunk.getBlock(x, y, z);
                    Material type = block.getType();
                    Long secs = secondsPerStage.get(type);
                    if (secs == null || secs <= 0) {
                        continue;
                    }
                    BlockData data = block.getBlockData();
                    if (!(data instanceof Ageable ageable)) {
                        continue;
                    }
                    int currentAge = ageable.getAge();
                    int maxAge = ageable.getMaximumAge();
                    if (currentAge >= maxAge) {
                        continue;
                    }
                    long stages = elapsedSeconds / secs;
                    if (stages <= 0) {
                        continue;
                    }
                    int newAge = (int) Math.min(maxAge, currentAge + stages);
                    if (newAge == currentAge) {
                        continue;
                    }
                    ageable.setAge(newAge);
                    block.setBlockData(ageable, false);
                    advanced++;
                }
            }
        }

        if (advanced > 0 && plugin.getConfig().getBoolean("debug", false)) {
            plugin.getLogger().info("Advanced " + advanced + " crops in chunk "
                    + chunk.getX() + "," + chunk.getZ()
                    + " (" + chunk.getWorld().getName() + ") after "
                    + elapsedSeconds + "s offline.");
        }
    }

    private Map<Material, Long> loadSecondsPerStage() {
        Map<Material, Long> map = new EnumMap<>(Material.class);
        var section = plugin.getConfig().getConfigurationSection("seconds-per-stage");
        if (section == null) {
            return map;
        }
        for (String key : section.getKeys(false)) {
            Material material;
            try {
                material = Material.valueOf(key.toUpperCase());
            } catch (IllegalArgumentException ex) {
                plugin.getLogger().warning("Unknown material in seconds-per-stage: " + key);
                continue;
            }
            long secs = section.getLong(key);
            if (secs > 0) {
                map.put(material, secs);
            }
        }
        return map;
    }
}
