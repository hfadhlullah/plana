import { useAuth } from '@clerk/clerk-expo';
import { Icon } from '@iconify/react';
import { Q } from '@nozbe/watermelondb';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityDetailModal from '@/components/ActivityDetailModal';
import DatePickerModal from '@/components/DatePickerModal';
import EditActivityModal from '@/components/EditActivityModal';
import Sidebar from '@/components/Sidebar';
import { useThemeColors } from '@/hooks/useThemeColors';
import Activity from '@/model/Activity';
import { activitiesCollection, database } from '@/model/database';
import { minutesToTimeString } from '@/utils/timeGrid';

const HOUR_HEIGHT = 60;
const TOTAL_HOURS = 24;
const DAY_HEADER_H = 52;
const GUTTER_W = 40;

function formatHour(h: number) {
  if (h === 0) return '';
  return `${h.toString().padStart(2, '0')}.00`;
}

function getStartMin(a: Activity) {
  if (!a.startTime) return 0;
  const d = new Date(a.startTime);
  return d.getHours() * 60 + d.getMinutes();
}

function minToY(min: number) {
  return (min / 60) * HOUR_HEIGHT;
}

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  task: { bg: '#A67C52', border: '#8E6942' },
  event: { bg: '#5B8DEF', border: '#4A7BD8' },
  habit: { bg: '#43A680', border: '#378B6A' },
};

export default function WeekScreen() {
  const colors = useThemeColors();
  const isWeb = Platform.OS === 'web';

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleUnschedule = async (activity: Activity) => {
    await database.write(async () => {
      await activity.update((a: any) => {
        a.status = 'backlog';
        a.startTime = null;
      });
    });
  };

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const [events, setEvents] = useState<Activity[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      console.log('Week view focused, refreshing...');
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      return;
    }

    const start = weekStart.getTime();
    const end = addDays(weekStart, 6).setHours(23, 59, 59, 999); // End of the last day of the week

    const query = activitiesCollection.query(
      Q.where('user_id', userId),
      Q.where('status', 'scheduled'),
      Q.where('start_time', Q.gte(start)),
      Q.where('start_time', Q.lte(end)),
    );

    const sub = query.observe().subscribe(
      (activities) => {
        setEvents(activities);
      },
      (e) => console.error('Week observer error:', e)
    );

    return () => sub.unsubscribe();
  }, [weekStart, refreshKey, userId]);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = minToY(currentMinutes);

  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, currentTimeTop - 150), animated: true });
    }, 400);
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Activity[]>();
    events.forEach((ev) => {
      if (!ev.startTime) return;
      const evDate = new Date(ev.startTime);
      const dayIdx = days.findIndex((d) => isSameDay(d, evDate));
      if (dayIdx >= 0) {
        const list = map.get(dayIdx) || [];
        list.push(ev);
        map.set(dayIdx, list);
      }
    });
    return map;
  }, [events, days]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* ── Top Header ── */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => setShowSidebar(true)}
            style={[styles.menuBtn, { backgroundColor: colors.background }]}
            activeOpacity={0.8}
          >
            {isWeb ? <Icon icon="mdi:menu" width={22} color={colors.foreground} /> : <Text style={{ fontSize: 20 }}>☰</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.headerDate, { backgroundColor: colors.background }]}
            activeOpacity={0.8}
          >
            {isWeb && <Icon icon="mdi:calendar-month" width={16} color={colors.primary} />}
            <Text style={[styles.headerDateText, { color: colors.foreground }]}>
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}
            </Text>
            {isWeb && <Icon icon="mdi:chevron-down" width={16} color={colors.mutedForeground} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Day headers (sticky) ── */}
      <View style={[styles.dayHeaderRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ width: GUTTER_W }} />
        {days.map((day, i) => {
          const isToday = isSameDay(day, now);
          return (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={[styles.dayName, { color: isToday ? colors.primary : colors.mutedForeground }]}>
                {format(day, 'EEE')}
              </Text>
              <View style={[styles.dayNumber, isToday && { backgroundColor: colors.primary }]}>
                <Text style={[styles.dayNumberText, { color: isToday ? '#fff' : colors.foreground }]}>
                  {format(day, 'd')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Calendar grid ── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridWrap}>
          {/* Hour rows */}
          {Array.from({ length: TOTAL_HOURS }, (_, hour) => (
            <View key={hour} style={styles.hourRow}>
              <View style={styles.gutter}>
                <Text style={[styles.gutterText, { color: colors.mutedForeground }]}>
                  {formatHour(hour)}
                </Text>
              </View>
              <View style={[styles.columnsRow, { borderTopColor: colors.border }]}>
                {days.map((_, di) => (
                  <View
                    key={di}
                    style={[
                      styles.dayColumn,
                      di < 6 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border + '40' },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Event blocks layer */}
          <View style={styles.eventsLayer} pointerEvents="box-none">
            {days.map((_, dayIdx) => (
              <View key={dayIdx} style={styles.dayColLayer} pointerEvents="box-none">
                {(eventsByDay.get(dayIdx) || []).map((activity) => {
                  const startMin = getStartMin(activity);
                  const top = minToY(startMin);
                  const height = Math.max(minToY(activity.duration), 18);

                  const defaultColor = TYPE_COLORS[activity.type] || TYPE_COLORS.task;
                  const tc = activity.color
                    ? { bg: activity.color, border: activity.color + 'DD' }
                    : defaultColor;

                  return (
                    <TouchableOpacity
                      key={activity.id}
                      activeOpacity={0.8}
                      onPress={() => setDetailActivity(activity)}
                      style={[
                        styles.eventBlock,
                        {
                          top,
                          height,
                          backgroundColor: tc.bg,
                          borderLeftColor: tc.border,
                        },
                      ]}
                    >
                      <Text style={styles.eventTitle} numberOfLines={1}>{activity.title}</Text>
                      {height > 24 && (
                        <Text style={styles.eventTime}>
                          {minutesToTimeString(startMin)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Current time line */}
          {days.some((d) => isSameDay(d, now)) && (
            <View style={[styles.nowLine, { top: currentTimeTop }]} pointerEvents="none">
              <View style={[styles.nowDot, { backgroundColor: colors.destructive }]} />
              <View style={[styles.nowBar, { backgroundColor: colors.destructive }]} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Date Picker Modal ── */}

      {/* ── Date Picker Modal ── */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        showTime={false}
      />

      {/* ── Activity Detail Modal ── */}
      <ActivityDetailModal
        visible={!!detailActivity}
        onClose={() => setDetailActivity(null)}
        activity={detailActivity}
        onUnschedule={(act) => {
          handleUnschedule(act);
          setDetailActivity(null);
        }}
        onEdit={(act) => {
          setEditActivity(act);
          setDetailActivity(null);
        }}
      />

      <EditActivityModal
        visible={!!editActivity}
        onClose={() => {
          setEditActivity(null);
          setRefreshKey(prev => prev + 1);
        }}
        activity={editActivity}
      />
      <Sidebar visible={showSidebar} onClose={() => setShowSidebar(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  dayHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  dayName: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: { fontSize: 14, fontWeight: '600' },

  gridWrap: { position: 'relative' },
  hourRow: { flexDirection: 'row', height: HOUR_HEIGHT },
  gutter: { width: GUTTER_W, alignItems: 'flex-end', paddingRight: 6, marginTop: -7 },
  gutterText: { fontSize: 9, fontFamily: 'monospace' },
  columnsRow: { flex: 1, flexDirection: 'row', borderTopWidth: 1 },
  dayColumn: { flex: 1 },

  eventsLayer: {
    position: 'absolute',
    top: 0,
    left: GUTTER_W,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  dayColLayer: {
    flex: 1,
    position: 'relative',
  },
  eventBlock: {
    position: 'absolute',
    left: 1,
    right: 1,
    borderRadius: 4,
    borderLeftWidth: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  eventTitle: { color: '#fff', fontSize: 10, fontWeight: '700' },
  eventTime: { color: 'rgba(255,255,255,0.7)', fontSize: 8, fontFamily: 'monospace' },

  nowLine: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', zIndex: 20,
  },
  nowDot: { width: 8, height: 8, borderRadius: 4, marginLeft: GUTTER_W - 4 },
  nowBar: { flex: 1, height: 2 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },
  headerDateText: { fontSize: 13, fontWeight: '700' },
});
