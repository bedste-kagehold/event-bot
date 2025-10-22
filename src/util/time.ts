export function seconds(s: number): number {
    return s * 1000;
}

export function minutes(m: number): number {
    return m * 60_000;
}

export function hours(h: number): number {
    return h * 3_600_000;
}

export function days(d: number): number {
    return d * 86_400_000;
}

export function months(m: number): number {
    return m * 30 * 86_400_000;
}
