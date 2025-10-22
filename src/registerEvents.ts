import type { Client } from 'discord.js';
import path from 'path';
import fs from 'fs';

export function registerEvents(client: Client) {
    fs.readdirSync(path.join(import.meta.dirname, 'events')).forEach((file) => {
        if (!file.endsWith('Event.ts')) return;

        import(`./events/${file}`)
            .then((module: { default?: (client: Client) => void }) => {
                // Run module's default export with client
                if (typeof module.default === 'function') {
                    module.default(client);
                }
            })
            .catch((err) => {
                console.error(`Failed to load event from file ${file}:`, err);
            });
    });
}
