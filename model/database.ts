import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';
import { Platform } from 'react-native';

import Activity from './Activity';
import { mySchema } from './schema';

const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        {
          type: 'add_columns',
          table: 'activities',
          columns: [
            { name: 'color', type: 'string', isOptional: true },
          ],
        },
      ],
    },
  ],
});

let adapter;

if (Platform.OS === 'web') {
  adapter = new LokiJSAdapter({
    schema: mySchema,
    migrations,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
  });
} else {
  adapter = new SQLiteAdapter({
    schema: mySchema,
    migrations,
    dbName: 'slotify_db',
    jsi: true,
    onSetUpError: error => {
      console.error('Database setup failed', error);
    }
  });
}

export const database = new Database({
  adapter,
  modelClasses: [
    Activity,
  ],
});

export const activitiesCollection = database.get<Activity>('activities');
