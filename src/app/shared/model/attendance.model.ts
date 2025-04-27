export interface Attendance {
    sNo: number;
    id: number;
    employeeId: number;
    restaurantId: number;
    clockInTime: string;  // ISO datetime string
    clockOutTime: string; // ISO datetime string
    totalHours: number;
    status: string;
    remarks: string;
    createdDate: string;  // ISO datetime string
    isSelected?: boolean;
}

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    HALF_DAY = 'HALF_DAY',
    ON_LEAVE = 'ON_LEAVE',
    HOLIDAY = 'HOLIDAY'
}
