// shift.model.ts

export interface ShiftDayWeek {
    week: string; // e.g., "1st", "2nd", "All", etc.
}

export interface ShiftDay {
    day: string;              // e.g., "Monday"
    isEnabled: boolean;
    weeks: ShiftDayWeek[];
}

export interface ShiftBreak {
    breakStartTime: string;   // ISO time string, e.g., "13:00:00"
    breakEndTime: string;     // ISO time string
}

export interface Shift {
    shiftId?: number;         // Nullable for creation
    restaurantId: number;
    shiftName: string;
    startTime: string;        // ISO time string, e.g., "09:00:00"
    endTime: string;          // ISO time string
    weekOff: string;
    recurring: boolean;
    status: boolean;
    weekdays: ShiftDay[];
    breakTimings: ShiftBreak[];
}
