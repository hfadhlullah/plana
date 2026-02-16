import { Q } from '@nozbe/watermelondb';
import { endOfDay, startOfDay } from 'date-fns';
import { useEffect, useState } from 'react';
import Activity from '../model/Activity';
import { activitiesCollection, database } from '../model/database';

/**
 * Hook to observe scheduled activities for a specific day.
 */
export function useScheduled(date: Date = new Date(), refreshKey: number = 0) {
  const [scheduled, setScheduled] = useState<Activity[]>([]);

  useEffect(() => {
    const dayStart = startOfDay(date).getTime();
    const dayEnd = endOfDay(date).getTime();

    const query = activitiesCollection.query(
      Q.where('status', 'scheduled'),
      Q.where('start_time', Q.gte(dayStart)),
      Q.where('start_time', Q.lte(dayEnd)),
      Q.sortBy('start_time', Q.asc)
    );

    const subscription = query.observe().subscribe(
      (activities) => setScheduled(activities),
      (error) => console.error('Scheduled observer error:', error)
    );

    return () => subscription.unsubscribe();
  }, [date.toDateString(), refreshKey]);

  const scheduleActivity = async (activity: Activity, startTime: number) => {
    try {
      await database.write(async () => {
        await activity.update((a) => {
          a.status = 'scheduled';
          a.startTime = startTime;
        });
      });
    } catch (e) {
      console.error('Failed to schedule activity:', e);
    }
  };

  const unscheduleActivity = async (activity: Activity) => {
    try {
      await database.write(async () => {
        await activity.update((a) => {
          a.status = 'backlog';
          a.startTime = null;
        });
      });
    } catch (e) {
      console.error('Failed to unschedule activity:', e);
    }
  };

  const rescheduleActivity = async (activity: Activity, newStartTime: number) => {
    try {
      await database.write(async () => {
        await activity.update((a) => {
          a.startTime = newStartTime;
        });
      });
    } catch (e) {
      console.error('Failed to reschedule activity:', e);
    }
  };

  return { scheduled, scheduleActivity, unscheduleActivity, rescheduleActivity };
}
