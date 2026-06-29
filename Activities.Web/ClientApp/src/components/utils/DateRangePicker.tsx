import { useEffect, useState } from 'react';
import styles from './DateRangePicker.module.css';

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
        <div className={styles.datePickerWrapper}>
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
        </div>
    );
}

export default DateRangePicker;
