import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'activities',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'type', type: 'string' }, // 'task', 'event', 'habit'
        { name: 'status', type: 'string' }, // 'backlog', 'scheduled', 'done'
        { name: 'start_time', type: 'number', isOptional: true },
        { name: 'duration', type: 'number' },
        { name: 'priority', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})
