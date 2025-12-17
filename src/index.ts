import './envSchema.js';
import chalk from 'chalk';
import { Events } from 'discord.js';
import { registerEvents } from './registerEvents.js';
import { client } from './client.js';
import './crawler.js';
import { commands } from './util/slashCommands.js';

client.once(Events.ClientReady, (client) => {
    console.log(chalk.bold.greenBright(`Logged in as ${client.user.tag}`));
});

process.on('SIGINT', () => {
    console.log(chalk.bold.yellowBright('Shutting down...'));
    if (client.isReady())
        client.destroy().catch((err) => {
            console.error(chalk.bold.redBright('Error during shutdown:'), err);
        });
});

await client.login(process.env.DISCORD_TOKEN);

client.application?.commands.set(commands).catch((err) => {
    console.error('Failed to register slash commands:', err);
});

registerEvents(client);
