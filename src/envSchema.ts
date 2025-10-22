import chalk from 'chalk';
import 'dotenv/config';
import Joi from 'joi';

const envSchema = Joi.object({
    DISCORD_TOKEN: Joi.string().required(),
    // Optional Facebook crawler configuration
    FB_ACCESS_TOKEN: Joi.string().optional(),
    // Comma-separated list of Facebook page names or IDs to crawl for events (e.g. "page1,page2")
    FB_PAGES: Joi.string().optional(),
});

const res = envSchema.validate(process.env, { allowUnknown: true });
if (res.error) {
    console.error(chalk.bold.redBright('\nThere was an error with the environment variables:\n'));
    for (const detail of res.error.details) {
        console.error(chalk.redBright(` - ${detail.message}`));
    }

    console.error(chalk.bold.redBright('\nPlease check .env and fix the issues.\n'));
    process.exit(1);
}
