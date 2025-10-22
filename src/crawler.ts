import { CronJob } from 'cron';
import idaCrawler from './crawlers/ida.js';

// Run every day at midnight
new CronJob('0 0 * * *', async () => {
    await idaCrawler();
});
await idaCrawler();
