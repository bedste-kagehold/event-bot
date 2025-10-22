import { client } from '../client.js';
import fs from 'fs';

export async function broadcastMessage(guildId: string, channelId: string, message: string) {
    const channel = await client.channels.fetch(channelId);

    if (!channel) {
        console.error(`Channel with ID ${channelId} not found, removing from list.`);
        const channels = JSON.parse(fs.readFileSync('events/channels.json', 'utf-8')) as Record<string, string>;
        delete channels[guildId];
        fs.writeFileSync('events/channels.json', JSON.stringify(channels));
        return;
    }

    if (channel.isSendable()) {
        await channel.send(message);
    }
}
