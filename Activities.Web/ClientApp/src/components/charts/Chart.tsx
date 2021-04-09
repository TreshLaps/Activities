import React, {  } from 'react';
import {AutoSizer} from 'react-virtualized'; 
import {XYPlot, XAxis, YAxis, HorizontalGridLines, RVTickFormat} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';

export enum axisTypes {
    Number,
    Integer,
    Date,
    None
};

interface ChartProps {
    children: any;
    height?: number;
    xAxisType?: axisTypes;
    xType?: string;
    xDomain?: any;
    yDomain?: any;
    stack?: boolean;
    yTickFormat?: RVTickFormat | undefined;
};

const Chart: React.FC<ChartProps> = (props) => {
    const { children, height, xAxisType, stack, xDomain, yDomain, xType, yTickFormat } = props;
    const hideXAxis = xAxisType === undefined || xAxisType === axisTypes.None;

    return (
        <div style={{margin: "-10px", marginTop: "0px"}}>
            <AutoSizer disableHeight={true}>
                {(size) => 
                    (<XYPlot height={height || 200} width={size.width} stackBy={stack ? 'y' : undefined} xDomain={xDomain} yDomain={yDomain} xType={xType} margin={{left: 40, right: 10, top: 10, bottom: (hideXAxis ? 10 : 40)}}>
                        <HorizontalGridLines />
                        <YAxis tickFormat={yTickFormat} />
                        {xAxisType === axisTypes.Date && <XAxis tickFormat={v => (new Date(v)).toUTCString().substr(8,8)} tickLabelAngle={30} tickPadding={30} />}
                        {(xAxisType === axisTypes.Number) && <XAxis tickLabelAngle={30} tickPadding={30} />}
                        {(xAxisType === axisTypes.Integer) && <XAxis tickFormat={val => Math.round(val) === val ? val : ""} />}
                        {hideXAxis && <XAxis hideTicks />}
                        {children}
                    </XYPlot>)
                }
            </AutoSizer>                    
        </div>
    );
}

export function getChartData<T>(
    data: T[], 
    getX: (item: T) => Number | Date | String, 
    getY: (item: T) => Number, 
    getLabel?: (item: T) => String,
) {
    return data.map((item) => {
        return {
            x: getX(item),            
            y: getY(item),            
            label: getLabel?.(item)
        }
    })
}
    
export default Chart;