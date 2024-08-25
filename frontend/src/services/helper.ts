import { Status, StatusTracker } from "@/types";

export function mergeStatusWithTracker(
    statuses: Status[],
    statusTracker: StatusTracker[]
){
    return statuses.map((status) => {
        const trackerItem = statusTracker.find(
            (item) => item.statuses.id === status.id
        );

        if (trackerItem) {
            return {
                status: status.name,
                action_at: trackerItem.action_at,
                action_by: trackerItem.profiles.name,
                complete: true,
            };
        } else {
            return {
                status: status.name,
                action_at: null,
                action_by: null,
                complete: false,
            };
        }
    });
}


export const convertUtcToBDTime = (utcTimestamp: string): string => {
    // Create a Date object from the UTC timestamp
    const offset = 0
    const date = new Date(utcTimestamp);

    // Apply the offset in hours
    const localDate = new Date(date.getTime() + offset * 60 * 60 * 1000);

    // Format the local date and time
    return localDate.toLocaleString('en-US', {
        year: 'numeric', // "2024"
        month: 'short', // "Aug"
        day: 'numeric', // "16"
        hour: '2-digit', // "01"
        minute: '2-digit', // "21"
        hour12: true // Use 12-hour clock format
    });
};