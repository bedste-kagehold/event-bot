import { Events, type Client } from 'discord.js';
import fs from 'fs';

export default function registerGuildJoinEvent(client: Client) {
    client.on(Events.GuildCreate, (guild) => {
        guild.channels
            .create({
                name: 'dtu-events',
            })
            .then((channel) => {
                const channels = JSON.parse(fs.readFileSync('events/channels.json', 'utf-8')) as Record<string, string>;
                fs.writeFileSync('events/channels.json', JSON.stringify({ ...channels, [guild.id]: channel.id }));
            })
            .catch((err) => {
                console.error(`Failed to create channel in guild ${guild.name} (id: ${guild.id}):`, err);
            });
    });
}
