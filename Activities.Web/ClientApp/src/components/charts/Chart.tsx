import React, {  } from 'react';
import {AutoSizer} from 'react-virtualized'; 
import {XYPlot, XAxis, YAxis, HorizontalGridLines, RVTickFormat} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';

export enum axisTypes {
    Number,
    Date,
    None
};

interface ChartProps {
    children: any;
    height?: number;
    xAxisType?: axisTypes;
    xType?: string;
    yDomain?: any;
    stack?: boolean;
    yTickFormat?: RVTickFormat | undefined;
};

const Chart: React.FC<ChartProps> = (props) => {
    const { children, height, xAxisType, stack, yDomain, xType, yTickFormat } = props;

    return (
        <div>
            <AutoSizer disableHeight={true}>
                {(size) => 
                    (<XYPlot height={height || 250} width={size.width} stackBy={stack ? 'y' : undefined} yDomain={yDomain} xType={xType}>
                        <HorizontalGridLines />
                        <YAxis tickFormat={yTickFormat} />
                        {xAxisType === axisTypes.Date && <XAxis tickFormat={v => (new Date(v)).toUTCString().substr(8,8)} tickLabelAngle={30} tickPadding={30} />}
                        {(xAxisType === axisTypes.Number) && <XAxis tickLabelAngle={30} tickPadding={30} />}
                        {(xAxisType == undefined || xAxisType === axisTypes.None) && <XAxis hideTicks />}
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