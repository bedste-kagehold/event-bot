import { Events, type Client } from 'discord.js';

export default function registerGuildJoinEvent(client: Client) {
    client.on(Events.GuildCreate, (guild) => {
        console.log(`Joined guild: ${guild.name} (id: ${guild.id})`);
    });
}
