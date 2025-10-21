import { Client } from 'discord.js';

export function readyHandler(client: Client): void {
  console.log(`✅ Bot is ready! Logged in as ${client.user?.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
}
