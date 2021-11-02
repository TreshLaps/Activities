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

const isPauseLap = (lap: Lap) => {
  if (lap.movingTime < 60 && (100 / lap.elapsedTime * lap.movingTime) < 50) {
    return true;
  }

  if (lap.movingTime < 30 && (100 / lap.elapsedTime * lap.movingTime) < 30) {
    return true;
  }

  return false;
};

const LapsChart: React.FC<{ laps: Lap[] }> = ({ laps }) => {
  const [hint, setHint] = useState<{ value: any; owner: string } | null>();
  const speedPadding = 0.1;

  const sortedBySpeed = [...laps]
    .filter((lap) => isPauseLap(lap) === false)
    .sort((l1, l2) => l1.averageSpeed - l2.averageSpeed);
  const slowSpeed = sortedBySpeed[0].averageSpeed - speedPadding;
  const fastSpeed = sortedBySpeed[sortedBySpeed.length - 1].averageSpeed + speedPadding;
  const minChartHeight = (fastSpeed - slowSpeed) * 0.05;

  const chart: { laps: any[], totalMovingTime: Number } = useMemo(() => {
    const totalMovingTime = laps.map((lap) => lap.elapsedTime).reduce((l1, l2) => l1 + l2);
    const barPadding = totalMovingTime * 0.005;
    let currentMovingTime = barPadding;

    const chartLaps: any[] = laps.map((lap) => {
      const averageLapSpeed = isPauseLap(lap) ? slowSpeed + minChartHeight : lap.averageSpeed;
      const x0 = currentMovingTime;
      const x = x0 + lap.elapsedTime;
      currentMovingTime = x + barPadding;

      return {
        lap,
        x0,
        x,
        y: averageLapSpeed,
        label: isPauseLap(lap) ? '' : getPaceString(averageLapSpeed),
        hint: `Pace: ${getPaceString(lap.averageSpeed, true)}
        Distance: ${getKmString(lap.distance)}
      Duration: ${getTimeString(lap.movingTime)}
      ${lap.lactate ? `Lactate: ${lap.lactate}` : ''}`,
        color: lap.isInterval ? 1 : 0,
      };
    });

    return {
      laps: chartLaps,
      totalMovingTime: currentMovingTime,
    };
  }, [laps, slowSpeed]);

  const labelData: any[] = useMemo(() => chart.laps.map((lap) => ({
    x: lap.x0 + ((lap.x - lap.x0) / 2),
    y: lap.y,
    yOffset: -4,
    label: lap.label,
  })), [chart.laps]);

  const labelTicks: any[] = useMemo(() => chart.laps.map((lap) => ({
    x: lap.x0 + ((lap.x - lap.x0) / 2),
    y: slowSpeed,
    customComponent: () => (isPauseLap(lap.lap) ? null : (
      <text x={0} y={15} textAnchor="middle" style={{ fontSize: 10, letterSpacing: '-0.5px' }}>{getKmString(lap.lap.distance)}</text>
    )),
  })), [chart.laps]);

  return (
    <div>
      {chart.laps?.length > 1 && (
        <Chart
          stack
          height={250}
          xDomain={[0, chart.totalMovingTime]}
          xAxisType={AxisTypes.None}
          yDomain={[slowSpeed, fastSpeed]}
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
