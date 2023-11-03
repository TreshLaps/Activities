import React from 'react';
import { AutoSizer } from 'react-virtualized';
import {
    XYPlot,
    XAxis,
    YAxis,
    HorizontalGridLines,
    RVTickFormat,
    Margin,
} from 'react-vis';
import '../../../node_modules/react-vis/dist/style.css';

export enum AxisTypes {
    Number,
    Integer,
    Date,
    None,
}

interface ChartProps {
    children: React.ReactNode;
    height?: number;
    xAxisType?: AxisTypes;
    xType?: string;
    xDomain?: unknown;
    yDomain?: unknown;
    stack?: boolean;
    yTickFormat?: RVTickFormat | undefined;
    margin?: Margin;
    hideYAxis?: boolean | undefined;
}

const Chart: React.FC<ChartProps> = (props) => {
    const {
        children,
        height,
        xAxisType,
        stack,
        xDomain,
        yDomain,
        xType,
        yTickFormat,
        hideYAxis,
    } = props;
    const hideXAxis = xAxisType === undefined || xAxisType === AxisTypes.None;
    const defaultMargins = {
        left: hideYAxis ? 5 : 40,
        right: 5,
        top: 10,
        bottom: hideXAxis ? 10 : 40,
    };

    return (
        <div style={{ margin: '-10px', marginTop: '0px' }}>
            <AutoSizer disableHeight>
                {(size) => (
                    <XYPlot
                        height={Math.min(height || 200, size.width * 0.66)}
                        width={size.width}
                        stackBy={stack ? 'y' : undefined}
                        xDomain={xDomain}
                        yDomain={yDomain}
                        xType={xType}
                        margin={{ ...defaultMargins, ...props.margin }}
                        style={{ shapeRendering: 'crispEdges' }}
                    >
                        <HorizontalGridLines />
                        <YAxis
                            tickFormat={yTickFormat}
                            hideTicks={hideYAxis}
                            hideLine={hideYAxis}
                        />
                        {xAxisType === AxisTypes.Date && (
                            <XAxis
                                tickFormat={(v) =>
                                    new Date(v).toUTCString().substr(8, 8)
                                }
                                tickLabelAngle={30}
                                tickPadding={30}
                            />
                        )}
                        {xAxisType === AxisTypes.Number && (
                            <XAxis tickLabelAngle={30} tickPadding={30} />
                        )}
                        {xAxisType === AxisTypes.Integer && (
                            <XAxis
                                tickFormat={(val: number) =>
                                    Math.round(val) === val
                                        ? val.toString()
                                        : ''
                                }
                            />
                        )}
                        {hideXAxis && <XAxis hideTicks />}
                        {children}
                    </XYPlot>
                )}
            </AutoSizer>
        </div>
    );
};

export interface DynamicChartData {
    x: number | string | Date;
    y: number | string | Date;
    label?: string;
}

export interface ChartData {
    x: number | string;
    y: number;
    label?: string;
}

export interface NumericChartData {
    x: number;
    y: number;
    label?: string;
}

export function getChartData<T>(
    data: T[],
    getX: (item: T) => number | string,
    getY: (item: T) => number,
    getLabel?: (item: T) => string
): ChartData[] {
    return data.map((item) => ({
        x: getX(item),
        y: getY(item),
        label: getLabel?.(item),
    }));
}

export default Chart;
