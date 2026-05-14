package com.sams.offlinegrowth;

import org.bukkit.Chunk;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.world.ChunkLoadEvent;
import org.bukkit.event.world.ChunkUnloadEvent;
import org.bukkit.persistence.PersistentDataContainer;
import org.bukkit.persistence.PersistentDataType;

public final class ChunkGrowthListener implements Listener {

    private final OfflineGrowthPlugin plugin;

    public ChunkGrowthListener(OfflineGrowthPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onChunkLoad(ChunkLoadEvent event) {
        Chunk chunk = event.getChunk();
        PersistentDataContainer pdc = chunk.getPersistentDataContainer();
        Long lastLoadedMillis = pdc.get(plugin.getLastLoadedKey(), PersistentDataType.LONG);
        if (lastLoadedMillis == null) {
            return;
        }
        long elapsedMillis = System.currentTimeMillis() - lastLoadedMillis;
        if (elapsedMillis <= 0) {
            return;
        }
        long elapsedSeconds = elapsedMillis / 1000L;
        plugin.getCropGrower().advanceChunk(chunk, elapsedSeconds);
    }

    @EventHandler
    public void onChunkUnload(ChunkUnloadEvent event) {
        Chunk chunk = event.getChunk();
        PersistentDataContainer pdc = chunk.getPersistentDataContainer();
        pdc.set(plugin.getLastLoadedKey(), PersistentDataType.LONG, System.currentTimeMillis());
    }
}
