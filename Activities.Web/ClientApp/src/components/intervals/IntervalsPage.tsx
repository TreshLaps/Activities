import React, { useState, useEffect } from 'react';
import { Bar, BarStack, LinePath, Circle } from '@visx/shape';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { GridRows } from '@visx/grid';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { localPoint } from '@visx/event';
import { useParentSize } from '@visx/responsive';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { NavLink } from 'react-router-dom';
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

interface DistanceWithLabel extends Distance {
    intervalLabel: string;
    nonIntervalLabel: string;
}

interface Pace {
    date: string;
    label: string;
    averageShortPace: number;
    averageMediumPace: number;
    averageLongPace: number;
}

interface DistanceChartProps {
    distances: DistanceWithLabel[];
}

const DistanceChart = ({ distances }: DistanceChartProps) => {
    const { parentRef, width } = useParentSize({
        debounceTime: 15,
        ignoreDimensions: 'height',
    });
    const height = Math.min(200, width * 0.66);

    const marginLeft = 35;
    const marginBottom = 30;
    const xMax = width;
    const yMax = height - marginBottom;
    const xScale = scaleBand<string>({
        domain: distances.map((d) => d.date),
        range: [0, xMax - marginLeft],
        padding: 0.5,
    });
    const yScale = scaleLinear<number>({
        domain: [
            0,
            Math.max(
                ...distances.map(
                    (d) => d.nonIntervalDistance + d.intervalDistance,
                ),
            ),
        ],
        range: [yMax, 0],
    });
    const colorScale = scaleOrdinal<string, string>({
        domain: ['intervalDistance', 'nonIntervalDistance'],
        range: ['#4c8eff', '#bdc9ce'],
    });

    const {
        showTooltip,
        hideTooltip,
        tooltipOpen,
        tooltipData,
        tooltipLeft = 0,
        tooltipTop = 0,
    } = useTooltip<String>({
        tooltipOpen: false,
        tooltipLeft: width / 3,
        tooltipTop: height / 3,
        tooltipData: '',
    });
    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        scroll: true,
        detectBounds: true,
    });

    return (
        <div style={{ width: '100%', position: 'relative' }} ref={parentRef}>
            <div ref={containerRef}>
                <svg
                    style={{ width: width + 'px', height: height + 'px' }}
                    viewBox={`0 0 ${xMax} ${yMax}`}
                >
                    <Group left={marginLeft}>
                        <GridRows
                            scale={yScale}
                            width={xMax}
                            height={yMax}
                            stroke="#eee"
                            numTicks={5}
                        />
                        <AxisBottom
                            top={yMax}
                            scale={xScale}
                            numTicks={10}
                            stroke="#eee"
                            strokeWidth="1.6px"
                            hideTicks
                            tickFormat={() => ''}
                        />
                        <AxisLeft
                            scale={yScale}
                            numTicks={5}
                            stroke="#ddd"
                            strokeWidth="1.6px"
                            hideTicks
                            tickLabelProps={{
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                fill: '#666',
                            }}
                        />
                        <BarStack
                            data={distances}
                            keys={['intervalDistance', 'nonIntervalDistance']}
                            fill="#4c8eff"
                            stroke="0"
                            xScale={xScale}
                            yScale={yScale}
                            x={(d: DistanceWithLabel) => d.date}
                            color={colorScale}
                        >
                            {(barStacks) =>
                                barStacks.map((barStack) =>
                                    barStack.bars.map((bar) => (
                                        <rect
                                            key={`bar-stack-${barStack.index}-${bar.index}`}
                                            x={bar.x}
                                            y={bar.y}
                                            height={bar.height}
                                            width={bar.width}
                                            fill={bar.color}
                                            onMouseMove={(event) => {
                                                const coords = localPoint(
                                                    event,
                                                ) || { x: 0, y: 0 };
                                                showTooltip({
                                                    tooltipData:
                                                        barStack.index === 0
                                                            ? bar.bar.data
                                                                  .intervalLabel
                                                            : bar.bar.data
                                                                  .nonIntervalLabel,
                                                    tooltipLeft: coords.x,
                                                    tooltipTop: coords.y,
                                                });
                                            }}
                                            onMouseLeave={hideTooltip}
                                        />
                                    )),
                                )
                            }
                        </BarStack>
                    </Group>
                </svg>
                {tooltipOpen && tooltipData && (
                    <TooltipInPortal
                        top={tooltipTop}
                        left={tooltipLeft}
                        style={{
                            ...defaultStyles,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            fontFamily: 'inherit',
                            fontSize: '12px',
                            whiteSpaceCollapse: 'preserve',
                        }}
                    >
                        <div>{tooltipData}</div>
                    </TooltipInPortal>
                )}
            </div>
        </div>
    );
};

interface PaceData {
    date: string;
    pace: number;
    label: string;
}

interface PaceChartProps {
    shortPaces: PaceData[];
    mediumPaces: PaceData[];
    longPaces: PaceData[];
    filters: Filters;
}

const PaceChart = ({
    shortPaces,
    mediumPaces,
    longPaces,
    filters,
}: PaceChartProps) => {
    const { parentRef, width } = useParentSize({
        debounceTime: 15,
        ignoreDimensions: 'height',
    });
    const height = Math.min(200, width * 0.66);

    const marginLeft = 35;
    const marginBottom = 30;
    const xMax = width;
    const yMax = height - marginBottom;
    const xScale = scaleBand<string>({
        domain: shortPaces.map((d) => d.date),
        range: [0, xMax - marginLeft],
        padding: 0.25,
    });
    const yScale = scaleLinear<number>({
        domain: [3, 6],
        range: [yMax, 0],
    });

    const {
        showTooltip,
        hideTooltip,
        tooltipOpen,
        tooltipData,
        tooltipLeft = 0,
        tooltipTop = 0,
    } = useTooltip<String>({
        tooltipOpen: false,
        tooltipLeft: width / 3,
        tooltipTop: height / 3,
        tooltipData: '',
    });
    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        scroll: true,
        detectBounds: true,
    });

    return (
        <div style={{ width: '100%', position: 'relative' }} ref={parentRef}>
            <div ref={containerRef}>
                <svg
                    style={{ width: width + 'px', height: height + 'px' }}
                    viewBox={`0 0 ${xMax} ${yMax}`}
                >
                    <Group left={marginLeft}>
                        <GridRows
                            scale={yScale}
                            width={xMax}
                            height={yMax}
                            stroke="#eee"
                            numTicks={5}
                        />
                        <AxisBottom
                            top={yMax}
                            scale={xScale}
                            numTicks={10}
                            stroke="#eee"
                            strokeWidth="1.6px"
                            hideTicks
                            tickFormat={() => ''}
                        />
                        <AxisLeft
                            scale={yScale}
                            numTicks={5}
                            stroke="#ddd"
                            strokeWidth="1.6px"
                            hideTicks
                            tickLabelProps={{
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                fill: '#666',
                            }}
                            tickFormat={(distancePerSecond: {
                                valueOf(): number;
                            }) =>
                                getPaceString(
                                    distancePerSecond.valueOf(),
                                    (filters.get('type') ?? 'All') as string,
                                )
                            }
                        />
                        {shortPaces.map((pace) => (
                            <Bar
                                key={`shortPace-${pace.date}`}
                                fill="#d4ce73"
                                stroke="0"
                                x={xScale(pace.date)}
                                y={yScale(pace.pace)}
                                width={xScale.bandwidth() / 3}
                                height={yMax - yScale(pace.pace)}
                                onMouseMove={(event) => {
                                    const coords = localPoint(event) || {
                                        x: 0,
                                        y: 0,
                                    };
                                    showTooltip({
                                        tooltipData: pace.label,
                                        tooltipLeft: coords.x,
                                        tooltipTop: coords.y,
                                    });
                                }}
                                onMouseLeave={hideTooltip}
                            />
                        ))}
                        {mediumPaces.map((pace) => (
                            <Bar
                                key={`mediumPace-${pace.date}`}
                                fill="#448944"
                                stroke="0"
                                x={
                                    (xScale(pace.date) ?? 0) +
                                    xScale.bandwidth() / 3
                                }
                                y={yScale(pace.pace)}
                                width={xScale.bandwidth() / 3}
                                height={yMax - yScale(pace.pace)}
                                onMouseMove={(event) => {
                                    const coords = localPoint(event) || {
                                        x: 0,
                                        y: 0,
                                    };
                                    showTooltip({
                                        tooltipData: pace.label,
                                        tooltipLeft: coords.x,
                                        tooltipTop: coords.y,
                                    });
                                }}
                                onMouseLeave={hideTooltip}
                            />
                        ))}
                        {longPaces.map((pace) => (
                            <Bar
                                key={`longPace-${pace.date}`}
                                fill="#afcbfb"
                                stroke="0"
                                x={
                                    (xScale(pace.date) ?? 0) +
                                    (xScale.bandwidth() * 2) / 3
                                }
                                y={yScale(pace.pace)}
                                width={xScale.bandwidth() / 3}
                                height={yMax - yScale(pace.pace)}
                                onMouseMove={(event) => {
                                    const coords = localPoint(event) || {
                                        x: 0,
                                        y: 0,
                                    };
                                    showTooltip({
                                        tooltipData: pace.label,
                                        tooltipLeft: coords.x,
                                        tooltipTop: coords.y,
                                    });
                                }}
                                onMouseLeave={hideTooltip}
                            />
                        ))}
                    </Group>
                </svg>
                {tooltipOpen && tooltipData && (
                    <TooltipInPortal
                        top={tooltipTop}
                        left={tooltipLeft}
                        style={{
                            ...defaultStyles,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            fontFamily: 'inherit',
                            fontSize: '12px',
                            whiteSpaceCollapse: 'preserve',
                        }}
                    >
                        <div>{tooltipData}</div>
                    </TooltipInPortal>
                )}
            </div>
        </div>
    );
};

interface LactateData {
    date: number;
    lactate: number;
}

interface LactateWithLabelData extends LactateData {
    label: string;
}

interface LactateChartProps {
    lactate: LactateWithLabelData[];
    lactateAll: LactateData[];
}

const LactateChart = ({ lactate, lactateAll }: LactateChartProps) => {
    const { parentRef, width } = useParentSize({
        debounceTime: 15,
        ignoreDimensions: 'height',
    });
    const height = Math.min(200, width * 0.66);

    const marginLeft = 35;
    const marginBottom = 70;
    const xMax = width;
    const yMax = height - marginBottom;
    const xs = lactate.map((d) => d.date);
    const xScale = scaleLinear<number>({
        domain: [Math.min(...xs), Math.max(...xs)],
        range: [0, xMax - marginLeft],
    });
    const yScale = scaleLinear<number>({
        domain: [0, 5],
        range: [yMax, 0],
    });

    const {
        showTooltip,
        hideTooltip,
        tooltipOpen,
        tooltipData,
        tooltipLeft = 0,
        tooltipTop = 0,
    } = useTooltip<String>({
        tooltipOpen: false,
        tooltipLeft: width / 3,
        tooltipTop: height / 3,
        tooltipData: 'Move me with your mouse or finger',
    });
    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        scroll: true,
        detectBounds: true,
    });

    return (
        <div style={{ width: '100%', position: 'relative' }} ref={parentRef}>
            <div ref={containerRef}>
                <svg
                    style={{ width: width + 'px', height: height + 'px' }}
                    viewBox={`0 0 ${xMax} ${yMax}`}
                >
                    <Group left={marginLeft}>
                        <GridRows
                            scale={yScale}
                            width={xMax}
                            height={yMax}
                            stroke="#eee"
                            numTicks={5}
                        />
                        <AxisBottom
                            top={yMax}
                            scale={xScale}
                            numTicks={10}
                            stroke="#ddd"
                            strokeWidth="1.6px"
                            tickFormat={(x: { valueOf(): number }) =>
                                new Date(x.valueOf()).toLocaleDateString(
                                    'en-US',
                                    {
                                        month: 'short',
                                        year: 'numeric',
                                    },
                                )
                            }
                            tickLabelProps={{
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                fill: '#666',
                                angle: 30,
                                dy: 5,
                            }}
                            hideTicks
                        />
                        <AxisLeft
                            scale={yScale}
                            numTicks={5}
                            stroke="#ddd"
                            tickStroke="#eee"
                            tickLength={7}
                            strokeWidth="1.6px"
                            tickLabelProps={{
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                fill: '#666',
                            }}
                            tickFormat={(x: { valueOf(): number }) =>
                                x.valueOf().toFixed(0)
                            }
                        />
                        <LinePath
                            data={lactate}
                            x={(d) => xScale(d.date) ?? 0}
                            y={(d) => yScale(d.lactate) ?? 0}
                            stroke="#2d76d8"
                            style={{
                                shapeRendering: 'geometricPrecision',
                                strokeWidth: '2px',
                            }}
                        />
                        {lactateAll.map((d, index) => (
                            <Circle
                                key={`lactate-all-point-${index}`}
                                className="dot"
                                cx={xScale(d.date)}
                                cy={yScale(Math.min(d.lactate, 5))}
                                r={3}
                                opacity={0.2}
                                fill="#333"
                            />
                        ))}
                        {lactate.map((d, index) => (
                            <Circle
                                key={`lactate-point-${index}`}
                                className="dot"
                                cx={xScale(d.date)}
                                cy={yScale(d.lactate)}
                                r={5}
                                fill="#2d76d8"
                                onMouseMove={(event) => {
                                    const coords = localPoint(event) || {
                                        x: 0,
                                        y: 0,
                                    };
                                    showTooltip({
                                        tooltipData: d.label,
                                        tooltipLeft: coords.x,
                                        tooltipTop: coords.y,
                                    });
                                }}
                                onMouseLeave={hideTooltip}
                            />
                        ))}
                    </Group>
                </svg>
                {tooltipOpen && tooltipData && (
                    <TooltipInPortal
                        top={tooltipTop}
                        left={tooltipLeft}
                        style={{
                            ...defaultStyles,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            fontFamily: 'inherit',
                            fontSize: '12px',
                            whiteSpaceCollapse: 'preserve',
                        }}
                    >
                        <div>{tooltipData}</div>
                    </TooltipInPortal>
                )}
            </div>
        </div>
    );
};

const IntervalsPage: React.FC = () => {
    const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
    const [filters, setFilters] = useState<Filters>();
    const [activities, setActivities] = useState<ActivityMonth[]>();
    const [lactate, setLactate] = useState<LactateWithLabelData[]>();
    const [lactateAll, setLactateAll] = useState<LactateData[]>();
    const [distances, setDistances] = useState<DistanceWithLabel[]>();
    const [shortPaces, setShortPaces] = useState<PaceData[]>();
    const [mediumPaces, setMediumPaces] = useState<PaceData[]>();
    const [longPaces, setLongPaces] = useState<PaceData[]>();

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
                    data.measurements.map((item) => ({
                        date: new Date(item.date).getTime(),
                        lactate: item.lactate,
                        label: `${new Date(item.date)
                            .toUTCString()
                            .substr(8, 8)}: ${item.lactate.toFixed(1)}`,
                    })),
                );

                setLactateAll(
                    data.allMeasurements.map((item) => ({
                        date: new Date(item.date).getTime(),
                        lactate: item.lactate,
                    })),
                );

                setDistances(
                    data.distances
                        .map((item) => ({
                            date: item.date,
                            nonIntervalDistance: item.nonIntervalDistance,
                            intervalDistance: item.intervalDistance,
                            nonIntervalLabel: `${
                                item.date
                            }\r\n- Total: ${Math.round(
                                item.nonIntervalDistance +
                                    item.intervalDistance,
                            )} km`,
                            intervalLabel: `${item.date}\r\n- Intervals: ${
                                item.intervalDistance
                            } km (${Math.round(
                                (100 /
                                    (item.nonIntervalDistance +
                                        item.intervalDistance)) *
                                    item.intervalDistance,
                            )} %)`,
                        }))
                        .reverse(),
                );

                setShortPaces(
                    data.paces
                        .map((item) => ({
                            date: item.date,
                            pace: item.averageShortPace,
                            label: item.label,
                        }))
                        .reverse(),
                );

                setMediumPaces(
                    data.paces
                        .map((item) => ({
                            date: item.date,
                            pace: item.averageMediumPace,
                            label: item.label,
                        }))
                        .reverse(),
                );

                setLongPaces(
                    data.paces
                        .map((item) => ({
                            date: item.date,
                            pace: item.averageLongPace,
                            label: item.label,
                        }))
                        .reverse(),
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
                                ((lactate?.length ?? 0) > 12 ? 2 : 1),
                        )}
                    >
                        <Box>
                            <SubHeader>Distance</SubHeader>
                            {distances && distances.length > 0 && (
                                <DistanceChart distances={distances} />
                            )}
                        </Box>
                        <Box>
                            <SubHeader>Pace</SubHeader>
                            {shortPaces &&
                                mediumPaces &&
                                longPaces &&
                                filters &&
                                shortPaces.length > 0 && (
                                    <PaceChart
                                        shortPaces={shortPaces}
                                        mediumPaces={mediumPaces}
                                        longPaces={longPaces}
                                        filters={filters}
                                    />
                                )}
                        </Box>
                        {lactate && lactateAll && lactate.length > 0 && (
                            <Box>
                                <SubHeader>Lactate</SubHeader>
                                <LactateChart
                                    lactate={lactate}
                                    lactateAll={lactateAll}
                                />
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
                                                                                    lap,
                                                                                ) =>
                                                                                    lap.distance,
                                                                            )
                                                                            .reduce(
                                                                                (
                                                                                    sum,
                                                                                    value,
                                                                                ) =>
                                                                                    sum +
                                                                                    value,
                                                                            ),
                                                                    )}
                                                                </th>
                                                                <th title="Average pace">
                                                                    {getPaceString(
                                                                        AveragePace(
                                                                            activity.interval_Laps,
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.elapsedTime,
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.averageSpeed,
                                                                        ) || 0,
                                                                        activity.type,
                                                                    )}
                                                                </th>
                                                                <th title="Average heartrate">
                                                                    {Math.round(
                                                                        activity.interval_Laps
                                                                            .map(
                                                                                (
                                                                                    lap,
                                                                                ) =>
                                                                                    lap.averageHeartrate,
                                                                            )
                                                                            .reduce(
                                                                                (
                                                                                    sum,
                                                                                    value,
                                                                                ) =>
                                                                                    sum +
                                                                                    value,
                                                                            ) /
                                                                            activity
                                                                                .interval_Laps
                                                                                .length,
                                                                    )}{' '}
                                                                    bpm
                                                                </th>
                                                                <th
                                                                    style={{
                                                                        width: '60px',
                                                                    }}
                                                                >
                                                                    {getTimeString(
                                                                        activity.interval_Laps
                                                                            .map(
                                                                                (
                                                                                    lap,
                                                                                ) =>
                                                                                    lap.elapsedTime,
                                                                            )
                                                                            .reduce(
                                                                                (
                                                                                    sum,
                                                                                    value,
                                                                                ) =>
                                                                                    sum +
                                                                                    value,
                                                                            ),
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
                                                                                3,
                                                                            )}`}
                                                                        >
                                                                            <LapLabel>
                                                                                {getKmString(
                                                                                    lap.distance,
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
                                                                                    activity.type,
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
                                                                                width: '60px',
                                                                            }}
                                                                        >
                                                                            <LapLabel>
                                                                                {lap.lactate &&
                                                                                    `(${lap.lactate.toFixed(
                                                                                        1,
                                                                                    )})`}{' '}
                                                                                {getTimeString(
                                                                                    lap.elapsedTime,
                                                                                )}
                                                                            </LapLabel>
                                                                        </NoWrapTd>
                                                                    </tr>
                                                                ),
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
