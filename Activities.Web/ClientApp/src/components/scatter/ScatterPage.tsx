import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import '../../../node_modules/react-vis/dist/style.css';
import { AutoSizer } from 'react-virtualized';
import {
  ChartLabel, HexbinSeries, HorizontalGridLines, VerticalGridLines, XAxis, XYPlot, YAxis,
} from 'react-vis';
import Loader, { LoadingStatus } from '../utils/Loader';
import ActivityFilter, { getUrlWithFilters, Filters } from '../utils/ActivityFilter';
import { Box, Dropdown, StackContainer } from '../../styles/styles';
import { getPaceString } from '../utils/Formatters';

interface Item {
  distance: number;
  elapsedTime: number;
  movingTime: number;
  pace: number;
  averageHeartrate: number;
  maxHeartrate: number;
}

interface Axis {
  format: ((value: number) => string) | undefined;
  min: number | undefined;
  max: number | undefined;
}

const getAxisSettings = (key: string, lockAxisFilter: boolean): Axis => {
  if (key === 'pace') {
    return {
      format: (value: number) => getPaceString(value),
      min: lockAxisFilter ? 3.7 : undefined,
      max: lockAxisFilter ? 5.5 : undefined,
    };
  }
  if (key === 'averageHeartrate' || key === 'maxHeartrate') {
    return {
      format: undefined,
      min: 100,
      max: 190,
    };
  }

  return {
    format: undefined,
    min: undefined,
    max: undefined,
  };
};

const defaultYAxis = 'averageHeartrate';
const defaultXAxis = 'pace';

const ScatterPage: React.FC = () => {
  const { yAxis, xAxis } = queryString.parse(window.location.search);
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.None);
  const [filters, setFilters] = useState<Filters>();
  const [items, setItems] = useState<Item[]>();
  const [yAxisFilter, setYAxisFilter] = useState(typeof yAxis === 'string' ? yAxis : defaultYAxis);
  const [xAxisFilter, setXAxisFilter] = useState(typeof xAxis === 'string' ? xAxis : defaultXAxis);
  const [lockAxisFilter] = useState(false);

  useEffect(() => {
    if (filters === undefined) {
      return;
    }

    setLoadingStatus(LoadingStatus.Loading);

    fetch(getUrlWithFilters('/api/scatter/', filters))
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
        return response.json() as Promise<Item[]>;
      })
      .then((data) => {
        setItems(data);
        setLoadingStatus(LoadingStatus.None);
      })
      .catch(() => {
        setItems([]);
        setLoadingStatus(LoadingStatus.Error);
      });
  }, [filters]);

  const data = items?.map((item: any) => ({
    x: Number(item[xAxisFilter]),
    y: Number(item[yAxisFilter]),
  }));

  const yAxisSettings = getAxisSettings(yAxisFilter, lockAxisFilter);
  const xAxisSettings = getAxisSettings(xAxisFilter, lockAxisFilter);

  return (
    <div>
      <ActivityFilter onChange={setFilters} />
      <Loader status={loadingStatus} />
      {loadingStatus === LoadingStatus.None && items && (
        <div>
          <StackContainer>
            <Dropdown
              defaultValue={yAxisFilter}
              onChange={(v) => {
                setYAxisFilter(v.currentTarget.value);
              }}
            >
              <option value="distance">Distance</option>
              <option value="elapsedTime">Elapsed time</option>
              <option value="movingTime">Moving time</option>
              <option value="pace">Pace</option>
              <option value="averageHeartrate">Average heartrate</option>
              <option value="maxHeartrate">Max heartrate</option>
            </Dropdown>
            <Dropdown
              defaultValue={xAxisFilter}
              onChange={(v) => {
                setXAxisFilter(v.currentTarget.value);
              }}
            >
              <option value="distance">Distance</option>
              <option value="elapsedTime">Elapsed time</option>
              <option value="movingTime">Moving time</option>
              <option value="pace">Pace</option>
              <option value="averageHeartrate">Average heartrate</option>
              <option value="maxHeartrate">Max heartrate</option>
            </Dropdown>
          </StackContainer>
          <Box style={{ height: '80vh' }}>
            <AutoSizer>
              {(size) => (
                <XYPlot
                  width={size.width}
                  height={size.height}
                  xDomain={((xAxisSettings.min !== undefined && xAxisSettings.max !== undefined)
                    ? [xAxisSettings.min, xAxisSettings.max]
                    : undefined)}
                  yDomain={((yAxisSettings.min !== undefined && yAxisSettings.max !== undefined)
                    ? [yAxisSettings.min, yAxisSettings.max]
                    : undefined)}
                >
                  <HorizontalGridLines />
                  <VerticalGridLines />
                  <HexbinSeries
                    sizeHexagonsWithCount
                    className="hexbin-size-example"
                    radius={15}
                    data={data}
                    style={{
                      stroke: '#124890',
                      strokeWidth: '1px',
                    }}
                    colorRange={['#124890', '#124890']}
                  />
                  <XAxis tickFormat={xAxisSettings.format} />
                  <YAxis tickFormat={yAxisSettings.format} />
                  <ChartLabel
                    text={xAxisFilter}
                    className="alt-x-label"
                    xPercent={(1.0 / size.width * (size.width - 8))}
                    yPercent={(1.0 / size.height * (size.height - 85))}
                    style={{
                      transform: 'rotate(90)',
                      textAnchor: 'end',
                    }}
                  />

                  <ChartLabel
                    text={yAxisFilter}
                    className="alt-y-label"
                    xPercent={(1.0 - (1.0 / size.width * (size.width - 50)))}
                    yPercent={(1.0 - (1.0 / size.height * (size.height - -15)))}
                    style={{
                      textAnchor: 'start',
                    }}
                  />
                </XYPlot>
              )}
            </AutoSizer>
          </Box>
        </div>
      )}
    </div>
  );
};

export default ScatterPage;
