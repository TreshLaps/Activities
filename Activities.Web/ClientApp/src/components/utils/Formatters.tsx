// frontend implementation of some Activities.Core.Extensions.MathExtensions functions.

export const round = (value: number, decimals: number) =>
    value.toFixed(decimals);

export const getPaceString = (
    metersPerSecond: number,
    activityType: string,
    showSuffix: boolean = false
) => {
    if (Number.isNaN(metersPerSecond) || metersPerSecond === 0) {
        return '';
    }

    const isRowing = activityType === 'Rowing';
    const lapDistance = isRowing ? 500 : 1000;
    const suffix = isRowing ? ' /500m' : ' /km';

    const averageSpeed = Math.round(lapDistance / metersPerSecond);
    const averageSpeedMin = Math.floor(averageSpeed / 60);
    const averageSpeedSeconds = averageSpeed % 60;

    return `${averageSpeedMin}:${
        averageSpeedSeconds < 10 ? '0' : ''
    }${averageSpeedSeconds}${showSuffix ? suffix : ''}`;
};

export const getMetersPerSecond = (minPerKm: number) => {
    const averageSpeedMin = Math.floor(minPerKm);
    const averageSpeedSeconds = (minPerKm % 1) / 0.6;
    return 1000 / (averageSpeedMin + averageSpeedSeconds) / 60;
};

export const getKmString = (distanceInMeters: number, decimals: number = 1) =>
    `${round(distanceInMeters / 1000, decimals)} km`;

export const getTimeString = (seconds: number) => {
    const totalSeconds = Math.round(seconds % 60);
    const totalMinutes = Math.floor((seconds / 60) % 60) | 0;
    const totalHours = Math.floor(seconds / 60 / 60) | 0;

    if (totalHours > 0) {
        return `${totalHours}:${totalMinutes < 10 ? '0' : ''}${totalMinutes}:${
            totalSeconds < 10 ? '0' : ''
        }${totalSeconds}`;
    }

    return `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
};

export const getDateString = (dateTimeString: string) =>
    `${dateTimeString.substr(8, 2)}.${dateTimeString.substr(
        5,
        2
    )}.${dateTimeString.substr(0, 4)}`;

export const getUrlDateString = (date: Date) => {
    const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${
        date.getMonth() + 1
    }`;
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
    return `${date.getFullYear()}-${month}-${day}`;
};

export const getFeelingEmoji = (feeling: number) => {
    let emoji = '-';
    if (feeling === 3) {
        emoji = '😎'; // '😁';
    } else if (feeling === 2) {
        emoji = '🙂'; // '🙂';
    } else if (feeling === 1) {
        emoji = '🥵'; // '🥵';
    }
    return emoji;
};

export const getFeelingTitle = (feeling: number) => {
    let title = '-';
    if (feeling === 3) {
        title = 'Easy';
    } else if (feeling === 2) {
        title = 'Normal';
    } else if (feeling === 1) {
        title = 'Heavy';
    }
    return title;
};

export function AveragePace<T>(
    items: T[],
    durationFunc: (item: T) => number | null,
    paceFunc: (item: T) => number | null
) {
    let totalDuration = 0.0;
    let total = 0.0;

    items.forEach((item) => {
        const duration = durationFunc(item);
        const pace = paceFunc(item);

        if (duration && pace) {
            totalDuration += duration;
            total += pace * duration;
        }
    });

    if (totalDuration === 0.0) {
        return null;
    }

    return total / totalDuration;
}
