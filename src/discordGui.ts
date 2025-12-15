import { ButtonBuilder } from 'discord.js';
import { ButtonStyle } from 'discord.js';
import { ContainerBuilder } from 'discord.js';
import { MediaGalleryBuilder } from 'discord.js';

type EventData = {
    eventLink: string;
    imageLink: string;
    eventName: string;
    eventTime: string;
    highPrice: string;
    lowPrice: string;
    attending: Set<string>;
    notAttending: Set<string>;
};
export const eventStore = new Map<string, EventData>();

export default function discordGui(
    eventid: string,
    eventlink: string,
    imagelink: string,
    eventname: string,
    eventtime: string,
    highprice: string,
    lowprice: string,
    attending: string[] = [],
    notAttending: string[] = [],
) {
    if (!eventStore.has(eventid)) {
        eventStore.set(eventid, {
            eventLink: eventlink,
            imageLink: imagelink,
            eventName: eventname,
            eventTime: eventtime,
            highPrice: highprice,
            lowPrice: lowprice,
            attending: new Set(attending),
            notAttending: new Set(notAttending),
        });
    }
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
        .setCustomId(`kommer_${eventid}`)
        .setLabel('Kommer')
        .setStyle(ButtonStyle.Success);

    const kommerikke = new ButtonBuilder()
        .setCustomId(`kommerikke_${eventid}`)
        .setLabel('Kommer ikke')
        .setStyle(ButtonStyle.Danger);
    const media = new MediaGalleryBuilder().addItems((mediaGalleryItem) =>
        mediaGalleryItem.setURL(imagelink).setDescription('Billede for ' + eventname),
    );
    let priceText = '';
    if (highprice != '') {
        priceText =
            'Dato: ' + eventime + '\nPriser: \n' + 'Medlem: **' + lowprice + '** \nikke Medlem: **' + highprice + '**';
    } else {
        priceText = 'Dato: ' + eventime + '\nPriser: \n' + 'Medlem: **' + lowprice + '**';
    }
    const attendingText = attending.length > 0 ? attending.join('\n') : '_Ingen endnu_';
    const notAttendingText = notAttending.length > 0 ? notAttending.join('\n') : '_Ingen endnu_';
    const Container = new ContainerBuilder()
        .setAccentColor(0x0099ff)
        .addTextDisplayComponents((t) => t.setContent(`## ${eventname}`))
        .addMediaGalleryComponents(media)
        .addTextDisplayComponents((t) => t.setContent(priceText))
        .addSeparatorComponents((s) => s)
        .addTextDisplayComponents((t) => t.setContent(`### ✅ Kommer\n${attendingText}`))
        .addTextDisplayComponents((t) => t.setContent(`### ❌ Kommer ikke\n${notAttendingText}`))
        .addSeparatorComponents((s) => s)
        .addActionRowComponents((row) => row.setComponents(buttonurl, kommer, kommerikke));

    return Container;
}
