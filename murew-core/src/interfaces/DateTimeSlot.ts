export interface DateTimeSlot{
    id: string;
    day: Day;
    time_slots: TimeSlot[];
}

export interface TimeSlot{
    id: string;
    time: string;
}

export enum Day{
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday',
}

export const Days = Object.freeze([
    Day.Sunday,
    Day.Monday,
    Day.Tuesday,
    Day.Wednesday,
    Day.Thursday,
    Day.Friday,
    Day.Saturday
])