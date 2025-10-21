import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { pingCommand } from './commands/ping';

// Load environment variables
dotenv.config();

const commands = [
  pingCommand.data.toJSON(),
];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('Error: DISCORD_TOKEN and CLIENT_ID must be defined in .env file');
  process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // If GUILD_ID is provided, deploy to that guild (faster for testing)
    // Otherwise, deploy globally (takes up to 1 hour to propagate)
    if (guildId) {
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      ) as any[];

      console.log(`✅ Successfully reloaded ${data.length} guild (/) commands.`);
    } else {
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      ) as any[];

      console.log(`✅ Successfully reloaded ${data.length} global (/) commands.`);
      console.log('⏳ Note: Global commands may take up to 1 hour to update.');
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
    process.exit(1);
  }
})();
