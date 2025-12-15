import { ButtonBuilder } from 'discord.js';
import { ButtonStyle } from 'discord.js';
import { ContainerBuilder } from 'discord.js';
import { MediaGalleryBuilder } from 'discord.js';

export default function discordGui(
    eventlink: string,
    imagelink: string,
    eventname: string,
    eventtime: string,
    highprice: string,
    lowprice: string,
) {
    const eventime24h: string[] = eventtime.split(' ');
    console.log(eventime24h);
    // Convert MM/DD/YYYY to DD/MM/YYYY
    const dateParts = eventime24h[0]?.split('/') ?? [];
    const reformattedDate =
        dateParts.length === 3 ? `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}` : (eventime24h[0] ?? '');
    const eventime =
        reformattedDate +
        ' ' +
        (eventime24h[2] === 'PM'
            ? (parseInt(eventime24h[1]!.split(':')[0]!) + 12).toString() + ':' + eventime24h[1]!.split(':')[1]
            : eventime24h[1]);
    const buttonurl = new ButtonBuilder().setLabel('Event Link').setStyle(ButtonStyle.Link).setURL(eventlink);
    const kommer = new ButtonBuilder()
        .setCustomId('kommer')
        .setLabel('Kommer')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);
    const kommerikke = new ButtonBuilder()
        .setCustomId('kommerikke')
        .setLabel('Kommer ikke')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);
    const media = new MediaGalleryBuilder().addItems((mediaGalleryItem) =>
        mediaGalleryItem.setURL(imagelink).setDescription('Billede for ' + eventname),
    );
    let text = '';
    if (highprice != '') {
        text =
            'Dato: ' +
            eventime +
            '\nPriser: \n' +
            'Medlemspris: **' +
            lowprice +
            '** \nikke Medlem: **' +
            highprice +
            '**';
    } else {
        text = 'Dato: ' + eventime + '\nPriser: \n' + 'Medlemspris: **' + lowprice + '**';
    }
    const Container = new ContainerBuilder()
        .setAccentColor(0x0099ff)
        .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## ' + eventname))
        .addMediaGalleryComponents(media)
        .addTextDisplayComponents((textDisplay) => textDisplay.setContent(text))
        .addSeparatorComponents((separator) => separator)
        .addActionRowComponents((actionRow) => actionRow.setComponents(buttonurl, kommer, kommerikke));

    return Container;
}
