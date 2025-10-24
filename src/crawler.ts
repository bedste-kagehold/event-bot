import { CronJob } from 'cron';
import idaCrawler from './crawlers/ida.js';
// import fbCrawler from './crawlers/fb.js';

async function runAllCrawlers() {
    //await Promise.allSettled([idaCrawler(), fbCrawler()]);
    await Promise.all([idaCrawler()]);
}

// Run every day at 13:30 Copenhagen time
new CronJob(
    '0 30 13 * * *',
    async () => {
        await runAllCrawlers();
    },
    null,
    true,
    'Europe/Copenhagen',
);
