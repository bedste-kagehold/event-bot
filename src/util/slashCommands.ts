import { SlashCommandBuilder } from 'discord.js';
import { client } from '../client.js';
import { runAllCrawlers } from '../crawler.js';
import discordGui, { eventStore } from '../discordGui.js';
import fs from 'fs';

const runnow = new SlashCommandBuilder().setName('runnow').setDescription('runs all crawlers now');
const blacklistTitle = new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('blacklist modifie words for event titles blacklisting')
    .addStringOption((option) =>
        option
            .setName('titleincludes')
            .setDescription('words to add or remove from blacklist (comma separated)')
            .setRequired(true),
    );
const showblacklist = new SlashCommandBuilder()
    .setName('showblacklist')
    .setDescription('shows the current blacklist for this server');

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'blacklist') {
        const titleIncludes = interaction.options.getString('titleincludes', true);
        // Load existing blacklisted events
        let blacklistedEvents: Record<string, { titleIncludeds: string }[]>;
        try {
            const data = fs.readFileSync('events/blacklistedEvents.json', 'utf-8');
            blacklistedEvents = data ? (JSON.parse(data) as Record<string, { titleIncludeds: string }[]>) : {};
        } catch {
            blacklistedEvents = {};
        }
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
        const added: string[] = [];
        const removed: string[] = [];
        titleIncludes.split(',').forEach((title) => {
            const trimmedTitle = title.trim().toLowerCase();
            const existingIndex = blacklistedEvents[guildId]?.findIndex(
                (entry) => entry.titleIncludeds === trimmedTitle,
            );
            if (existingIndex !== -1) {
                blacklistedEvents[guildId]?.splice(existingIndex!, 1);
                removed.push(trimmedTitle);
            } else {
                blacklistedEvents[guildId]?.push({ titleIncludeds: trimmedTitle });
                added.push(trimmedTitle);
            }
        });
        fs.writeFileSync('events/blacklistedEvents.json', JSON.stringify(blacklistedEvents, null, 2));
        interaction
            .reply(
                `Added to blacklist: ${added.join(', ') || 'none'}\nRemoved from blacklist: ${removed.join(', ') || 'none'}`,
            )
            .catch((err) => {
                console.error('Error replying to blacklist command:', err);
            });
    }
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'showblacklist') {
        // Load existing blacklisted events
        let blacklistedEvents: Record<string, { titleIncludeds: string }[]>;
        try {
            const data = fs.readFileSync('events/blacklistedEvents.json', 'utf-8');
            blacklistedEvents = data ? (JSON.parse(data) as Record<string, { titleIncludeds: string }[]>) : {};
        } catch {
            blacklistedEvents = {};
        }
        const guildId = interaction.guild?.id;
        if (!guildId) {
            interaction.reply('This command can only be used in a server.').catch((err) => {
                console.error('Error replying to showblacklist command:', err);
            });
            return;
        }
        const blacklistForGuild = blacklistedEvents[guildId];
        if (!blacklistForGuild || blacklistForGuild.length === 0) {
            interaction.reply('No blacklisted titles for this server.').catch((err) => {
                console.error('Error replying to showblacklist command:', err);
            });
            return;
        }
        //const titles = blacklistForGuild.map((entry) => entry.titleIncludeds).join('\n');
        const titleslist = blacklistForGuild.map((entry) => entry.titleIncludeds);
        let titles = '';
        for (let i = 0; i < titleslist.length; i++) {
            titles += '#' + (i + 1) + ' ' + `"${titleslist[i]}"` + '\n';
        }
        interaction.reply(`Blacklisted titles for this server: \n ${titles}`).catch((err) => {
            console.error('Error replying to showblacklist command:', err);
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

export const commands = [runnow, blacklistTitle, showblacklist];
