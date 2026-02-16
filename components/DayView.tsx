import { useThemeColors } from '@/hooks/useThemeColors';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Activity from '../model/Activity';
import {
    HOUR_HEIGHT,
    TOTAL_HOURS,
    generateHourLabels,
    minutesToY,
    timestampToMinutes,
} from '../utils/timeGrid';

interface ScheduledBlockProps {
    activity: Activity;
    primaryColor: string;
    primaryFg: string;
    borderColor: string;
}

function ScheduledBlock({ activity, primaryColor, primaryFg, borderColor }: ScheduledBlockProps) {
    const minutes = activity.startTime ? timestampToMinutes(activity.startTime) : 0;
    const top = minutesToY(minutes);
    const height = Math.max(minutesToY(activity.duration), 24);

    return (
        <View
            style={[
                styles.scheduledBlock,
                {
                    top,
                    height,
                    backgroundColor: primaryColor,
                    borderColor,
                },
            ]}
        >
            <Text style={[styles.blockTitle, { color: primaryFg }]} numberOfLines={1}>
                {activity.title}
            </Text>
            {height > 30 && (
                <Text style={[styles.blockDuration, { color: primaryFg }]}>
                    {activity.duration}m
                </Text>
            )}
        </View>
    );
}

interface DayViewProps {
    scheduled: Activity[];
}

export default function DayView({ scheduled }: DayViewProps) {
    const hourLabels = generateHourLabels();
    const scrollRef = useRef<ScrollView>(null);
    const colors = useThemeColors();

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentTimeTop = minutesToY(currentMinutes);

    // Auto-scroll to current time
    React.useEffect(() => {
        const scrollTo = minutesToY(currentMinutes) - 100;
        setTimeout(() => {
            scrollRef.current?.scrollTo({ y: Math.max(0, scrollTo), animated: true });
        }, 300);
    }, []);

    return (
        <ScrollView
            ref={scrollRef}
            style={[styles.scrollView, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.timelineContainer}>
                {/* Hour lines */}
                {hourLabels.map((label, i) => (
                    <View key={i} style={[styles.hourRow, { top: i * HOUR_HEIGHT }]}>
                        <View style={styles.labelContainer}>
                            <Text style={[styles.hourLabel, { color: colors.mutedForeground }]}>
                                {label}
                            </Text>
                        </View>
                        <View style={[styles.hourLine, { borderTopColor: colors.border }]} />
                    </View>
                ))}

                {/* Half-hour lines */}
                {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                    <View
                        key={`half-${i}`}
                        style={[
                            styles.halfHourLine,
                            {
                                top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                                borderTopColor: colors.border,
                            },
                        ]}
                    />
                ))}

                {/* Scheduled blocks */}
                {scheduled.map((activity) => (
                    <ScheduledBlock
                        key={activity.id}
                        activity={activity}
                        primaryColor={colors.primary}
                        primaryFg={colors.primaryForeground}
                        borderColor={colors.border}
                    />
                ))}

                {/* Current time indicator */}
                <View style={[styles.currentTimeLine, { top: currentTimeTop }]}>
                    <View style={[styles.currentTimeDot, { backgroundColor: colors.destructive }]} />
                    <View style={[styles.currentTimeBar, { backgroundColor: colors.destructive }]} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    timelineContainer: {
        height: HOUR_HEIGHT * TOTAL_HOURS,
        position: 'relative',
    },
    hourRow: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    labelContainer: {
        width: 56,
        alignItems: 'flex-end',
        paddingRight: 8,
        marginTop: -7,
    },
    hourLabel: {
        fontSize: 11,
        fontFamily: 'monospace',
    },
    hourLine: {
        flex: 1,
        borderTopWidth: 1,
        opacity: 0.5,
    },
    halfHourLine: {
        position: 'absolute',
        left: 56,
        right: 0,
        borderTopWidth: 1,
        borderStyle: 'dashed',
        opacity: 0.25,
    },
    scheduledBlock: {
        position: 'absolute',
        left: 64,
        right: 8,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    blockTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    blockDuration: {
        fontSize: 10,
        fontFamily: 'monospace',
        opacity: 0.8,
    },
    currentTimeLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    currentTimeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 48,
    },
    currentTimeBar: {
        flex: 1,
        height: 2,
    },
});
