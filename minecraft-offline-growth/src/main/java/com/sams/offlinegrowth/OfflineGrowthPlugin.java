package com.sams.offlinegrowth;

import org.bukkit.NamespacedKey;
import org.bukkit.plugin.java.JavaPlugin;

public final class OfflineGrowthPlugin extends JavaPlugin {

    private NamespacedKey lastLoadedKey;
    private CropGrower cropGrower;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        lastLoadedKey = new NamespacedKey(this, "last_loaded");
        cropGrower = new CropGrower(this);
        getServer().getPluginManager().registerEvents(new ChunkGrowthListener(this), this);
        getLogger().info("OfflineGrowth enabled.");
    }

    @Override
    public void onDisable() {
        getLogger().info("OfflineGrowth disabled.");
    }

    public NamespacedKey getLastLoadedKey() {
        return lastLoadedKey;
    }

    public CropGrower getCropGrower() {
        return cropGrower;
    }
}
