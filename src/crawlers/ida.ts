import axios from 'axios';
import { days, months } from '../util/time.js';
import { broadcastMessage } from '../util/broadcastMessage.js';
import fs from 'fs';

interface TypedDocument {
    Fields: {
        Description: { Value: string };
        Url: { Value: string };
        EventId: { Value: string };
        Image: { Value: string };
        StartDate: { Value: string };
        Title: { Value: string };
        HighPrice: { Value: string };
        LowPrice: { Value: string };
    };
}

export default async function idaCrawler() {
    const endSearchDate = new Date(Date.now() + months(1));

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
                    `${endSearchDate.getDate().toString().padStart(2, '0')}`,
                    `${endSearchDate.getFullYear()}-${(endSearchDate.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}-${endSearchDate.getDate().toString().padStart(2, '0')}`,
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

    if (!fs.existsSync('events/cachedEvents.json')) {
        fs.writeFileSync('events/cachedEvents.json', '{}');
    }

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

            await broadcastMessage(guildId, channelId, [
                doc.Fields.Url.Value,
                doc.Fields.Image.Value,
                doc.Fields.Title.Value,
                doc.Fields.StartDate.Value,
                doc.Fields.HighPrice.Value,
                doc.Fields.LowPrice.Value,
            ]);

            cachedEvents[guildId] = [
                ...(cachedEvents[guildId] || []),
                { eventId: doc.Fields.EventId.Value, expiresAt: Date.now() + days(7) },
            ];
        }
    }

    fs.writeFileSync('events/cachedEvents.json', JSON.stringify(cachedEvents));
}
