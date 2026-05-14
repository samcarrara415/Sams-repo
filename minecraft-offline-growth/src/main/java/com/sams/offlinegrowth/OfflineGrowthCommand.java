package com.sams.offlinegrowth;

import org.bukkit.ChatColor;
import org.bukkit.Chunk;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public final class OfflineGrowthCommand implements CommandExecutor {

    private final OfflineGrowthPlugin plugin;

    public OfflineGrowthCommand(OfflineGrowthPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ChatColor.YELLOW + "/og simulate <seconds>  - advance crops in your current chunk as if that many seconds had passed");
            sender.sendMessage(ChatColor.YELLOW + "/og status              - show plugin state");
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "simulate" -> {
                if (!(sender instanceof Player player)) {
                    sender.sendMessage(ChatColor.RED + "Run this as a player.");
                    return true;
                }
                if (args.length < 2) {
                    sender.sendMessage(ChatColor.RED + "Usage: /og simulate <seconds>");
                    return true;
                }
                long seconds;
                try {
                    seconds = Long.parseLong(args[1]);
                } catch (NumberFormatException ex) {
                    sender.sendMessage(ChatColor.RED + "Not a number: " + args[1]);
                    return true;
                }
                Chunk chunk = player.getLocation().getChunk();
                sender.sendMessage(ChatColor.GREEN + "Simulating " + seconds + "s of growth in chunk "
                        + chunk.getX() + "," + chunk.getZ() + "...");
                plugin.getCropGrower().advanceChunk(chunk, seconds);
                sender.sendMessage(ChatColor.GREEN + "Done. Check nearby crops.");
                return true;
            }
            case "status" -> {
                sender.sendMessage(ChatColor.AQUA + "OfflineGrowth status:");
                sender.sendMessage(ChatColor.GRAY + "  debug: " + plugin.getConfig().getBoolean("debug", false));
                sender.sendMessage(ChatColor.GRAY + "  max-elapsed-seconds: " + plugin.getConfig().getLong("max-elapsed-seconds", 0));
                var section = plugin.getConfig().getConfigurationSection("seconds-per-stage");
                if (section != null) {
                    for (String key : section.getKeys(false)) {
                        sender.sendMessage(ChatColor.GRAY + "  " + key + ": " + section.getLong(key) + "s/stage");
                    }
                }
                return true;
            }
            default -> {
                sender.sendMessage(ChatColor.RED + "Unknown subcommand: " + args[0]);
                return true;
            }
        }
    }
}
