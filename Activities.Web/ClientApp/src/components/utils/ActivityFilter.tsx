import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import { StackContainer, Dropdown } from '../../styles/styles';
import { addOrUpdateQueryString } from './Urls';

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
const defaultDataType = 'Activity';

const updateBrowserUrl = (items: Filters) => {
  let url = `${window.location.origin}${window.location.pathname}`;

  items.forEach((value, key) => {
    if (
      (key === 'type' && value === defaultType)
      || (key === 'duration' && value === defaultDuration)
      || (key === 'year' && value === defaultYear)
      || (key === 'dataType' && value === defaultDataType)
    ) {
      return;
    }

    url = addOrUpdateQueryString(url, key, value.toString());
  });

  window.history.replaceState({}, '', url);
};

export type Filters = Map<string, string | number>;

interface ActivityFilterProps {
  isLoading?: boolean | undefined;
  onChange: (items: Filters) => void;
  disableDataTypeFilter?: boolean | undefined;
}

const ActivityFilter: React.FC<ActivityFilterProps> = (props) => {
  const { isLoading, onChange, disableDataTypeFilter } = props;

  const {
    type, duration, year, dataType,
  } = queryString.parse(window.location.search);
  const [typeFilter, setTypeFilter] = useState(typeof type === 'string' ? type : defaultType);
  const [durationFilter, setDurationFilter] = useState(typeof duration === 'string' ? duration : defaultDuration);
  const [yearFilter, setYearFilter] = useState(typeof year === 'string' ? parseInt(year, 10) : defaultYear);
  const [dataTypeFilter, setDataTypeFilter] = useState(typeof dataType === 'string' ? dataType : defaultDataType);

  useEffect(() => {
    const items = new Map<string, string | number>();

    items.set('type', typeFilter);
    items.set('duration', durationFilter);

    if (durationFilter === 'Year') {
      items.set('year', yearFilter);
    }

    if (disableDataTypeFilter !== true) {
      items.set('dataType', dataTypeFilter);
    }

    onChange(items);
    updateBrowserUrl(items);
  }, [typeFilter, durationFilter, yearFilter, dataTypeFilter, onChange]);

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
        style={(durationFilter === 'Year' ? { marginRight: '5px' } : {})}
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
      {disableDataTypeFilter !== true && (
        <Dropdown
          disabled={isLoading}
          defaultValue={dataTypeFilter}
          onChange={(v) => {
            setDataTypeFilter(v.currentTarget.value);
          }}
        >
          <option value="Activity">Show activity data</option>
          <option value="Interval">Show interval data</option>
        </Dropdown>
      )}
    </StackContainer>
  );
};

export default ActivityFilter;
