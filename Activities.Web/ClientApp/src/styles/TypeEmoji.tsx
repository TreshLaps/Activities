// eslint-disable-next-line import/prefer-default-export
export const getActivityEmoji = (type: string) => {
  switch (type) {
    case 'Run':
      return '🏃‍♂️';
    case 'Ride':
    case 'VirtualRide':
      return '🚴‍♂️';
    case 'NordicSki':
      return '⛷';
    case 'Swim':
      return '🏊‍♂️';
    default:
      return '';
  }
};
