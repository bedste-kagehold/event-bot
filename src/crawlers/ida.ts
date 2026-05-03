import axios from 'axios';
import { days, months } from '../util/time.js';
import { broadcastMessage } from '../util/broadcastMessage.js';
import { pricefilter } from '../util/pricefilter.js';
import { parseUsDateTime } from '../util/praseUSdateandtime.js';
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
        Content: { Values: string[] };
    };
}

export default async function idaCrawler() {
    const endSearchDate = new Date(Date.now() + months(2));
    const startSearchDate = new Date(Date.now());

    const res = await axios.post<{ TypedDocuments: TypedDocument[] }>(
        'https://api.cludo.com/api/v3/2677/12845/search',
        {
            ResponseType: 'Json',
            facets: {
                Category: ['Arrangementer'],
                City: ['København', 'Nordsjælland', 'ØvrigeSjælland'],
                RelevantFor: ['Studerende'],
                Status: ['Afholdes', 'Venteliste'],
                date: [
                    'StartDate_date',
                    `${startSearchDate.getFullYear()}`,
                    `${endSearchDate.getFullYear()}-${(endSearchDate.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}-${endSearchDate.getDate().toString().padStart(2, '0')}`,
                ],
            },
            perPage: 1000,
            page: 1,
            query: '*',
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
    if (!fs.existsSync('events/blacklistedEvents.json')) {
        fs.writeFileSync('events/blacklistedEvents.json', '{}');
    }

    const cachedEvents = JSON.parse(fs.readFileSync('events/cachedEvents.json', 'utf-8')) as Record<
        string,
        { eventId: string; expiresAt: number }[]
    >;
    const blacklistedEvents = JSON.parse(fs.readFileSync('events/blacklistedEvents.json', 'utf-8')) as Record<
        string,
        { titleIncludeds: string }[]
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
            if (
                blacklistedEvents[guildId]?.some((e) =>
                    doc.Fields.Title.Value.toLowerCase().includes(e.titleIncludeds.toLowerCase()),
                )
            ) {
                break;
            }

            let nomembershipprice = '';
            let membershipprice = 'Gratis';
            pricefilter(doc.Fields.Content.Values).forEach((entry) => {
                if (entry.label === 'Deltager, ikke medlem af IDA') {
                    nomembershipprice = entry.price;
                } else if (entry.label === 'Medlem' || entry.label === 'Studiemedlem') {
                    membershipprice = entry.price;
                }
            });
            const image =
                doc.Fields.Image?.Value && doc.Fields.Image.Value.trim() !== ''
                    ? doc.Fields.Image.Value
                    : 'https://ida.dk/media/10991/2205_ida_standardbillede_arrangementer_1200x630.jpg';

            await broadcastMessage(guildId, channelId, [
                doc.Fields.EventId.Value,
                doc.Fields.Url.Value,
                image,
                doc.Fields.Title.Value,
                doc.Fields.StartDate.Value,
                nomembershipprice,
                membershipprice,
            ]);

            const eventStart = parseUsDateTime(doc.Fields.StartDate.Value);
            const expiresAt = eventStart.getTime() - days(7);

            cachedEvents[guildId] = [
                ...(cachedEvents[guildId] || []),
                { eventId: doc.Fields.EventId.Value, expiresAt: Math.max(expiresAt, Date.now()) },
            ];
        }
    }

    fs.writeFileSync('events/cachedEvents.json', JSON.stringify(cachedEvents));
}
