import axios from 'axios';

interface FbEvent {
    id: string;
    name?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    place?: { name?: string; location?: { city?: string; country?: string } };
    // Facebook returns a variety of types; allow unknown for additional keys
    [key: string]: unknown;
}

/**
 * Crawl Facebook events for a list of pages (page names or IDs) using the Graph API.
 * Expects environment variables:
 *  - FB_ACCESS_TOKEN (optional): if not present, the crawler will log and exit gracefully
 *  - FB_PAGES (optional): comma-separated page names or ids
 */
export default async function fbCrawler() {
    const token = process.env.FB_ACCESS_TOKEN;
    const pagesEnv = process.env.FB_PAGES;

    if (!token) {
        console.log('FB crawler skipped: FB_ACCESS_TOKEN not set');
        return;
    }

    if (!pagesEnv) {
        console.log('FB crawler skipped: FB_PAGES not set');
        return;
    }

    const pages = pagesEnv
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
    if (pages.length === 0) {
        console.log('FB crawler skipped: no pages configured in FB_PAGES');
        return;
    }

    const fields = ['id', 'name', 'description', 'start_time', 'end_time', 'place'].join(',');

    for (const page of pages) {
        try {
            // Get upcoming events for the page
            const url = `https://graph.facebook.com/v17.0/${encodeURIComponent(page)}/events`;
            const res = await axios.get<{ data: FbEvent[] }>(url, {
                params: {
                    access_token: token,
                    fields,
                    since: Math.floor(Date.now() / 1000), // only future events
                },
            });

            const events = res.data?.data ?? [];
            console.log(`FB crawler: page=${page} found ${events.length} events`);

            for (const ev of events) {
                // Simple example filtering: skip events without start_time
                if (!ev.start_time) continue;

                // Here you'd transform the event into your app's event format and post or save it.
                // For now we just log a short summary.
                console.log(
                    `- [${ev.id}] ${ev.name ?? '<no title>'} @ ${ev.start_time} (${ev.place?.name ?? 'no place'})`,
                );
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                console.error(
                    `FB crawler: failed for page=${page} - status=${err.response.status} - ${JSON.stringify(err.response.data)}`,
                );
            } else if (err instanceof Error) {
                console.error(`FB crawler: failed for page=${page} -`, err.message);
            } else {
                console.error(`FB crawler: failed for page=${page} -`, err);
            }
        }
    }
}
