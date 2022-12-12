// eslint-disable-next-line import/prefer-default-export
export const getActivityEmoji = (type: string, isBislettInterval?: boolean, isTreadmillInterval?: boolean) => {
  switch (type) {
    case 'Run':
      if (isTreadmillInterval) {
        return '🐹';
      }

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
    default:
      return '';
  }
};

// eslint-disable-next-line import/prefer-default-export
export const getActivityTitle = (type: string, isBislettInterval?: boolean, isTreadmillInterval?: boolean) => {
  if (isTreadmillInterval) return 'Tredemølle';
  if (isBislettInterval) return 'Bislett';
  return type;
};
