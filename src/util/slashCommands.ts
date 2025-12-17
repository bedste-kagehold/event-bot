import { SlashCommandBuilder } from 'discord.js';
import { client } from '../client.js';
import { runAllCrawlers } from '../crawler.js';
import discordGui, { eventStore } from '../discordGui.js';
import fs from 'fs';

const runnow = new SlashCommandBuilder().setName('runnow').setDescription('runs all crawlers now');
const blacklistTitle = new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('blacklist events with specific words in the title')
    .addStringOption((option) =>
        option.setName('titleincludes').setDescription('words to blacklist (comma separated)').setRequired(true),
    );

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'blacklist') {
        const titleIncludes = interaction.options.getString('titleincludes', true);
        // Load existing blacklisted events
        const blacklistedEvents = JSON.parse(fs.readFileSync('events/blacklistedEvents.json', 'utf-8')) as Record<
            string,
            { titleIncludeds: string }[]
        >;
        const guildId = interaction.guild?.id;
        if (!guildId) {
            interaction.reply('This command can only be used in a server.').catch((err) => {
                console.error('Error replying to blacklist command:', err);
            });
            return;
        }
        if (!blacklistedEvents[guildId]) {
            blacklistedEvents[guildId] = [];
        }
        titleIncludes.split(',').forEach((title) => {
            blacklistedEvents[guildId]?.push({ titleIncludeds: title.trim() });
        });
        fs.writeFileSync('events/blacklistedEvents.json', JSON.stringify(blacklistedEvents, null, 2));
        interaction.reply(`Blacklisted events with titles including: ${titleIncludes}`).catch((err) => {
            console.error('Error replying to blacklist command:', err);
        });
    }
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'runnow') {
        interaction
            .reply('Running now')
            .then(() => {
                runAllCrawlers()
                    .then(() => {
                        console.log('Crawlers run successfully via /runnow command.');
                    })
                    .catch((err) => {
                        console.error('Error running crawlers:', err);
                    });
            })
            .catch((err) => {
                console.error('Error replying to /runnow command:', err);
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

export const commands = [runnow, blacklistTitle];
