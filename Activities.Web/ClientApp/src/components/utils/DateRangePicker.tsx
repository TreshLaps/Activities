import { useEffect, useState } from 'react';
import styled from 'styled-components';

const DatePickerWrapper = styled.div`
    input {
        border-radius: 3px;
        border: thin solid #ddd;
        padding: 10px 15px;
        font-family: 'Roboto', sans-serif;
        font-size: 15px;
        line-height: 1;
        background: #fff;
        color: #000;
        font-weight: 500;

        @media (max-width: 768px) {
            padding: 8px;
            font-size: 11px;
            line-height: 1;
        }
    }
`;

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    isLoading: boolean | undefined;
    onChange: (startDate: Date, endDate: Date) => void;
}

function DateRangePicker({
    startDate,
    endDate,
    onChange,
}: DateRangePickerProps) {
    const [startDateFilter, setStartDateFilter] = useState<Date | null>(
        startDate,
    );
    const [endDateFilter, setEndDateFilter] = useState<Date | null>(endDate);

    useEffect(() => {
        if (!startDateFilter || !endDateFilter) {
            return;
        }

        onChange(startDateFilter, endDateFilter);
    }, [startDateFilter, endDateFilter, onChange]);

    return (
        <DatePickerWrapper>
            From:{' '}
            <input
                type="date"
                value={startDateFilter?.toLocaleDateString('en-CA') ?? ''}
                onChange={(e) => {
                    setStartDateFilter(new Date(e.target.valueAsNumber));
                }}
            />{' '}
            To:{' '}
            <input
                type="date"
                value={endDateFilter?.toLocaleDateString('en-CA') ?? ''}
                onChange={(e) => {
                    setEndDateFilter(new Date(e.target.valueAsNumber));
                }}
            />
        </DatePickerWrapper>
    );
}

export default DateRangePicker;
