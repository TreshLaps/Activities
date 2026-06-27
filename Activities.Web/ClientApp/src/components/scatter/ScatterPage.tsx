import React, { useState, useEffect } from 'react';
import { Axis, Grid, GlyphSeries, XYChart } from '@visx/xychart';
import { ParentSize } from '@visx/responsive';
import Loader, { LoadingStatus } from '../utils/Loader';
import ActivityFilter, {
    filtersChanged,
    getUrlWithFilters,
    Filters,
} from '../utils/ActivityFilter';
import { Box, Dropdown, StackContainer } from '../../styles/styles';
import { getPaceString } from '../utils/Formatters';

interface Item {
    distance: number;
    elapsedTime: number;
    movingTime: number;
    pace: number;
    averageHeartrate: number;
    maxHeartrate: number;
}

interface Axis {
    format: ((value: number) => string) | undefined;
    min: number;
    max: number;
}

const getAxisSettings = (
    data: Item[] | undefined,
    key: keyof Item,
    lockAxisFilter: boolean,
): Axis => {
    const dataMin = Math.min(...(data ?? []).map((d) => d[key]));
    const dataMax = Math.max(...(data ?? []).map((d) => d[key]));

    if (key === 'pace') {
        // TODO: If this page is ever made public, apply the same logic with
        // propagating the activity type from the filter as in the other pages.
        return {
            format: (value: number) => getPaceString(value, ''),
            min: lockAxisFilter ? 3.7 : dataMin,
            max: lockAxisFilter ? 5.5 : dataMax,
        };
    }
    if (key === 'averageHeartrate' || key === 'maxHeartrate') {
        return {
            format: undefined,
            min: 100,
            max: 190,
        };
    }

    return {
        format: undefined,
        min: dataMin,
        max: dataMax,
    };
};

const defaultYAxis: keyof Item = 'averageHeartrate';
const defaultXAxis: keyof Item = 'pace';

const ScatterPage = () => {
    const query: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
        query[key] = value;
    });
    const { yAxis, xAxis } = query as {
        yAxis: keyof Item;
        xAxis: keyof Item;
    };
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [filters, setFilters] = useState<Filters>();
    const [items, setItems] = useState<Item[]>();
    const [yAxisFilter, setYAxisFilter] = useState<keyof Item>(
        typeof yAxis === 'string' ? yAxis : defaultYAxis,
    );
    const [xAxisFilter, setXAxisFilter] = useState<keyof Item>(
        typeof xAxis === 'string' ? xAxis : defaultXAxis,
    );
    const [lockAxisFilter] = useState(false);

    const onFilterChange = (newFilters: Filters) => {
        if (filtersChanged(filters, newFilters)) {
            setLoadingStatus(LoadingStatus.Loading);
            setFilters(newFilters);
        }
    };

    useEffect(() => {
        if (filters === undefined) {
            return;
        }

        fetch(getUrlWithFilters('/api/scatter/', filters))
            .then((response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json() as Promise<Item[]>;
            })
            .then((data) => {
                setItems(data);
                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setItems([]);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, [filters]);

    const data = items?.map((item) => ({
        x: Number(item[xAxisFilter]),
        y: Number(item[yAxisFilter]),
    }));

    const yAxisSettings = getAxisSettings(items, yAxisFilter, lockAxisFilter);
    const xAxisSettings = getAxisSettings(items, xAxisFilter, lockAxisFilter);

    return (
        <div>
            <ActivityFilter onChange={onFilterChange} />
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && items && (
                <div>
                    <StackContainer>
                        <Dropdown
                            defaultValue={yAxisFilter}
                            onChange={(
                                v: React.ChangeEvent<HTMLSelectElement>,
                            ) => {
                                setYAxisFilter(
                                    v.currentTarget.value as keyof Item,
                                );
                            }}
                        >
                            <option value="distance">Distance</option>
                            <option value="elapsedTime">Elapsed time</option>
                            <option value="movingTime">Moving time</option>
                            <option value="pace">Pace</option>
                            <option value="averageHeartrate">
                                Average heartrate
                            </option>
                            <option value="maxHeartrate">Max heartrate</option>
                        </Dropdown>
                        <Dropdown
                            defaultValue={xAxisFilter}
                            onChange={(
                                v: React.ChangeEvent<HTMLSelectElement>,
                            ) => {
                                setXAxisFilter(
                                    v.currentTarget.value as keyof Item,
                                );
                            }}
                        >
                            <option value="distance">Distance</option>
                            <option value="elapsedTime">Elapsed time</option>
                            <option value="movingTime">Moving time</option>
                            <option value="pace">Pace</option>
                            <option value="averageHeartrate">
                                Average heartrate
                            </option>
                            <option value="maxHeartrate">Max heartrate</option>
                        </Dropdown>
                    </StackContainer>
                    <Box style={{ height: '80vh' }}>
                        <ParentSize>
                            {({ width, height }) => (
                                <XYChart
                                    width={width}
                                    height={height}
                                    xScale={{
                                        type: 'linear',
                                        domain: [
                                            // FIXME: For some reason, we are always bounded at zero.
                                            xAxisSettings.min,
                                            xAxisSettings.max,
                                        ],
                                    }}
                                    yScale={{
                                        type: 'linear',
                                        domain: [
                                            // FIXME: For some reason, we are always bounded at zero.
                                            yAxisSettings.min,
                                            yAxisSettings.max,
                                        ],
                                    }}
                                >
                                    <Grid />
                                    <GlyphSeries
                                        data={data ?? []}
                                        dataKey="scatter"
                                        xAccessor={(d) => (d ?? { x: 0 }).x}
                                        yAccessor={(d) => (d ?? { y: 0 }).y}
                                        /*style={{
                                            stroke: '#124890',
                                            strokeWidth: '1px',
                                        }}*/
                                    />
                                    <Axis
                                        orientation="bottom"
                                        tickFormat={xAxisSettings.format}
                                        label={xAxisFilter}
                                    />
                                    <Axis
                                        orientation="left"
                                        tickFormat={yAxisSettings.format}
                                        label={yAxisFilter}
                                    />
                                </XYChart>
                            )}
                        </ParentSize>
                    </Box>
                </div>
            )}
        </div>
    );
};

export default ScatterPage;
