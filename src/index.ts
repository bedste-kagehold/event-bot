import './envSchema.js';
import chalk from 'chalk';
import { Events } from 'discord.js';
import { registerEvents } from './registerEvents.js';
import { client } from './client.js';
import './crawler.js';
import discordGui, { eventStore } from './discordGui.js';
import { commands } from './util/slashCommands.js';
import { runAllCrawlers } from './crawler.js';

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

client.on('interactionCreate', (interaction) => {
    if (!interaction.isButton()) return;

    const parts = interaction.customId.split('_');
    const eventId = parts[1];

    if (!eventId) {
        console.error('Button pressed without a valid event ID:', interaction.customId);
        return; // abort early
    }

    const event = eventStore.get(eventId);
    if (!event) {
        console.error('No event found for event ID:', eventId);
        return;
    }

    const userMention = `<@${interaction.user.id}>`;

    if (interaction.customId.startsWith('kommer')) {
        event.attending.add(userMention);
        event.notAttending.delete(userMention);
    }

    if (interaction.customId.startsWith('kommerikke')) {
        event.notAttending.add(userMention);
        event.attending.delete(userMention);
    }

    const updatedContainer = discordGui(
        interaction.message.id,
        event.eventLink,
        event.imageLink,
        event.eventName,
        event.eventTime,
        event.highPrice,
        event.lowPrice,
        [...event.attending],
        [...event.notAttending],
    );

    interaction
        .update({
            components: [updatedContainer],
        })
        .then(() => {
            console.log(`Updated attendance for event ${interaction.message.id}`);
        })
        .catch((err) => {
            console.error(`Failed to update attendance for event ${interaction.message.id}:`, err);
        });
});
client.application?.commands.set(commands).catch((err) => {
    console.error('Failed to register slash commands:', err);
});
client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'runnow') {
        interaction
            .reply('Running now')
            .then(() => {
                runAllCrawlers()
                    .then(() => {
                        console.log('Crawlers run successfully via /ping command.');
                    })
                    .catch((err) => {
                        console.error('Error running crawlers:', err);
                    });
            })
            .catch((err) => {
                console.error('Error replying to /ping command:', err);
            });
    }
});

registerEvents(client);
