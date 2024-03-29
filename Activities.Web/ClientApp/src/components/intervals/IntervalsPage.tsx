import React, { useState, useEffect } from 'react';
import {
    MarkSeries,
    HexbinSeries,
    LineSeries,
    Hint,
    VerticalBarSeries,
} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';
import { NavLink } from 'react-router-dom';
import Chart, {
    AxisTypes,
    ChartData,
    DynamicChartData,
    NumericChartData,
    getChartData,
} from '../charts/Chart';
import {
    Box,
    SubHeader,
    Table,
    LapsTable,
    Grid,
    LapFactor,
    LapLabel,
    EmptyThead,
    TableContainer,
    NoWrapTd,
    BigScreenTh,
    BigScreenTd,
} from '../../styles/styles';
import Loader, { LoadingStatus } from '../utils/Loader';
import {
    AveragePace,
    getKmString,
    getPaceString,
    getTimeString,
} from '../utils/Formatters';
import ActivityFilter, {
    getUrlWithFilters,
    Filters,
} from '../utils/ActivityFilter';

interface IntervalsResponse {
    intervals: ActivityMonth[];
    measurements: Measurement[];
    allMeasurements: Measurement[];
    distances: Distance[];
    paces: Pace[];
}

interface ActivityMonth {
    date: string;
    activities: Activity[];
}

interface Activity {
    id: number;
    date: string;
    name: string;
    type: string;
    description: string;
    interval_AveragePace: string;
    interval_AverageHeartrate: number;
    interval_Laps: IntervalLaps[];
}

interface IntervalLaps {
    id: number;
    distance: number;
    elapsedTime: number;
    averageSpeed: number;
    averageHeartrate: number;
    lactate: number;
    distanceFactor: number;
    averageSpeedFactor: number;
    averageHeartrateFactor: number;
}

interface Measurement {
    date: string;
    lactate: number;
}

interface Distance {
    date: string;
    nonIntervalDistance: number;
    intervalDistance: number;
}

interface Pace {
    date: string;
    label: string;
    averageShortPace: number;
    averageMediumPace: number;
    averageLongPace: number;
}

const IntervalsPage: React.FC = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [filters, setFilters] = useState<Filters>();
    const [activities, setActivities] = useState<ActivityMonth[]>();
    const [lactate, setLactate] = useState<ChartData[]>();
    const [lactateAll, setLactateAll] = useState<ChartData[]>();
    const [hint, setHint] = useState<{
        value: DynamicChartData;
        owner: string;
    } | null>();
    const [totalDistances, setTotalDistances] = useState<ChartData[]>();
    const [intervalDistances, setIntervalDistances] = useState<ChartData[]>();
    const [shortPaces, setShortPaces] = useState<ChartData[]>();
    const [mediumPaces, setMediumPaces] = useState<ChartData[]>();
    const [longPaces, setLongPaces] = useState<ChartData[]>();

    useEffect(() => {
        if (filters === undefined) {
            return;
        }

        setLoadingStatus(LoadingStatus.Loading);

        fetch(getUrlWithFilters('/api/intervals/', filters))
            .then((response) => response.json() as Promise<IntervalsResponse>)
            .then((data) => {
                setActivities(data.intervals);

                setLactate(
                    getChartData(
                        data.measurements,
                        (item) => new Date(item.date).getTime(),
                        (item) => item.lactate,
                        (item) =>
                            `${new Date(item.date)
                                .toUTCString()
                                .substr(8, 8)}: ${item.lactate.toFixed(1)}`
                    )
                );

                setLactateAll(
                    getChartData(
                        data.allMeasurements,
                        (item) => new Date(item.date).getTime(),
                        (item) => item.lactate
                    )
                );

                setTotalDistances(
                    getChartData(
                        data.distances,
                        (item) => item.date,
                        (item) => item.nonIntervalDistance,
                        (item) =>
                            `${item.date}\r\n- Total: ${Math.round(
                                item.nonIntervalDistance + item.intervalDistance
                            )} km`
                    ).reverse()
                );

                setIntervalDistances(
                    getChartData(
                        data.distances,
                        (item) => item.date,
                        (item) => item.intervalDistance,
                        (item) =>
                            `${item.date}\r\n- Intervals: ${
                                item.intervalDistance
                            } km (${Math.round(
                                (100 /
                                    (item.nonIntervalDistance +
                                        item.intervalDistance)) *
                                    item.intervalDistance
                            )} %)`
                    ).reverse()
                );

                setShortPaces(
                    getChartData(
                        data.paces,
                        (item) => item.date,
                        (item) => item.averageShortPace,
                        (item) => item.label
                    ).reverse()
                );

                setMediumPaces(
                    getChartData(
                        data.paces,
                        (item) => item.date,
                        (item) => item.averageMediumPace,
                        (item) => item.label
                    ).reverse()
                );

                setLongPaces(
                    getChartData(
                        data.paces,
                        (item) => item.date,
                        (item) => item.averageLongPace,
                        (item) => item.label
                    ).reverse()
                );

                setLoadingStatus(LoadingStatus.None);
            })
            .catch(() => {
                setActivities([]);
                setLoadingStatus(LoadingStatus.Error);
            });
    }, [filters]);

    return (
        <div>
            <ActivityFilter onChange={setFilters} />
            <Loader status={loadingStatus} />
            {loadingStatus === LoadingStatus.None && activities && (
                <div>
                    <Grid
                        columns={Math.ceil(
                            (lactate && lactate.length > 0 ? 3 : 2) /
                                ((lactate?.length ?? 0) > 12 ? 2 : 1)
                        )}
                    >
                        <Box>
                            <SubHeader>Distance</SubHeader>
                            {totalDistances && totalDistances.length > 0 && (
                                <Chart stack xType="ordinal">
                                    <VerticalBarSeries
                                        barWidth={0.5}
                                        data={intervalDistances}
                                        fill="#4c8eff"
                                        stroke="0"
                                        onValueMouseOver={(value) =>
                                            setHint({
                                                value,
                                                owner: 'distance',
                                            })
                                        }
                                        onValueMouseOut={() => setHint(null)}
                                        onValueClick={(value) => {
                                            window.location.hash = value.x.toString();
                                        }}
                                    />
                                    <VerticalBarSeries
                                        barWidth={0.5}
                                        data={totalDistances}
                                        fill="#bdc9ce"
                                        stroke="0"
                                        onValueMouseOver={(value) =>
                                            setHint({
                                                value,
                                                owner: 'distance',
                                            })
                                        }
                                        onValueMouseOut={() => setHint(null)}
                                        onValueClick={(value) => {
                                            window.location.hash = value.x.toString();
                                        }}
                                    />
                                    {hint?.value.label != null &&
                                        hint?.owner === 'distance' && (
                                            <Hint value={hint.value}>
                                                <div
                                                    style={{
                                                        background: 'black',
                                                        padding: '3px 5px',
                                                        color: 'white',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        whiteSpace: 'pre-line',
                                                    }}
                                                >
                                                    {hint.value.label}
                                                </div>
                                            </Hint>
                                        )}
                                </Chart>
                            )}
                        </Box>
                        <Box>
                            <SubHeader>Pace</SubHeader>
                            {shortPaces && filters && shortPaces.length > 0 && (
                                // y-axis will show min/500m if showing only rowing activities, and min/km
                                // otherwise (including if filter is set to “all”, no matter what kinds of
                                // activities are actually visible).
                                <Chart
                                    xType="ordinal"
                                    yDomain={[3, 6]}
                                    yTickFormat={(distancePerSecond) =>
                                        getPaceString(
                                            distancePerSecond,
                                            (filters.get('type') ??
                                                'All') as string
                                        )
                                    }
                                >
                                    <VerticalBarSeries
                                        getY={(d) => (d.y < 3 ? 3 : d.y)}
                                        barWidth={0.6}
                                        data={shortPaces}
                                        fill="#d4ce73"
                                        stroke="0"
                                        onValueMouseOver={(value) =>
                                            setHint({ value, owner: 'pace' })
                                        }
                                        onValueMouseOut={() => setHint(null)}
                                        onValueClick={(value) => {
                                            window.location.hash = value.x.toString();
                                        }}
                                    />
                                    <VerticalBarSeries
                                        getY={(d) => (d.y < 3 ? 3 : d.y)}
                                        barWidth={0.9}
                                        data={mediumPaces}
                                        fill="#448944"
                                        stroke="0"
                                        onValueMouseOver={(value) =>
                                            setHint({ value, owner: 'pace' })
                                        }
                                        onValueMouseOut={() => setHint(null)}
                                        onValueClick={(value) => {
                                            window.location.hash = value.x.toString();
                                        }}
                                    />
                                    <VerticalBarSeries
                                        getY={(d) => (d.y < 3 ? 3 : d.y)}
                                        barWidth={0.55}
                                        data={longPaces}
                                        fill="#afcbfb"
                                        stroke="0"
                                        onValueMouseOver={(value) =>
                                            setHint({ value, owner: 'pace' })
                                        }
                                        onValueMouseOut={() => setHint(null)}
                                        onValueClick={(value) => {
                                            window.location.hash = value.x.toString();
                                        }}
                                    />
                                    {hint?.value.label != null &&
                                        hint?.owner === 'pace' && (
                                            <Hint value={hint.value}>
                                                <div
                                                    style={{
                                                        background: 'black',
                                                        padding: '3px 5px',
                                                        color: 'white',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        whiteSpace: 'pre-line',
                                                    }}
                                                >
                                                    {hint.value.label}
                                                </div>
                                            </Hint>
                                        )}
                                </Chart>
                            )}
                        </Box>
                        {lactate && lactate.length > 0 && (
                            <Box>
                                <SubHeader>Lactate</SubHeader>
                                <Chart
                                    xAxisType={AxisTypes.Date}
                                    yDomain={[0, 5]}
                                >
                                    <HexbinSeries
                                        sizeHexagonsWithCount
                                        data={lactateAll as NumericChartData[]}
                                        style={{
                                            opacity: 0.5,
                                            fill: '#ccc',
                                            shapeRendering:
                                                'geometricPrecision',
                                        }}
                                        stroke="gray"
                                    />
                                    <LineSeries
                                        data={lactate as NumericChartData[]}
                                        stroke="#2d76d8"
                                        style={{
                                            shapeRendering:
                                                'geometricPrecision',
                                        }}
                                    />
                                    <MarkSeries
                                        data={lactate}
                                        fill="#2d76d8"
                                        stroke="transparent"
                                        sizeBaseValue={50}
                                        style={{
                                            shapeRendering:
                                                'geometricPrecision',
                                        }}
                                        onValueMouseOver={(value) =>
                                            setHint({ value, owner: 'lactate' })
                                        }
                                        onValueMouseOut={() => setHint(null)}
                                    />
                                    {hint?.value.label != null &&
                                        hint?.owner === 'lactate' && (
                                            <Hint value={hint.value}>
                                                <div
                                                    style={{
                                                        background: 'black',
                                                        padding: '3px 5px',
                                                        color: 'white',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        whiteSpace: 'pre-line',
                                                    }}
                                                >
                                                    {hint.value.label}
                                                </div>
                                            </Hint>
                                        )}
                                </Chart>
                            </Box>
                        )}
                    </Grid>
                    <TableContainer>
                        <Table>
                            {activities?.map((month) => (
                                <React.Fragment key={month.date}>
                                    {month.activities.length > 0 && (
                                        <thead>
                                            <tr>
                                                <th colSpan={1} id={month.date}>
                                                    {month.date}
                                                </th>
                                                <BigScreenTh>Pace</BigScreenTh>
                                                <th>Laps</th>
                                            </tr>
                                        </thead>
                                    )}
                                    {month.activities.length === 0 && (
                                        <EmptyThead>
                                            <tr>
                                                <th id={month.date} colSpan={5}>
                                                    {month.date} (0 activities)
                                                </th>
                                            </tr>
                                        </EmptyThead>
                                    )}
                                    <tbody>
                                        {month.activities.map((activity) => (
                                            <tr key={activity.id}>
                                                <td
                                                    style={{
                                                        textAlign: 'left',
                                                        minWidth: '140px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            marginBottom: '4px',
                                                            fontWeight: 'bold',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {activity.date}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        <NavLink
                                                            to={`/activities/${activity.id}`}
                                                        >
                                                            {activity.name}
                                                        </NavLink>
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {activity.description}
                                                    </div>
                                                </td>
                                                <BigScreenTd>
                                                    {
                                                        activity.interval_AveragePace
                                                    }
                                                </BigScreenTd>
                                                <td
                                                    style={{
                                                        minWidth: '220px',
                                                    }}
                                                >
                                                    <LapsTable>
                                                        <thead>
                                                            <tr>
                                                                <th title="Total distance">
                                                                    {getKmString(
                                                                        activity.interval_Laps
                                                                            .map(
                                                                                (
                                                                                    lap
                                                                                ) =>
                                                                                    lap.distance
                                                                            )
                                                                            .reduce(
                                                                                (
                                                                                    sum,
                                                                                    value
                                                                                ) =>
                                                                                    sum +
                                                                                    value
                                                                            )
                                                                    )}
                                                                </th>
                                                                <th title="Average pace">
                                                                    {getPaceString(
                                                                        AveragePace(
                                                                            activity.interval_Laps,
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item.elapsedTime,
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item.averageSpeed
                                                                        ) || 0,
                                                                        activity.type
                                                                    )}
                                                                </th>
                                                                <th title="Average heartrate">
                                                                    {Math.round(
                                                                        activity.interval_Laps
                                                                            .map(
                                                                                (
                                                                                    lap
                                                                                ) =>
                                                                                    lap.averageHeartrate
                                                                            )
                                                                            .reduce(
                                                                                (
                                                                                    sum,
                                                                                    value
                                                                                ) =>
                                                                                    sum +
                                                                                    value
                                                                            ) /
                                                                            activity
                                                                                .interval_Laps
                                                                                .length
                                                                    )}{' '}
                                                                    bpm
                                                                </th>
                                                                <th
                                                                    style={{
                                                                        width:
                                                                            '60px',
                                                                    }}
                                                                >
                                                                    {getTimeString(
                                                                        activity.interval_Laps
                                                                            .map(
                                                                                (
                                                                                    lap
                                                                                ) =>
                                                                                    lap.elapsedTime
                                                                            )
                                                                            .reduce(
                                                                                (
                                                                                    sum,
                                                                                    value
                                                                                ) =>
                                                                                    sum +
                                                                                    value
                                                                            )
                                                                    )}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {activity.interval_Laps.map(
                                                                (lap) => (
                                                                    <tr
                                                                        key={
                                                                            lap.id
                                                                        }
                                                                    >
                                                                        <NoWrapTd
                                                                            title={`${getKmString(
                                                                                lap.distance,
                                                                                3
                                                                            )}`}
                                                                        >
                                                                            <LapLabel>
                                                                                {getKmString(
                                                                                    lap.distance
                                                                                )}
                                                                            </LapLabel>
                                                                            <LapFactor
                                                                                style={{
                                                                                    width: `${
                                                                                        lap.distanceFactor *
                                                                                        100
                                                                                    }%`,
                                                                                }}
                                                                                color="#005dff"
                                                                            />
                                                                        </NoWrapTd>
                                                                        <NoWrapTd title="Pace">
                                                                            <LapLabel>
                                                                                {getPaceString(
                                                                                    lap.averageSpeed,
                                                                                    activity.type
                                                                                )}
                                                                            </LapLabel>
                                                                            <LapFactor
                                                                                style={{
                                                                                    width: `${
                                                                                        lap.averageSpeedFactor *
                                                                                        100
                                                                                    }%`,
                                                                                }}
                                                                                color="#00a000"
                                                                            />
                                                                        </NoWrapTd>
                                                                        <NoWrapTd title="Heartrate">
                                                                            <LapLabel>
                                                                                {
                                                                                    lap.averageHeartrate
                                                                                }{' '}
                                                                                bpm
                                                                            </LapLabel>
                                                                            <LapFactor
                                                                                style={{
                                                                                    width: `${
                                                                                        lap.averageHeartrateFactor *
                                                                                        100
                                                                                    }%`,
                                                                                }}
                                                                                color="#ff1700"
                                                                            />
                                                                        </NoWrapTd>
                                                                        <NoWrapTd
                                                                            title="Time"
                                                                            style={{
                                                                                width:
                                                                                    '60px',
                                                                            }}
                                                                        >
                                                                            <LapLabel>
                                                                                {lap.lactate &&
                                                                                    `(${lap.lactate.toFixed(1)})`}{' '}
                                                                                {getTimeString(
                                                                                    lap.elapsedTime
                                                                                )}
                                                                            </LapLabel>
                                                                        </NoWrapTd>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </LapsTable>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </React.Fragment>
                            ))}
                        </Table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
};

export default IntervalsPage;
