export function parseUsDateTime(dateStr: string): Date {
    const [datePart, timePart, ampm] = dateStr.split(' ');
    const [month, day, year] = datePart!.split('/').map(Number);
    const [hour, minutes] = timePart!.split(':').map(Number);
    let hours = hour;

    if (ampm === 'PM' && hours !== 12) hours! += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return new Date(year!, month! - 1, day, hours, minutes);
}
