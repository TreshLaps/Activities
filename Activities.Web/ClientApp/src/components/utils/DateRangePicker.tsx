import React, { useEffect, useState } from 'react';
import { DateRangeInput, START_DATE, END_DATE } from '@datepicker-react/styled';
import styled, { ThemeProvider } from 'styled-components';

const DatePickerWrapper = styled.div`
  label {
    width: 110px;
  }
`;

interface DateRangePickerProps{
  startDate: Date | null;
  endDate: Date | null;
  isLoading: boolean | undefined;
  onChange: (startDate: Date, endDate: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = (props) => {
  const { startDate, endDate, onChange } = props;
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(startDate);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(endDate);
  const [datepickerFocus, setDatepickerFocus] = useState<typeof START_DATE | typeof END_DATE | null>(null);

  useEffect(() => {
    if (!startDateFilter || !endDateFilter) {
      return;
    }

    onChange(startDateFilter, endDateFilter);
  }, [startDateFilter, endDateFilter, onChange]);

  return (
    <ThemeProvider
      theme={{
        reactDatepicker: {
          fontFamily: 'Roboto, sans-serif',
          inputLabelBorder: 'thin solid #ddd',
          inputLabelBorderRadius: '3px',
          dateRangeStartDateInputPadding: '10px 15px',
          dateRangeEndDateInputPadding: '10px 15px',
          inputFontSize: '15px',
          inputActiveBoxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1)',
          inputCalendarIconWidth: '0',
          dateRangeGridTemplateColumns: '1fr 10px 1fr',
        },
      }}
    >
      <DatePickerWrapper>
        <DateRangeInput
          onDatesChange={(data: any) => {
            setStartDateFilter(data.endDate);
            setEndDateFilter(data.startDate);
            setDatepickerFocus(datepickerFocus === START_DATE ? END_DATE : START_DATE);
          }}
          onFocusChange={(data: any) => { setDatepickerFocus(data); }}
          startDate={endDateFilter}
          endDate={startDateFilter}
          focusedInput={datepickerFocus}
          displayFormat="dd.MM.yyyy"
          showClose={false}
          showResetDates={false}
          maxBookingDate={new Date()}
          numberOfMonths={1}
        />
      </DatePickerWrapper>
    </ThemeProvider>
  );
};

export default DateRangePicker;
