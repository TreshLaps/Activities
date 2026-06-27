import { useEffect, useState } from 'react';
import DateRangePicker from './DateRangePicker';
import {
    StackContainer,
    Dropdown,
    Input,
    WarningLabel,
} from '../../styles/styles';
import { addOrUpdateQueryString } from './Urls';
import { getUrlDateString } from './Formatters';

export const getUrlWithFilters = (url: string, items: Filters | undefined) => {
    if (items === undefined) {
        return url;
    }

    items.forEach((value, key) => {
        url = addOrUpdateQueryString(url, key, value.toString());
    });

    return url;
};

// Since we send in the entire Filters object to useEffect() in various places,
// and React compares them by object identity, we need a way to deep-compare them
// to avoid unneccessary (or even infinite) refreshes. This is a kludge; the right
// thing to do is probably to destructure the Filter before giving it as an Effect
// dependency.
export const filtersChanged = (
    before: Filters | undefined,
    after: Filters | undefined,
) => {
    return getUrlWithFilters('/', before) !== getUrlWithFilters('/', after);
};

const defaultType = 'All';
const defaultDuration = 'LastMonths';
const defaultYear = new Date().getFullYear();
const defaultDataType = 'Activity';
const defaultGroupKey = 'Month';

const updateBrowserUrl = (items: Filters) => {
    let url = `${window.location.origin}${window.location.pathname}`;

    items.forEach((value, key) => {
        if (
            (key === 'type' && value === defaultType) ||
            (key === 'duration' && value === defaultDuration) ||
            (key === 'year' && value === defaultYear) ||
            (key === 'dataType' && value === defaultDataType)
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

interface Pace {
    medianPace: number | undefined;
    minPace: number | undefined;
    maxPace: number | undefined;
}

interface Estimates {
    medianPace: string;
    minPace: string;
    maxPace: string;
}

function ActivityFilter({
    isLoading,
    onChange,
    disableDataTypeFilter,
}: ActivityFilterProps) {
    const query: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
        query[key] = value;
    });
    const {
        type,
        duration,
        year,
        dataType,
        minPace,
        maxPace,
        startDate,
        endDate,
        groupKey,
    } = query;
    const [typeFilter, setTypeFilter] = useState(
        typeof type === 'string' ? type : defaultType,
    );
    const [durationFilter, setDurationFilter] = useState(
        typeof duration === 'string' ? duration : defaultDuration,
    );
    const [yearFilter, setYearFilter] = useState(
        typeof year === 'string' ? parseInt(year, 10) : defaultYear,
    );
    const [dataTypeFilter, setDataTypeFilter] = useState(
        typeof dataType === 'string' ? dataType : defaultDataType,
    );
    const [startDateFilter, setStartDateFilter] = useState<Date | null>(
        typeof startDate === 'string' ? new Date(startDate) : null,
    );
    const [endDateFilter, setEndDateFilter] = useState<Date | null>(
        typeof endDate === 'string' ? new Date(endDate) : null,
    );
    const [groupKeyFilter, setGroupKeyFilter] = useState(
        typeof groupKey === 'string' ? groupKey : defaultGroupKey,
    );
    const [paceFilter, setPaceFilter] = useState<Pace>({
        medianPace: undefined,
        minPace: typeof minPace === 'string' ? parseFloat(minPace) : undefined,
        maxPace: typeof maxPace === 'string' ? parseFloat(maxPace) : undefined,
    });

    const fetchThresholdValues = (filters: Filters) => {
        fetch(getUrlWithFilters('/api/threshold/estimate/', filters))
            .then((response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json() as Promise<Estimates>;
            })
            .then((data) => {
                setPaceFilter({
                    medianPace: parseFloat(data.medianPace.replace(':', '.')),
                    minPace: parseFloat(data.minPace.replace(':', '.')),
                    maxPace: parseFloat(data.maxPace.replace(':', '.')),
                });
            })
            .catch(() => {});
    };

    useEffect(() => {
        const items = new Map<string, string | number>();

        items.set('type', typeFilter);
        items.set('duration', durationFilter);

        if (durationFilter === 'Year') {
            items.set('year', yearFilter);
        }

        if (
            durationFilter === 'LastYear' ||
            durationFilter === 'Last3Years' ||
            durationFilter === 'Year'
        ) {
            items.set('groupKey', groupKeyFilter);
        }

        if (durationFilter === 'Custom') {
            if (!startDateFilter || !endDateFilter) {
                return;
            }

            // The backend assumes start > end (!), but we let the user specify any order
            // and just rewrite in the request.
            let startDateText = getUrlDateString(startDateFilter);
            let endDateText = getUrlDateString(endDateFilter);
            if (endDateText > startDateText) {
                [startDateText, endDateText] = [endDateText, startDateText];
            }
            items.set('startDate', startDateText);
            items.set('endDate', endDateText);
            items.set('groupKey', groupKeyFilter);
        }

        if (disableDataTypeFilter !== true) {
            items.set('dataType', dataTypeFilter);

            if (dataTypeFilter === 'Threshold') {
                if (paceFilter.minPace !== undefined) {
                    items.set('minPace', paceFilter.minPace);
                }
                if (paceFilter.maxPace !== undefined) {
                    items.set('maxPace', paceFilter.maxPace);
                }

                if (
                    paceFilter.minPace === undefined &&
                    paceFilter.maxPace === undefined
                ) {
                    fetchThresholdValues(items);
                    return;
                }
            }
        }

        onChange(items);
        updateBrowserUrl(items);
    }, [
        typeFilter,
        durationFilter,
        yearFilter,
        dataTypeFilter,
        paceFilter,
        startDateFilter,
        endDateFilter,
        groupKeyFilter,
        onChange,
        disableDataTypeFilter,
    ]);

    return (
        <StackContainer style={{ position: 'relative', zIndex: 100 }}>
            <Dropdown
                disabled={isLoading}
                defaultValue={typeFilter}
                onChange={(v: React.ChangeEvent<HTMLSelectElement>) => {
                    setTypeFilter(v.currentTarget.value);
                }}
            >
                <option value="All">All activities</option>
                <option value="Run">Run</option>
                <option value="Ride">Ride</option>
                <option value="VirtualRide">VirtualRide</option>
                <option value="NordicSki">NordicSki</option>
                <option value="Swim">Swim</option>
                <option value="Rowing">Rowing</option>
            </Dropdown>
            <Dropdown
                disabled={isLoading}
                defaultValue={durationFilter}
                onChange={(v: React.ChangeEvent<HTMLSelectElement>) => {
                    setDurationFilter(v.currentTarget.value);
                }}
                style={durationFilter === 'Year' ? { marginRight: '5px' } : {}}
            >
                <option value="LastMonths">Last 20 weeks</option>
                <option value="LastYear">Last 12 months</option>
                <option value="Last3Years">Last 3 years</option>
                <option value="Year">Single year</option>
                <option value="Custom">Custom range</option>
            </Dropdown>
            {durationFilter === 'Year' && (
                <Dropdown
                    disabled={isLoading}
                    defaultValue={yearFilter}
                    onChange={(v: React.ChangeEvent<HTMLSelectElement>) => {
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
            {durationFilter === 'Custom' && (
                <DateRangePicker
                    startDate={startDateFilter}
                    endDate={endDateFilter}
                    onChange={(start, end) => {
                        setStartDateFilter(start);
                        setEndDateFilter(end);
                    }}
                    isLoading={isLoading}
                />
            )}
            {(durationFilter === 'Year' ||
                durationFilter === 'Custom' ||
                durationFilter === 'LastYear' ||
                durationFilter === 'Last3Years') && (
                <Dropdown
                    disabled={isLoading}
                    defaultValue={groupKeyFilter}
                    onChange={(v: React.ChangeEvent<HTMLSelectElement>) => {
                        setGroupKeyFilter(v.currentTarget.value);
                    }}
                >
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Quarter">Quarter</option>
                </Dropdown>
            )}
            {disableDataTypeFilter !== true && (
                <>
                    <Dropdown
                        disabled={isLoading}
                        defaultValue={dataTypeFilter}
                        onChange={(v: React.ChangeEvent<HTMLSelectElement>) => {
                            setDataTypeFilter(v.currentTarget.value);
                        }}
                        style={
                            dataTypeFilter === 'Threshold'
                                ? { marginRight: '5px' }
                                : {}
                        }
                    >
                        <option value="Activity">Show activity data</option>
                        <option value="Interval">Show interval data</option>
                        <option value="Threshold">Show threshold data</option>
                    </Dropdown>
                    {dataTypeFilter === 'Threshold' && (
                        <>
                            <Input
                                type="number"
                                style={{ width: '80px', marginRight: '5px' }}
                                step="0.1"
                                placeholder="4.30"
                                value={paceFilter.minPace}
                                onChange={(
                                    v: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    const pace =
                                        v.currentTarget.value.length > 0
                                            ? parseFloat(
                                                  v.currentTarget.value
                                                      .replace(',', '.')
                                                      .replace(':', '.'),
                                              )
                                            : undefined;
                                    setPaceFilter({
                                        medianPace: paceFilter.medianPace,
                                        maxPace: paceFilter.maxPace,
                                        minPace: pace,
                                    });
                                }}
                            />
                            <Input
                                type="number"
                                style={{ width: '80px' }}
                                step="0.1"
                                placeholder="3.30"
                                value={paceFilter.maxPace}
                                onChange={(
                                    v: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    const pace =
                                        v.currentTarget.value.length > 0
                                            ? parseFloat(
                                                  v.currentTarget.value
                                                      .replace(',', '.')
                                                      .replace(':', '.'),
                                              )
                                            : undefined;
                                    setPaceFilter({
                                        medianPace: paceFilter.medianPace,
                                        maxPace: pace,
                                        minPace: paceFilter.minPace,
                                    });
                                }}
                            />
                            {paceFilter.minPace &&
                                paceFilter.maxPace &&
                                paceFilter.minPace <= paceFilter.maxPace && (
                                    <WarningLabel>
                                        Min/max pace is in wrong order.
                                    </WarningLabel>
                                )}
                            {paceFilter.medianPace && (
                                <WarningLabel>
                                    Estimated threshold pace:{' '}
                                    {paceFilter.medianPace}
                                </WarningLabel>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setPaceFilter({
                                        medianPace: undefined,
                                        maxPace: undefined,
                                        minPace: undefined,
                                    });
                                }}
                            >
                                re-calculate
                            </button>
                        </>
                    )}
                </>
            )}
        </StackContainer>
    );
}

export default ActivityFilter;
