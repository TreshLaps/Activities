import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import { StackContainer, Dropdown } from '../../styles/styles';
import { addOrUpdateQueryString } from './Urls';

export type Filters = Map<string, string | number>;

interface ActivityFilterProps {
  isLoading?: boolean | undefined;
  onChange: (items: Filters) => void;
}

export const getUrlWithFilters = (url: string, items: Filters) => {
  if (items === undefined) {
    return url;
  }

  items.forEach((value, key) => {
    url = addOrUpdateQueryString(url, key, value.toString());
  });

  return url;
};

const defaultType = 'All';
const defaultDuration = 'LastMonths';
const defaultYear = new Date().getFullYear();

const updateBrowserUrl = (items: Filters) => {
  let url = `${window.location.origin}${window.location.pathname}`;

  items.forEach((value, key) => {
    if (
      (key === 'type' && value === defaultType)
      || (key === 'duration' && value === defaultDuration)
      || (key === 'year' && value === defaultYear)
    ) {
      return;
    }

    url = addOrUpdateQueryString(url, key, value.toString());
  });

  window.history.replaceState({}, '', url);
};

const ActivityFilter: React.FC<ActivityFilterProps> = (props) => {
  const { isLoading, onChange } = props;

  const { type, duration, year } = queryString.parse(window.location.search);
  const [typeFilter, setTypeFilter] = useState(typeof type === 'string' ? type : defaultType);
  const [durationFilter, setDurationFilter] = useState(typeof duration === 'string' ? duration : defaultDuration);
  const [yearFilter, setYearFilter] = useState(typeof year === 'string' ? parseInt(year, 10) : defaultYear);

  useEffect(() => {
    const items = new Map<string, string | number>();

    items.set('type', typeFilter);
    items.set('duration', durationFilter);

    if (durationFilter === 'Year') {
      items.set('year', yearFilter);
    }

    onChange(items);
    updateBrowserUrl(items);
  }, [typeFilter, durationFilter, yearFilter, onChange]);

  return (
    <StackContainer>
      <Dropdown
        disabled={isLoading}
        defaultValue={typeFilter}
        onChange={(v) => {
          setTypeFilter(v.currentTarget.value);
        }}
      >
        <option value="All">All activities</option>
        <option value="Run">Run</option>
        <option value="Ride">Ride</option>
        <option value="VirtualRide">VirtualRide</option>
        <option value="NordicSki">NordicSki</option>
      </Dropdown>
      <Dropdown
        disabled={isLoading}
        defaultValue={durationFilter}
        onChange={(v) => {
          setDurationFilter(v.currentTarget.value);
        }}
      >
        <option value="LastMonths">Last 20 weeks</option>
        <option value="LastYear">Last 12 months</option>
        <option value="Year">Year report</option>
      </Dropdown>
      {durationFilter === 'Year' && (
        <Dropdown
          disabled={isLoading}
          defaultValue={yearFilter}
          onChange={(v) => {
            setYearFilter(parseInt(v.currentTarget.value, 10));
          }}
        >
          {new Array(10).fill(0).map((_, index) => {
            const yearOption = new Date().getFullYear() - index;
            return (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            );
          })}
        </Dropdown>
      )}
    </StackContainer>
  );
};

export default ActivityFilter;
