import { Client, GatewayIntentBits, Collection } from 'discord.js';
import * as dotenv from 'dotenv';
import { readyHandler } from './events/ready';
import { interactionCreateHandler } from './events/interactionCreate';
import { pingCommand } from './commands/ping';

// Load environment variables from .env file
dotenv.config();

// Create a new Discord client instance with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Create a collection to store commands
client.commands = new Collection();

// Register commands
client.commands.set(pingCommand.data.name, pingCommand);

// Register event handlers
client.once('ready', readyHandler);
client.on('interactionCreate', interactionCreateHandler);

// Login to Discord with the bot token
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Error: DISCORD_TOKEN is not defined in the environment variables.');
  console.error('Please create a .env file with your bot token.');
  process.exit(1);
}

client.login(token).catch((error) => {
  console.error('Error logging in:', error);
  process.exit(1);
});
