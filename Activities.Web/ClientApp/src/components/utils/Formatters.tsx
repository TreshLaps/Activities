
// frontend implementation of some Activities.Core.Extensions.MathExtensions functions.

const round = (value: number, decimals: number) => value.toFixed(decimals);

export const getMinPerKmString = (metersPerSecond: number) => {

    if (isNaN(metersPerSecond) || metersPerSecond == 0) {
        return '';
    }

    const averageSpeed = 1000 / metersPerSecond / 60;
    const averageSpeedMin = Math.floor(averageSpeed);
    const averageSpeedSeconds = Math.round(averageSpeed % 1 * 60);
    return `${averageSpeedMin}:${(averageSpeedSeconds < 10 ? "0" : "")}${averageSpeedSeconds} /km`;
};

export const getKmString = (distanceInMeters: number) => `${round(distanceInMeters / 1000, 1)} km`

export const getTimeString = (seconds: number) => {
    const totalSeconds = seconds % 60;
    const totalMinutes = Math.floor((seconds / 60) % 60) | 0;
    const totalHours = Math.floor(seconds / 60 / 60) | 0;

    if (totalHours > 0) {
        return `${totalHours}:${(totalMinutes < 10 ? "0" : "")}${totalMinutes}:${(totalSeconds < 10 ? "0" : "")}${totalSeconds}`;
    }

    return `${totalMinutes}:${(totalSeconds < 10 ? "0" : "")}${totalSeconds}`;
};

export const getDateString = (dateTimeString: string) => `${dateTimeString.substr(8, 2)}.${dateTimeString.substr(5, 2)}.${dateTimeString.substr(0, 4)}`;