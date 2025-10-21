import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

export const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and shows bot latency'),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ 
      content: 'Pinging...', 
      fetchReply: true 
    });
    
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    await interaction.editReply(
      `🏓 Pong!\n` +
      `📡 Latency: ${latency}ms\n` +
      `💓 API Latency: ${apiLatency}ms`
    );
  },
};
