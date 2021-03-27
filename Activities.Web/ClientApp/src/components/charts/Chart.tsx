import React, {  } from 'react';
import {AutoSizer} from 'react-virtualized'; 
import {XYPlot, XAxis, YAxis, HorizontalGridLines} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';

export enum axisTypes {
    Number,
    Date
};

interface ChartProps {
    children: any;
    height?: number;
    xAxisType?: axisTypes;
    xType?: string;
    yDomain?: any;
    stack?: boolean;
};

const Chart: React.FC<ChartProps> = (props) => {
    const { children, height, xAxisType, stack, yDomain, xType } = props;

    return (
        <div>
            <AutoSizer disableHeight={true}>
                {(size) => 
                    (<XYPlot height={height || 300} width={size.width} stackBy={stack ? 'y' : undefined} yDomain={yDomain} xType={xType}>
                        <HorizontalGridLines />
                        <YAxis />
                        {xAxisType === axisTypes.Date && <XAxis tickFormat={v => (new Date(v)).toUTCString().substr(8,8)} tickLabelAngle={30} tickPadding={30} />}
                        {(xAxisType == null || xAxisType === axisTypes.Number) && <XAxis />}
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
    getLabel?: (item: T) => String
) {
    return data.map((item) => {
        return {
            x: getX(item),            
            y: getY(item),            
            label: getLabel && getLabel(item)
        }
    })
}
    
export default Chart;