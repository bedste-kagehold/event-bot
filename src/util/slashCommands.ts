import { SlashCommandBuilder } from 'discord.js';
import { client } from '../client.js';
import { runAllCrawlers } from '../crawler.js';
import discordGui, { eventStore } from '../discordGui.js';

const runnow = new SlashCommandBuilder().setName('runnow').setDescription('runs all crawlers now');

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

export const commands = [runnow];
