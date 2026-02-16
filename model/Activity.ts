import { Model } from '@nozbe/watermelondb'
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators'

export type ActivityType = 'task' | 'event' | 'habit'
export type ActivityStatus = 'backlog' | 'scheduled' | 'done' | 'skipped'
export type ActivityPriority = 'low' | 'medium' | 'high'

export default class Activity extends Model {
  static table = 'activities'
  
  // @ts-ignore
  @text('user_id') userId: string
  // @ts-ignore
  @text('title') title: string
  // @ts-ignore
  @text('description') description: string
  // @ts-ignore
  @text('type') type: ActivityType
  // @ts-ignore
  @text('status') status: ActivityStatus
  // @ts-ignore
  @field('start_time') startTime: number | null
  // @ts-ignore
  @field('duration') duration: number
  // @ts-ignore
  @text('priority') priority: ActivityPriority
  // @ts-ignore
  @text('color') color: string | null

  // @ts-ignore
  @readonly @date('created_at') createdAt: Date
  // @ts-ignore
  @readonly @date('updated_at') updatedAt: Date
}
