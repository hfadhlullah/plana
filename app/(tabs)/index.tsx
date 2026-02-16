import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityDetailModal from '@/components/ActivityDetailModal';
import BacklogModal from '@/components/BacklogModal';
import CreateActivityModal from '@/components/CreateActivityModal';
import EditActivityModal from '@/components/EditActivityModal';
import Sidebar from '@/components/Sidebar';
import { useBacklog } from '@/hooks/useBacklog';
import { useScheduled } from '@/hooks/useScheduled';
import { useThemeColors } from '@/hooks/useThemeColors';
import Activity, { ActivityType } from '@/model/Activity';
import { database } from '@/model/database';
import { minutesToTimestamp, minutesToTimeString } from '@/utils/timeGrid';

const HOUR_HEIGHT = 60;
const TIME_GUTTER = 40;
const TOTAL_HOURS = 24;
const SNAP = 15;

function formatHour(h: number) {
  if (h === 0) return '';
  return `${h.toString().padStart(2, '0')}.00`;
}
function snapMin(min: number) { return Math.round(min / SNAP) * SNAP; }
function minToY(min: number) { return (min / 60) * HOUR_HEIGHT; }
function yToMin(y: number) { return (y / HOUR_HEIGHT) * 60; }
function getStartMin(a: Activity) {
  if (!a.startTime) return 0;
  const d = new Date(a.startTime);
  return d.getHours() * 60 + d.getMinutes();
}

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  task: { bg: '#A67C52', border: '#8E6942' },
  event: { bg: '#5B8DEF', border: '#4A7BD8' },
  habit: { bg: '#43A680', border: '#378B6A' },
};

export default function HomeScreen() {
  const today = useMemo(() => new Date(), []);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const { scheduled, scheduleActivity, rescheduleActivity, unscheduleActivity } = useScheduled(today, refreshKey);
  const { backlog } = useBacklog();
  const colors = useThemeColors();
  const isWeb = Platform.OS === 'web';

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBacklogModal, setShowBacklogModal] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [resizeId, setResizeId] = useState<string | null>(null);
  const [resizeDeltaY, setResizeDeltaY] = useState(0);

  const dragStartY = useRef(0);
  const dragOrigMin = useRef(0);
  const resizeStartY = useRef(0);
  const resizeOrigDur = useRef(0);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const activeAct = useRef<Activity | null>(null);

  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [speedDialAnim] = useState(new Animated.Value(0));
  const [initialTypeForModal, setInitialTypeForModal] = useState<ActivityType | null>(null);

  const toggleSpeedDial = (open?: boolean) => {
    const toValue = open ?? !isSpeedDialOpen;
    setIsSpeedDialOpen(toValue);
    Animated.spring(speedDialAnim, {
      toValue: toValue ? 1 : 0,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleSpeedDialAction = (type: ActivityType | 'backlog') => {
    toggleSpeedDial(false);
    if (type === 'backlog') {
      setShowBacklogModal(true);
    } else {
      setInitialTypeForModal(type);
      setShowModal(true);
    }
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = minToY(currentMinutes);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, currentTimeTop - 150), animated: true });
    }, 400);
  }, []);

  // ── Document-level pointer listeners for drag/resize ──
  useEffect(() => {
    if (!isWeb) return;
    const onMove = (e: PointerEvent) => {
      if (isDragging.current) { e.preventDefault(); setDragOffsetY(e.clientY - dragStartY.current); }
      if (isResizing.current) { e.preventDefault(); setResizeDeltaY(e.clientY - resizeStartY.current); }
    };
    const onUp = (e: PointerEvent) => {
      if (isDragging.current && activeAct.current) {
        const dy = e.clientY - dragStartY.current;
        if (Math.abs(dy) > 5) {
          const newMin = snapMin(dragOrigMin.current + yToMin(dy));
          const clamped = Math.max(0, Math.min(newMin, 24 * 60 - activeAct.current.duration));
          rescheduleActivity(activeAct.current, minutesToTimestamp(clamped, today));
        }
        isDragging.current = false; activeAct.current = null;
        setDragId(null); setDragOffsetY(0); setScrollEnabled(true);
      }
      if (isResizing.current && activeAct.current) {
        const dy = e.clientY - resizeStartY.current;
        const newDur = snapMin(Math.max(SNAP, resizeOrigDur.current + yToMin(dy)));
        const act = activeAct.current;
        database.write(async () => { await act.update((a: any) => { a.duration = newDur; }); });
        isResizing.current = false; activeAct.current = null;
        setResizeId(null); setResizeDeltaY(0); setScrollEnabled(true);
      }
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
  }, [rescheduleActivity, today]);

  const startDrag = useCallback((act: Activity, clientY: number) => {
    isDragging.current = true; activeAct.current = act;
    dragStartY.current = clientY; dragOrigMin.current = getStartMin(act);
    setDragId(act.id); setDragOffsetY(0); setScrollEnabled(false);
  }, []);

  const startResize = useCallback((act: Activity, clientY: number) => {
    isResizing.current = true; activeAct.current = act;
    resizeStartY.current = clientY; resizeOrigDur.current = act.duration;
    setResizeId(act.id); setResizeDeltaY(0); setScrollEnabled(false);
  }, []);

  const handleSlotPress = useCallback((hour: number, quarter: number) => {
    if (!selectedActivity) return;
    const ts = minutesToTimestamp(hour * 60 + quarter * 15, today);
    scheduleActivity(selectedActivity, ts);
    setSelectedActivity(null);
  }, [selectedActivity, scheduleActivity, today]);

  const handleCreate = useCallback((title: string, type: ActivityType, duration: number, color: string | null, startTime: Date | null) => {
    const { database: db, activitiesCollection } = require('@/model/database');
    db.write(async () => {
      await activitiesCollection.create((a: any) => {
        a.title = title;
        a.type = type;
        a.status = startTime ? 'scheduled' : 'backlog';
        a.duration = duration;
        a.description = '';
        a.startTime = startTime ? startTime.getTime() : null;
        a.priority = 'medium';
        a.color = color;
      });
    });
  }, []);

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

          <View style={[styles.headerDate, { backgroundColor: colors.background }]}>
            <Text style={[styles.headerDateText, { color: colors.foreground }]}>
              {format(today, 'EEE, MMM d')}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Full-screen calendar ── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridWrap}>
          {Array.from({ length: TOTAL_HOURS }, (_, hour) => (
            <View key={hour} style={styles.hourRow}>
              <View style={styles.gutter}>
                <Text style={[styles.gutterText, { color: colors.mutedForeground }]}>
                  {formatHour(hour)}
                </Text>
              </View>
              <View style={[styles.slotsCol, { borderTopColor: colors.border }]}>
                {[0, 1, 2, 3].map((q) => (
                  <TouchableOpacity
                    key={q}
                    activeOpacity={selectedActivity ? 0.6 : 1}
                    onPress={() => handleSlotPress(hour, q)}
                    style={[
                      styles.quarterSlot,
                      { height: HOUR_HEIGHT / 4, backgroundColor: 'transparent' },
                      q === 2 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border + '50' },
                      selectedActivity && { backgroundColor: colors.primary + '08' },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Event blocks */}
          <View style={styles.eventsLayer} pointerEvents="box-none">
            {scheduled.map((activity) => {
              const startMin = getStartMin(activity);
              const beingDragged = dragId === activity.id;
              const beingResized = resizeId === activity.id;
              let top = minToY(startMin) + (beingDragged ? dragOffsetY : 0);
              let height = Math.max(minToY(activity.duration) + (beingResized ? resizeDeltaY : 0), 22);

              // Use custom color if set, otherwise use type color
              const defaultColor = TYPE_COLORS[activity.type] || TYPE_COLORS.task;
              const tc = activity.color
                ? { bg: activity.color, border: activity.color + 'DD' }
                : defaultColor;

              let preview = '';
              if (beingDragged) {
                const n = snapMin(startMin + yToMin(dragOffsetY));
                preview = minutesToTimeString(Math.max(0, Math.min(n, 1440 - activity.duration)));
              }
              if (beingResized) {
                preview = `${snapMin(Math.max(SNAP, activity.duration + yToMin(resizeDeltaY)))}m`;
              }

              return (
                <View
                  key={activity.id}
                  style={[styles.eventBlock, {
                    top, height,
                    backgroundColor: tc.bg, borderLeftColor: tc.border,
                    opacity: (beingDragged || beingResized) ? 0.85 : 1,
                    zIndex: (beingDragged || beingResized) ? 100 : 1,
                  }]}
                >
                  <TouchableOpacity
                    style={styles.eventContent}
                    activeOpacity={0.7}
                    onPress={() => setDetailActivity(activity)}
                    // @ts-ignore
                    onPointerDown={isWeb ? (e: any) => { e.stopPropagation(); startDrag(activity, e.clientY); } : undefined}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {isWeb && <Icon icon="mdi:drag" width={14} color="rgba(255,255,255,0.6)" />}
                      <Text style={styles.eventTitle} numberOfLines={1}>{activity.title}</Text>
                    </View>
                    {height > 30 && (
                      <Text style={styles.eventTime}>
                        {(beingDragged || beingResized)
                          ? preview
                          : `${minutesToTimeString(startMin)} – ${minutesToTimeString(startMin + activity.duration)}`}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View
                    style={[styles.resizeHandle, { backgroundColor: tc.border }]}
                    // @ts-ignore
                    onPointerDown={isWeb ? (e: any) => { e.stopPropagation(); startResize(activity, e.clientY); } : undefined}
                  >
                    <View style={styles.resizeGrip} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Current time line */}
          <View style={[styles.nowLine, { top: currentTimeTop }]} pointerEvents="none">
            <View style={[styles.nowDot, { backgroundColor: colors.destructive }]} />
            <View style={[styles.nowBar, { backgroundColor: colors.destructive }]} />
          </View>
        </View>
      </ScrollView>

      {/* ── Speed Dial FAB ── */}
      <View style={styles.speedDialContainer}>
        {isSpeedDialOpen && (
          <Animated.View
            style={[
              styles.speedDialBackdrop,
              {
                opacity: speedDialAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              }
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => toggleSpeedDial(false)}
              style={styles.flex1}
            />
          </Animated.View>
        )}

        <View style={styles.speedDialColumn}>
          {[
            { label: 'Task', icon: 'mdi:checkbox-marked-circle-outline', color: '#A67C52', type: 'task' as const },
            { label: 'Event', icon: 'mdi:calendar-star', color: '#5B8DEF', type: 'event' as const },
            { label: 'Habit', icon: 'mdi:refresh-circle', color: '#43A680', type: 'habit' as const },
            { label: 'Activities', icon: 'mdi:format-list-bulleted', color: colors.foreground, type: 'backlog' as const },
          ].map((item, i, arr) => {
            const translateY = speedDialAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20 * (arr.length - i), 0],
            });
            const opacity = speedDialAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            });
            const scale = speedDialAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            });

            return (
              <Animated.View
                key={item.label}
                pointerEvents={isSpeedDialOpen ? 'auto' : 'none'}
                style={[
                  styles.speedItemRow,
                  {
                    opacity,
                    transform: [{ translateY }, { scale }],
                  }
                ]}
              >
                <View style={styles.speedLabelCard}>
                  <Text style={[styles.speedLabelText, { color: '#fff' }]}>{item.label}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSpeedDialAction(item.type)}
                  style={[styles.speedItemBtn, { backgroundColor: item.color === colors.foreground ? colors.card : item.color, borderColor: colors.border }]}
                >
                  <Icon icon={item.icon} width={20} color={item.color === colors.foreground ? colors.foreground : '#fff'} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          <TouchableOpacity
            onPress={() => toggleSpeedDial()}
            style={[styles.floatingFab, { backgroundColor: colors.primary, marginBottom: 0 }]}
            activeOpacity={0.9}
          >
            <Animated.View style={{
              transform: [{
                rotate: speedDialAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg']
                })
              }]
            }}>
              <Icon icon="mdi:plus" width={26} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Floating hint banners ── */}
      {selectedActivity && (
        <View style={[styles.floatingHint, { backgroundColor: colors.card + 'F0', borderColor: colors.primary + '40' }]}>
          {isWeb && <Icon icon="mdi:gesture-tap" width={16} color={colors.primary} />}
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', flex: 1 }}>
            Tap a slot for "{selectedActivity.title}"
          </Text>
          <TouchableOpacity onPress={() => setSelectedActivity(null)}>
            <Text style={{ color: colors.destructive, fontSize: 12, fontWeight: '700' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {(dragId || resizeId) && (
        <View style={[styles.floatingHint, { backgroundColor: colors.card + 'F0', borderColor: '#5B8DEF40' }]}>
          {isWeb && <Icon icon={resizeId ? 'mdi:arrow-expand-vertical' : 'mdi:cursor-move'} width={16} color="#5B8DEF" />}
          <Text style={{ color: '#5B8DEF', fontSize: 12, fontWeight: '600' }}>
            {resizeId ? 'Resize • Release to confirm' : 'Move • Release to confirm'}
          </Text>
        </View>
      )}

      {/* ── Create Activity Modal ── */}
      <CreateActivityModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        initialType={initialTypeForModal}
      />
      <BacklogModal
        visible={showBacklogModal}
        onClose={() => setShowBacklogModal(false)}
        selectedActivity={selectedActivity}
        onSelectActivity={setSelectedActivity}
      />

      <ActivityDetailModal
        visible={!!detailActivity}
        onClose={() => setDetailActivity(null)}
        activity={detailActivity}
        onUnschedule={(act) => {
          unscheduleActivity(act);
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
  gridWrap: { position: 'relative' },
  hourRow: { flexDirection: 'row', height: HOUR_HEIGHT },
  gutter: { width: TIME_GUTTER, alignItems: 'flex-end', paddingRight: 8, marginTop: -7 },
  gutterText: { fontSize: 10, fontFamily: 'monospace' },
  slotsCol: { flex: 1, borderTopWidth: 1 },
  quarterSlot: { flex: 1 },

  eventsLayer: { position: 'absolute', top: 0, left: TIME_GUTTER + 4, right: 8, bottom: 0, zIndex: 10 },
  eventBlock: { position: 'absolute', left: 0, right: 0, borderRadius: 6, borderLeftWidth: 4, overflow: 'hidden' },
  eventContent: { flex: 1, paddingHorizontal: 8, paddingTop: 3, cursor: 'grab' as any },
  eventTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  eventTime: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 1, fontFamily: 'monospace' },
  resizeHandle: { height: 12, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, alignItems: 'center', justifyContent: 'center', cursor: 'ns-resize' as any },
  resizeGrip: { width: 30, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  unscheduleBtn: { position: 'absolute', top: 3, right: 5, padding: 2 },

  nowLine: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 20 },
  nowDot: { width: 10, height: 10, borderRadius: 5, marginLeft: TIME_GUTTER - 5 },
  nowBar: { flex: 1, height: 2 },

  // Floating elements
  floatingFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  speedDialContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
    zIndex: 100,
  },
  speedDialBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  flex1: { flex: 1 },
  speedDialColumn: {
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingBottom: 20,
    gap: 12,
  },
  speedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speedItemBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
  },
  speedLabelCard: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  speedLabelText: {
    fontSize: 14,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  floatingHint: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 50,
  },
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
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },
  headerDateText: { fontSize: 13, fontWeight: '700' },
});
