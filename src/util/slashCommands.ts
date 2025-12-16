import { SlashCommandBuilder } from 'discord.js';

const runnow = new SlashCommandBuilder().setName('runnow').setDescription('runs all crawlers now');

export const commands = [runnow];
