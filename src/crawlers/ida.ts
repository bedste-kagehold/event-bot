import axios from 'axios';
import { months } from '../util/time.js';

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
                Organizer: ['IDA Studieevents', 'DTU studieevents', 'København studieevents'],
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

    for (const doc of res.data.TypedDocuments) {
        if (doc.Fields.Description.Value.toLowerCase().includes('sushi')) {
            console.log('Found event with sushi:', doc.Fields.Url.Value);
        }
    }
}
