export const getActivityEmoji = (
    type: string,
    isBislettInterval?: boolean
) => {
    switch (type) {
        case 'Run':
            if (isBislettInterval) {
                return '🅱️';
            }

            return '🏃‍♂️';
        case 'Ride':
        case 'VirtualRide':
            return '🚴‍♂️';
        case 'NordicSki':
            return '⛷';
        case 'Swim':
            return '🏊‍♂️';
        case 'Rowing':
            return '🚣‍♂️';
        default:
            return '';
    }
};
