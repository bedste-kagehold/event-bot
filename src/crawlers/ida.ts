import axios from 'axios';
import { days, months } from '../util/time.js';
import { broadcastMessage } from '../util/broadcastMessage.js';
import fs from 'fs';

interface TypedDocument {
    Fields: {
        Description: { Value: string };
        Url: { Value: string };
        EventId: { Value: string };
    };
}

export default async function idaCrawler() {
    const now = new Date(Date.now() + months(1));

    const res = await axios.post<{ TypedDocuments: TypedDocument[] }>(
        'https://api.cludo.com/api/v3/2677/12845/search',
        {
            ResponseType: 'Json',
            facets: {
                Category: ['Arrangementer'],
                City: ['Nordsjælland'],
                RelevantFor: ['Studerende'],
                Status: ['Afholdes', 'Venteliste'],
                date: [
                    'StartDate_date',
                    '2025-10-22',
                    `${now.getFullYear()}-${(now.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`,
                ],
            },
            query: 'sushi',
            sort: {
                StartDate_date: 'asc',
                DatePublished_date: 'asc',
            },
        },
        {
            headers: {
                Authorization: 'SiteKey MjY3NzoxMjg0NTpTZWFyY2hLZXk=',
            },
        },
    );

    const cachedEvents = JSON.parse(fs.readFileSync('events/cachedEvents.json', 'utf-8')) as Record<
        string,
        { eventId: string; expiresAt: number }[]
    >;

    // Expire old events
    for (const [guildId, events] of Object.entries(cachedEvents)) {
        cachedEvents[guildId] = events.filter((e) => e.expiresAt > Date.now());
        if (cachedEvents[guildId].length === 0) {
            delete cachedEvents[guildId];
        }
    }

    for (const doc of res.data.TypedDocuments) {
        for (const [guildId, channelId] of Object.entries(
            JSON.parse(fs.readFileSync('events/channels.json', 'utf-8')) as Record<string, string>,
        )) {
            if (cachedEvents[guildId]?.some((e) => e.eventId === doc.Fields.EventId.Value)) {
                continue;
            }

            await broadcastMessage(guildId, channelId, doc.Fields.Url.Value);

            cachedEvents[guildId] = [
                ...(cachedEvents[guildId] || []),
                { eventId: doc.Fields.EventId.Value, expiresAt: Date.now() + days(7) },
            ];
        }
    }

    fs.writeFileSync('events/cachedEvents.json', JSON.stringify(cachedEvents));
}
