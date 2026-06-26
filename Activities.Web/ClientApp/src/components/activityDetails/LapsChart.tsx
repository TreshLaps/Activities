import { useMemo } from 'react';
import styled from 'styled-components';
import { getKmString, getPaceString, getTimeString } from '../utils/Formatters';
import { Bar, LinePath } from '@visx/shape';
import { Text } from '@visx/text';
import { scaleLinear } from '@visx/scale';

const IntervalPaceContainer = styled.div`
    margin-top: 20px;
    font-size: 10px;
    margin-bottom: -10px;
`;

export interface Lap {
    averageCadence: number;
    averageHeartrate: number;
    averageSpeed: number;
    distance: number;
    elapsedTime: number;
    endIndex: number;
    id: number;
    isInterval: boolean;
    lactate: number;
    lapIndex: number;
    maxHeartrate: number;
    maxSpeed: number;
    movingTime: number;
    name: string;
    originalDistance?: number;
    paceZone: number;
    resourceState: number;
    split: number;
    startDate: Date;
    startDateLocal: Date;
    startIndex: number;
    totalElevationGain: number;
}

const isPauseLap = (index: number, laps: Lap[]) => {
    // If we run less than 500m before or after an interval lap we define it as a pause lap.
    if (
        ((index > 0 && laps[index - 1].isInterval) ||
            (index < laps.length - 1 && laps[index + 1].isInterval)) &&
        laps[index].distance < 500
    ) {
        return true;
    }

    return false;
};

function NormalizeChartData<T extends BasicChart>(
    data: T[],
    minValue?: number,
    maxValue?: number,
) {
    if (data.length === 0) {
        return [];
    }

    const sortedData = [...data].sort((a, b) => a.y - b.y);
    const min = minValue
        ? Math.min(minValue, sortedData[0].y)
        : sortedData[0].y;
    const max = maxValue
        ? Math.max(maxValue, sortedData[sortedData.length - 1].y)
        : sortedData[sortedData.length - 1].y;

    return data.map((item) => ({
        ...item,
        y: (item.y - min) / (max - min),
    }));
}

interface BasicChart {
    x: number;
    y: number;
}

interface ChartLap extends BasicChart {
    lap: Lap;
    x0: number;
    y0: number;
    yHeartrate: number;
    label: string;
    hint: string;
    color: number;
}

interface HeartRateChartLap extends BasicChart {
    yOffset: number;
    label: string;
}

interface LapsChartProps {
    laps: Lap[];
    activityType: string;
    averageIntervalPace: number | undefined;
    last60DaysIntervalPace: number | undefined;
}

function LapsChart({
    laps,
    activityType,
    averageIntervalPace,
    last60DaysIntervalPace,
}: LapsChartProps) {
    const speedPadding = 0.1;

    const sortedBySpeed = [...laps]
        .filter((lap, lapIndex) => isPauseLap(lapIndex, laps) === false)
        .sort((l1, l2) => l1.averageSpeed - l2.averageSpeed);
    const slowSpeed = sortedBySpeed[0].averageSpeed - speedPadding;
    const fastSpeed =
        sortedBySpeed[sortedBySpeed.length - 1].averageSpeed + speedPadding;
    const minChartHeight = (fastSpeed - slowSpeed) * 0.05;

    const chart: {
        laps: ChartLap[];
        heartrateLaps: HeartRateChartLap[];
        totalMovingTime: number;
        barPadding: number;
    } = useMemo(() => {
        const totalMovingTime = laps
            .map((lap) => lap.elapsedTime)
            .reduce((l1, l2) => l1 + l2);
        const barPadding = totalMovingTime * 0.005;

        const x0s = [0];
        for (const lap of laps) {
            x0s.push(x0s[x0s.length - 1] + lap.elapsedTime + barPadding);
        }

        const chartLaps: ChartLap[] = laps.map((lap, lapIndex) => {
            const averageLapSpeed = isPauseLap(lapIndex, laps)
                ? slowSpeed + minChartHeight
                : lap.averageSpeed;
            const x0 = x0s[lapIndex];

            return {
                lap,
                x0,
                y0: -1,
                x: x0 + lap.elapsedTime,
                y: averageLapSpeed,
                yHeartrate: lap.averageHeartrate,
                label: isPauseLap(lapIndex, laps)
                    ? ''
                    : getPaceString(averageLapSpeed, activityType),
                hint: `Pace: ${getPaceString(
                    lap.averageSpeed,
                    activityType,
                    true,
                )}
        Heartrate: ${lap.averageHeartrate}
        Distance: ${getKmString(lap.distance)}
      Duration: ${getTimeString(lap.elapsedTime)} (Moving time: ${getTimeString(
          lap.movingTime,
      )})
      ${lap.lactate ? `Lactate: ${lap.lactate.toFixed(1)}` : ''}`,
                color: lap.isInterval ? 1 : 0,
            };
        });

        const chartLapsHeartrate: HeartRateChartLap[] = chartLaps
            .filter((lap) => lap.lap.isInterval && lap.yHeartrate > 0)
            .map((lap) => ({
                x: lap.x0 + (lap.x - lap.x0) / 2,
                y: lap.yHeartrate,
                yOffset: 8,
                label: `${Math.round(lap.yHeartrate)}`,
            }));

        return {
            laps: NormalizeChartData(chartLaps),
            heartrateLaps: NormalizeChartData(chartLapsHeartrate, 150, 190),
            totalMovingTime: x0s[x0s.length - 1] - barPadding,
            barPadding,
        };
    }, [activityType, laps, minChartHeight, slowSpeed]);

    const labelData: HeartRateChartLap[] = useMemo(
        () =>
            chart.laps.map((lap) => ({
                x: lap.x0 + (lap.x - lap.x0) / 2,
                y: lap.y,
                yOffset: -4,
                label: lap.label,
            })),
        [chart.laps],
    );

    const xMax = 1000;
    const yMax = 300;

    const xScale = useMemo(
        () =>
            scaleLinear<number>({
                range: [0, xMax],
                round: true,
                domain: [0, chart.totalMovingTime],
            }),
        [xMax, chart.totalMovingTime],
    );
    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                range: [yMax - 15, 5],
                round: true,
                domain: [-0.05, 1.05],
            }),
        [yMax],
    );
    const labelTicksComponent = (lap: ChartLap, index: number) => (
        <text
            key={`labeltick-${index}`}
            x={xScale(lap.x0 + (lap.x - lap.x0) / 2)}
            y={yMax - 3}
            textAnchor="middle"
            style={{ fontSize: 10, letterSpacing: '-0.5px' }}
        >
            {getKmString(lap.lap.distance)}
        </text>
    );

    const labelTicks = chart.laps
        .filter(
            (_, index) =>
                !isPauseLap(
                    index,
                    chart.laps.map((chartLap) => chartLap.lap),
                ),
        )
        .map((lap, index) => labelTicksComponent(lap, index));

    return (
        <div style={{ containerType: 'inline-size' }}>
            {chart.laps?.length > 1 && (
                <svg
                    style={{ width: '100%', height: 'min(300px, 66cqw)' }}
                    viewBox={`0 0 ${xMax} ${yMax}`}
                >
                    {chart.laps.map((lap, index) => {
                        const mixPercent = lap.y * 100 + '%';
                        return (
                            <Bar
                                key={`bar-${index}`}
                                x={xScale(lap.x0)}
                                y={yScale(lap.y)}
                                width={xScale(lap.x - lap.x0)}
                                height={yScale(lap.y0 - lap.y)}
                                fill={`color-mix(in oklab, #d6d6d6, #92b7f8 ${mixPercent})`}
                                onClick={() => {
                                    window.location.hash = lap.x.toString();
                                }}
                            />
                        );
                    })}
                    {labelData.map((label, index) => {
                        return (
                            <Text
                                key={`label-${index}`}
                                x={xScale(label.x)}
                                y={yScale(label.y) + label.yOffset}
                                textAnchor="middle"
                                verticalAnchor="end"
                                style={{
                                    fill: '#333',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                }}
                            >
                                {label.label}
                            </Text>
                        );
                    })}
                    <LinePath
                        data={chart.heartrateLaps}
                        x={(d) => xScale(d.x) ?? 0}
                        y={(d) => yScale(d.y) ?? 0}
                        style={{
                            shapeRendering: 'geometricPrecision',
                            strokeWidth: '1.5px',
                            opacity: 0.66,
                            strokeLinecap: 'round',
                            strokeDasharray: '6px',
                        }}
                        stroke="red"
                    />
                    {chart.heartrateLaps.map((lap, index) => {
                        return (
                            <Text
                                key={`hrlabel-${index}`}
                                x={xScale(lap.x)}
                                y={yScale(lap.y) - lap.yOffset}
                                textAnchor="middle"
                                verticalAnchor="end"
                                style={{
                                    fill: '#333',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                }}
                            >
                                {lap.label}
                            </Text>
                        );
                    })}
                    {labelTicks}
                </svg>
            )}
            {averageIntervalPace && (
                <IntervalPaceContainer>
                    <span>
                        Average interval pace:{' '}
                        <strong>
                            {getPaceString(
                                averageIntervalPace || 0,
                                activityType,
                            )}
                        </strong>
                    </span>
                    <span>
                        {' '}
                        - Last 60 days:{' '}
                        <strong>
                            {getPaceString(
                                last60DaysIntervalPace || 0,
                                activityType,
                            )}
                        </strong>
                    </span>
                </IntervalPaceContainer>
            )}
        </div>
    );
}

export default LapsChart;
