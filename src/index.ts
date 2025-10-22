import './envSchema.js';
import chalk from 'chalk';
import { Client, Events } from 'discord.js';
import { registerEvents } from './registerEvents.js';

const client = new Client({ intents: [] });

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

registerEvents(client);
