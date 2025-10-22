import { CronJob } from 'cron';
import idaCrawler from './crawlers/ida.js';
import fbCrawler from './crawlers/fb.js';

async function runAllCrawlers() {
    await Promise.allSettled([idaCrawler(), fbCrawler()]);
}

// Run every day at 13:30 Copenhagen time
new CronJob(
    '30 13 * * *',
    async () => {
        await runAllCrawlers();
    },
    null,
    true,
    'Europe/Copenhagen',
);
