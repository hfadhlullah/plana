/**
 * Time Grid Utilities
 *
 * Converts between Y pixel positions and time values for the Day View calendar.
 */

// Each hour is represented by this many pixels in the timeline
export const HOUR_HEIGHT = 80;

// Total hours displayed
export const TOTAL_HOURS = 24;

// Snap increment in minutes
export const SNAP_MINUTES = 15;

// Total height of the timeline
export const TIMELINE_HEIGHT = HOUR_HEIGHT * TOTAL_HOURS;

/**
 * Convert a Y position (pixels from top of timeline) to minutes since midnight.
 */
export function yToMinutes(y: number): number {
  const totalMinutes = (y / HOUR_HEIGHT) * 60;
  return Math.max(0, Math.min(totalMinutes, TOTAL_HOURS * 60 - 1));
}

/**
 * Snap minutes to the nearest SNAP_MINUTES increment.
 */
export function snapMinutes(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

/**
 * Convert minutes since midnight to a Y position.
 */
export function minutesToY(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

/**
 * Convert minutes since midnight to a formatted time string.
 */
export function minutesToTimeString(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}.${mins.toString().padStart(2, '0')}`;
}

/**
 * Convert a Date timestamp to minutes since midnight.
 */
export function timestampToMinutes(timestamp: number): number {
  const date = new Date(timestamp);
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Convert minutes since midnight to a Date timestamp for a given day.
 */
export function minutesToTimestamp(minutes: number, dayDate: Date = new Date()): number {
  const date = new Date(dayDate);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date.getTime();
}

/**
 * Generate hour labels for the timeline.
 */
export function generateHourLabels(): string[] {
  const labels: string[] = [];
  for (let i = 0; i < TOTAL_HOURS; i++) {
    labels.push(minutesToTimeString(i * 60));
  }
  return labels;
}
