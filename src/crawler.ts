import { CronJob } from 'cron';
import idaCrawler from './crawlers/ida.js';
import fbCrawler from './crawlers/fb.js';

async function runAllCrawlers() {
    await Promise.allSettled([idaCrawler(), fbCrawler()]);
}

// Run every day at midnight
new CronJob(
    '0 0 * * *',
    async () => {
        await runAllCrawlers();
    },
    null,
    true,
    'Europe/Copenhagen',
);
