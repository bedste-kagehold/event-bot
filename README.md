# Event Bot

A Discord bot built with Discord.js v14 and TypeScript for event management.

## Features

- TypeScript for type-safe code
- Discord.js v14 with slash commands support
- Modular command structure
- Event handler system
- Environment-based configuration

## Prerequisites

- Node.js 18.x or higher
- A Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Discord bot credentials:
   - `DISCORD_TOKEN`: Your bot token from Discord Developer Portal
   - `CLIENT_ID`: Your application's client ID
   - `GUILD_ID`: (Optional) Your test server ID for faster command deployment

4. **Deploy slash commands**
   
   Register your bot's slash commands with Discord:
   ```bash
   npm run deploy
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## Running the Bot

### Development mode (with hot-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

### Watch mode (auto-compile on changes)
```bash
npm run watch
```

## Project Structure

```
event-bot/
├── src/
│   ├── commands/          # Slash command definitions
│   │   └── ping.ts        # Example ping command
│   ├── events/            # Event handlers
│   │   ├── ready.ts       # Bot ready event
│   │   └── interactionCreate.ts  # Command interaction handler
│   ├── deploy-commands.ts # Script to register commands with Discord
│   ├── index.ts           # Main bot entry point
│   └── types.ts           # TypeScript type definitions
├── dist/                  # Compiled JavaScript (generated)
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Example environment variables
├── package.json           # Node.js dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Adding New Commands

1. Create a new file in `src/commands/` (e.g., `mycommand.ts`)
2. Define your command following the `Command` interface:
   ```typescript
   import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
   import { Command } from '../types';

   export const myCommand: Command = {
     data: new SlashCommandBuilder()
       .setName('mycommand')
       .setDescription('Description of my command'),
     
     async execute(interaction: ChatInputCommandInteraction): Promise<void> {
       await interaction.reply('Hello from my command!');
     },
   };
   ```
3. Import and register your command in `src/index.ts`:
   ```typescript
   import { myCommand } from './commands/mycommand';
   client.commands.set(myCommand.data.name, myCommand);
   ```
4. Add your command to `src/deploy-commands.ts`:
   ```typescript
   import { myCommand } from './commands/mycommand';
   const commands = [
     pingCommand.data.toJSON(),
     myCommand.data.toJSON(),
   ];
   ```
5. Deploy the updated commands:
   ```bash
   npm run deploy
   ```

## Available Commands

- `/ping` - Check bot latency and response time

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token for your `.env` file
5. Under "Privileged Gateway Intents", enable required intents if needed
6. Go to OAuth2 → URL Generator:
   - Select `bot` and `applications.commands` scopes
   - Select required bot permissions
   - Copy the generated URL and use it to invite the bot to your server

## License

ISC
