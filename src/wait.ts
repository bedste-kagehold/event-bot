export function waitForMS(time: number) {
    if (time <= 0) return Promise.resolve();

    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

export async function waitForSeconds(time: number) {
    await waitForMS(time * 1000);
}
