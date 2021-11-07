import React, { useState, useMemo } from 'react';
import {
  CustomSVGSeries,
  Hint, LabelSeries, LineSeries, VerticalRectSeries,
} from 'react-vis';
import styled from 'styled-components';
import {
  getKmString, getMetersPerSecond, getPaceString, getTimeString,
} from '../utils/Formatters';
import Chart, { AxisTypes } from '../charts/Chart';

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
    ((index > 0 && laps[index - 1].isInterval)
    || (index < laps.length - 1 && laps[index + 1].isInterval))
    && laps[index].distance < 500) {
    return true;
  }

  return false;
};

const NormalizeChartData = (
  data: any[],
  minValue?: number | undefined,
  maxValue?: number | undefined,
) => {
  const sortedData = [...data].sort((a, b) => a.y - b.y);
  const min = minValue ? Math.min(minValue, sortedData[0].y) : sortedData[0].y;
  const max = maxValue ? Math.max(maxValue, sortedData[sortedData.length - 1].y) : sortedData[sortedData.length - 1].y;

  return data.map((item) => ({
    ...item,
    y: (item.y - min) / (max - min),
  }));
};

const LapsChart: React.FC<{
  laps: Lap[],
  averageIntervalPace: number | undefined,
  last60DaysIntervalPace: number | undefined
}> = ({ laps, averageIntervalPace, last60DaysIntervalPace }) => {
  const [hint, setHint] = useState<{ value: any; owner: string } | null>();
  const speedPadding = 0.1;

  const sortedBySpeed = [...laps]
    .filter((lap, lapIndex) => isPauseLap(lapIndex, laps) === false)
    .sort((l1, l2) => l1.averageSpeed - l2.averageSpeed);
  const slowSpeed = sortedBySpeed[0].averageSpeed - speedPadding;
  const fastSpeed = sortedBySpeed[sortedBySpeed.length - 1].averageSpeed + speedPadding;
  const minChartHeight = (fastSpeed - slowSpeed) * 0.05;

  const chart: {
    laps: any[],
    heartrateLaps: any[],
    totalMovingTime: number,
    barPadding: number
  } = useMemo(() => {
    const totalMovingTime = laps.map((lap) => lap.elapsedTime).reduce((l1, l2) => l1 + l2);
    const barPadding = totalMovingTime * 0.005;
    let currentMovingTime = 0.0;

    const chartLaps: any[] = laps.map((lap, lapIndex) => {
      const averageLapSpeed = isPauseLap(lapIndex, laps) ? slowSpeed + minChartHeight : lap.averageSpeed;
      const x0 = currentMovingTime;
      const x = x0 + lap.elapsedTime;
      currentMovingTime = x + barPadding;

      return {
        lap,
        x0,
        x,
        y: averageLapSpeed,
        yHeartrate: lap.averageHeartrate,
        label: isPauseLap(lapIndex, laps) ? '' : getPaceString(averageLapSpeed),
        hint: `Pace: ${getPaceString(lap.averageSpeed, true)}
        Heartrate: ${lap.averageHeartrate}
        Distance: ${getKmString(lap.distance)}
      Duration: ${getTimeString(lap.elapsedTime)} (Moving time: ${getTimeString(lap.movingTime)})
      ${lap.lactate ? `Lactate: ${lap.lactate}` : ''}`,
        color: lap.isInterval ? 1 : 0,
      };
    });

    const chartLapsHeartrate: any[] = chartLaps
      .filter((lap) => lap.lap.isInterval)
      .map((lap) => ({
        x: lap.x0 + ((lap.x - lap.x0) / 2),
        y: lap.yHeartrate,
        yOffset: 8,
        label: `${parseInt(lap.yHeartrate, 10)}`,
      }));

    return {
      laps: NormalizeChartData(chartLaps),
      heartrateLaps: NormalizeChartData(chartLapsHeartrate, 150, 190),
      totalMovingTime: currentMovingTime - barPadding,
      barPadding,
    };
  }, [laps, slowSpeed]);

  const labelData: any[] = useMemo(() => chart.laps.map((lap) => ({
    x: lap.x0 + ((lap.x - lap.x0) / 2),
    y: lap.y,
    yOffset: -4,
    label: lap.label,
  })), [chart.laps]);

  const labelTicks: any[] = useMemo(() => chart.laps
    .filter((_, index) => !isPauseLap(index, chart.laps.map((chartLap) => chartLap.lap)))
    .map((lap) => ({
      x: lap.x0 + ((lap.x - lap.x0) / 2),
      y: 0,
      customComponent: () => (
        <text x={0} y={25} textAnchor="middle" style={{ fontSize: 10, letterSpacing: '-0.5px' }}>{getKmString(lap.lap.distance)}</text>
      ),
    })), [chart.laps]);

  const averageIntervalPaceData: any[] = useMemo(() => [{
    x: 0,
    y: averageIntervalPace,
    customComponent: () => (
      <line x1="0" y1="0" x2="100%" y2="0" stroke="#92b7f8" strokeDasharray="4" />
    ),
  },
  {
    x: 0,
    y: last60DaysIntervalPace,
    customComponent: () => (
      <line x1="0" y1="0" x2="100%" y2="0" stroke="#d6d6d6" strokeDasharray="4" />
    ),
  }], [averageIntervalPace, last60DaysIntervalPace, chart]);

  return (
    <div>
      {chart.laps?.length > 1 && (
        <Chart
          height={300}
          xDomain={[0, chart.totalMovingTime]}
          xAxisType={AxisTypes.None}
          yDomain={[-0.05, 1.05]}
          yTickFormat={(distancePerSecond) => getPaceString(distancePerSecond)}
          margin={{ bottom: 15 }}
          hideYAxis
        >
          <VerticalRectSeries
            data={chart.laps}
            onValueMouseOver={(value) => setHint({ value, owner: 'pace' })}
            onValueMouseOut={() => setHint(null)}
            onValueClick={(value) => {
              window.location.hash = value.x.toString();
            }}
            stroke="0"
            colorRange={[
              '#d6d6d6',
              '#92b7f8',
            ]}
          />
          <LabelSeries
            data={labelData}
            labelAnchorX="middle"
            labelAnchorY="top"
            style={{ fontSize: 10, textShadow: '0 0 1px white, 0 0 2px white, 0 0 3px white' }}
          />
          <LineSeries
            data={chart.heartrateLaps}
            style={{
              shapeRendering: 'geometricPrecision', strokeWidth: '1.5px', opacity: 0.66, strokeLinecap: 'round', strokeDasharray: '6px',
            }}
            stroke="red"
          />
          <LabelSeries
            data={chart.heartrateLaps}
            labelAnchorX="middle"
            labelAnchorY="middle"
            style={{ fontSize: 8, textShadow: '0 0 1px white' }}
          />
          {false && averageIntervalPace && <CustomSVGSeries data={averageIntervalPaceData} />}
          <CustomSVGSeries data={labelTicks} />
          {hint?.value.hint != null && hint?.owner === 'pace' && (
            <Hint value={hint.value}>
              <div
                style={{
                  background: 'white',
                  boxShadow: '1px 1px 6px rgba(0,0,0, 0.5), 1px 1px 4px rgba(0,0,0, 0.3)',
                  padding: '7px 10px',
                  color: 'black',
                  borderRadius: '2px',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}
              >
                {hint.value.hint}
              </div>
            </Hint>
          )}
        </Chart>
      )}
      {averageIntervalPace && (
        <IntervalPaceContainer>
          <span>Average interval pace: <strong>{getPaceString(averageIntervalPace || 0)}</strong></span>
          <span> - Last 60 days: <strong>{getPaceString(last60DaysIntervalPace || 0)}</strong></span>
        </IntervalPaceContainer>
      )}
    </div>
  );
};

export default LapsChart;
