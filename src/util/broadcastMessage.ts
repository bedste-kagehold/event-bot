import { client } from '../client.js';
import fs from 'fs';
import discordGui from '../discordGui.js';
import { MessageFlags } from 'discord.js';

export async function broadcastMessage(guildId: string, channelId: string, message: string[]) {
    console.log(message);
    console.log(`Broadcasting message to guild ${guildId} in channel ${channelId}`);

    const channel = await client.channels.fetch(channelId);

    if (!channel) {
        console.error(`Channel with ID ${channelId} not found, removing from list.`);
        const channels = JSON.parse(fs.readFileSync('events/channels.json', 'utf-8')) as Record<string, string>;
        delete channels[guildId];
        fs.writeFileSync('events/channels.json', JSON.stringify(channels));
        return;
    }

    if (channel.isSendable()) {
        console.log(`Sending message to guild ${guildId} in channel ${channelId}`);
        if (message.length !== 7) {
            console.error(
                `Invalid message format for guild ${guildId}, expected 7 elements but got ${message.length}.`,
            );
            return;
        }
        const Container = discordGui(
            message[0]!,
            message[1]!,
            message[2]!,
            message[3]!,
            message[4]!,
            message[5]!,
            message[6]!,
        );
        await channel.send({
            components: [Container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
