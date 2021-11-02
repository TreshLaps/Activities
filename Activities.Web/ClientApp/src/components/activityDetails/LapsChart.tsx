import React, { useState, useMemo } from 'react';
import {
  CustomSVGSeries,
  Hint, LabelSeries, VerticalRectSeries,
} from 'react-vis';
import { getKmString, getPaceString, getTimeString } from '../utils/Formatters';
import Chart, { AxisTypes } from '../charts/Chart';

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
  if (index > 0
    && index < laps.length - 1
    && laps[index - 1].isInterval
    && laps[index + 1].isInterval) {
    return true;
  }

  if (laps[index].movingTime < 30 && (100 / laps[index].elapsedTime * laps[index].movingTime) < 50) {
    return true;
  }

  return false;
};

const LapsChart: React.FC<{ laps: Lap[], averageIntervalPace: number | undefined }> = ({ laps, averageIntervalPace }) => {
  const [hint, setHint] = useState<{ value: any; owner: string } | null>();
  const speedPadding = 0.1;

  const sortedBySpeed = [...laps]
    .filter((lap, lapIndex) => isPauseLap(lapIndex, laps) === false)
    .sort((l1, l2) => l1.averageSpeed - l2.averageSpeed);
  const slowSpeed = sortedBySpeed[0].averageSpeed - speedPadding;
  const fastSpeed = sortedBySpeed[sortedBySpeed.length - 1].averageSpeed + speedPadding;
  const minChartHeight = (fastSpeed - slowSpeed) * 0.05;

  const chart: { laps: any[], totalMovingTime: number, barPadding: number } = useMemo(() => {
    const totalMovingTime = laps.map((lap) => lap.elapsedTime).reduce((l1, l2) => l1 + l2);
    const barPadding = totalMovingTime * 0.005;
    let currentMovingTime = barPadding;

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
        label: isPauseLap(lapIndex, laps) ? '' : getPaceString(averageLapSpeed),
        hint: `Pace: ${getPaceString(lap.averageSpeed, true)}
        Distance: ${getKmString(lap.distance)}
      Duration: ${getTimeString(lap.elapsedTime)} (Moving time: ${getTimeString(lap.movingTime)})
      ${lap.lactate ? `Lactate: ${lap.lactate}` : ''}`,
        color: lap.isInterval ? 1 : 0,
      };
    });

    return {
      laps: chartLaps,
      totalMovingTime: currentMovingTime,
      barPadding,
    };
  }, [laps, slowSpeed]);

  const labelData: any[] = useMemo(() => chart.laps.map((lap) => ({
    x: lap.x0 + ((lap.x - lap.x0) / 2),
    y: lap.y,
    yOffset: -4,
    label: lap.label,
  })), [chart.laps]);

  const labelTicks: any[] = useMemo(() => chart.laps.map((lap, lapIndex) => ({
    x: lap.x0 + ((lap.x - lap.x0) / 2),
    y: slowSpeed,
    customComponent: () => {
      if (lapIndex > 0
        && lapIndex < chart.laps.length - 1
        && chart.laps[lapIndex - 1].lap.isInterval
        && chart.laps[lapIndex + 1].lap.isInterval) {
        return null;
      }

      return (
        <text x={0} y={15} textAnchor="middle" style={{ fontSize: 10, letterSpacing: '-0.5px' }}>{getKmString(lap.lap.distance)}</text>
      );
    },
  })), [chart.laps]);

  const averageIntervalPaceData: any[] = useMemo(() => [{
    x: 0,
    y: averageIntervalPace,
    customComponent: () => (
      <g>
        <text
          x={0}
          y={3}
          textAnchor="left"
          fill="#668ecc"
          style={{ fontSize: 10, letterSpacing: '-0.5px' }}
        >{getPaceString(averageIntervalPace || 0)}
        </text>
        <line x1="22" y1="0" x2={chart.totalMovingTime} y2="0" stroke="#92b7f8" strokeDasharray="4" />
      </g>
    ),
  }], [averageIntervalPace, chart]);

  return (
    <div>
      {chart.laps?.length > 1 && (
        <Chart
          stack
          height={300}
          xDomain={[0, chart.totalMovingTime]}
          xAxisType={AxisTypes.None}
          yDomain={[slowSpeed, fastSpeed]}
          yTickFormat={(distancePerSecond) => getPaceString(distancePerSecond)}
          margin={{ bottom: 15 }}
          hideYAxis
        >
          {averageIntervalPace && <CustomSVGSeries data={averageIntervalPaceData} />}
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
    </div>
  );
};

export default LapsChart;
