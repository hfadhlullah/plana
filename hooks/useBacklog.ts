import { useAuth } from '@clerk/clerk-expo';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';
import Activity, { ActivityType } from '../model/Activity';
import { activitiesCollection, database } from '../model/database';

export function useBacklog() {
  const [backlog, setBacklog] = useState<Activity[]>([]);

  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      setBacklog([]);
      return;
    }

    const query = activitiesCollection.query(
      Q.where('user_id', userId),
      Q.where('status', 'backlog'),
      Q.sortBy('created_at', Q.desc)
    );

    const subscription = query.observe().subscribe(
      (items) => setBacklog(items),
      (error) => console.error('Backlog observer error:', error)
    );

    return () => subscription.unsubscribe();
  }, []);

  const addActivity = async (title: string, type: ActivityType = 'task') => {
    try {
      if (!userId) return;
      await database.write(async () => {
        await activitiesCollection.create((activity) => {
          activity.userId = userId;
          activity.title = title;
          activity.type = type;
          activity.status = 'backlog';
          activity.duration = 30;
          activity.description = '';
          activity.startTime = null;
          activity.priority = 'medium';
        });
      });
    } catch (e) {
      console.error('Failed to add activity:', e);
    }
  };

  const deleteActivity = async (activity: Activity) => {
    try {
      await database.write(async () => {
        await activity.markAsDeleted();
      });
    } catch (e) {
      console.error('Failed to delete activity:', e);
    }
  };

  return { backlog, addActivity, deleteActivity };
}
