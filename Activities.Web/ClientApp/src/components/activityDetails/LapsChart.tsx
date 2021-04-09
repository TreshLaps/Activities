import React, { useState, useEffect } from 'react';
import { getPaceString, getTimeString } from '../utils/Formatters';
import Chart, { getChartData, axisTypes } from '../charts/Chart';
import { Hint, LabelSeries, VerticalBarSeries } from 'react-vis';

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

const LapsChart: React.FC<{laps: Lap[]}> = ({ laps }) => {
    const padding = 0.5;
    const [intervalLaps, setIntervalLaps] = useState<any[]>();
    const [breakLaps, setBreakLaps] = useState<any[]>();
    const [labels, setLabels] = useState<any[]>();
    const [hint, setHint] = useState<{value: any, owner: string} | null>();
    const [slowSpeed, setSlowSpeed] = useState(0.5);
    const [fastSpeed, setFastSpeed] = useState(5);
    const hasIntervalLaps = intervalLaps && intervalLaps.length > 0;

    useEffect(() => {
        if (breakLaps !== undefined) {
            return;
        }

        setIntervalLaps(getChartData<Lap>(laps.filter(l => l.isInterval), 
            (item) => item.lapIndex, 
            (item) => item.averageSpeed,
            (item) => `${item.name}\n${getPaceString(item.averageSpeed, true)}\n${item.lapIndex}`
        ));

        setBreakLaps(getChartData<Lap>(laps.filter(l => !l.isInterval), 
            (item) => item.lapIndex, 
            (item) => item.averageSpeed,
            (item) => `${item.name}\n${getPaceString(item.averageSpeed, true)}\n${item.lapIndex}`
        ));

        setLabels(getChartData<Lap>(laps,
            (item) => item.lapIndex, 
            (item) => item.averageSpeed,
            (item) => item.isInterval ? `${getPaceString(item.averageSpeed, true)}` : getTimeString(item.elapsedTime)
        ));

        var sortedBySpeed = laps.sort((l1, l2) => l1.averageSpeed - l2.averageSpeed);
        setSlowSpeed(sortedBySpeed[0].averageSpeed - padding);
        setFastSpeed(sortedBySpeed[sortedBySpeed.length - 1].averageSpeed + padding);

    }, [laps]);

    return (
        <div>
            {laps && laps.length > 1 && <Chart stack={true} height={400} xDomain={hasIntervalLaps ? [1.5, laps.length - 0.5] : [1, laps.length]} xAxisType={axisTypes.Integer} yDomain={[slowSpeed, fastSpeed]} yTickFormat={distancePerSecond => getPaceString(distancePerSecond)}>
                <VerticalBarSeries
                    barWidth={hasIntervalLaps ? 0.5 : 1}                                            
                    data={breakLaps}
                    fill="#bdc9ce"
                    stroke="#fff"
                    onValueMouseOver={(value) => setHint({value, owner: 'pace'})}
                    onValueMouseOut={() => setHint(null)}
                    onValueClick={(value) => { window.location.hash = value.x.toString(); }}
                />
                <VerticalBarSeries
                    barWidth={0.5}                                            
                    data={intervalLaps}
                    fill="#4c8eff"
                    stroke="#fff"
                    onValueMouseOver={(value) => setHint({value, owner: 'pace'})}
                    onValueMouseOut={() => setHint(null)}
                    onValueClick={(value) => { window.location.hash = value.x.toString(); }}
                />
                <LabelSeries 
                    animation
                    data={labels}
                    labelAnchorX={'middle'}
                    labelAnchorY='top'
                    style={{fontSize: 15}}
                />
                {hint?.value.label != null && hint?.owner === 'pace' && 
                    <Hint value={hint.value}>
                        <div style={{background: 'black', padding: "3px 5px", color: "white", borderRadius: "5px", fontSize: "12px", whiteSpace: "pre-line"}}>{hint.value.label}</div>
                    </Hint>
                }
            </Chart>}
        </div>
    );
}
    
export default LapsChart;