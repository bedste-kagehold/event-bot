type PriceEntry = {
    label: string;
    price: string;
};

export function pricefilter(values: string[]): PriceEntry[] {
    const result: PriceEntry[] = [];

    const startIndex = values.indexOf('Priser');
    if (startIndex === -1) return result;

    for (let i = startIndex + 1; i < values.length; i++) {
        const value = values[i];
        const label = values[i - 1];

        if (
            typeof value === 'string' &&
            typeof label === 'string' &&
            /^\d+\s*kr\.$/.test(value) &&
            (label === 'Deltager, ikke medlem af IDA' || label === 'Medlem' || label === 'Studiemedlem')
        ) {
            result.push({
                label,
                price: value,
            });
        }
    }

    return result;
}
