import { useThemeColors } from '@/hooks/useThemeColors';
import { Icon } from '@iconify/react';
import {
    addDays,
    addMonths,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    setHours,
    setMinutes,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    showTime?: boolean;
}

export default function DatePickerModal({ visible, onClose, selectedDate, onSelectDate, showTime = true }: Props) {
    const colors = useThemeColors();
    const isWeb = Platform.OS === 'web';
    const [viewMonth, setViewMonth] = useState(startOfMonth(selectedDate));
    const [activeDate, setActiveDate] = useState(selectedDate);
    const [activeHour, setActiveHour] = useState(selectedDate.getHours());
    const [activeMinute, setActiveMinute] = useState(Math.floor(selectedDate.getMinutes() / 5) * 5);

    useEffect(() => {
        if (visible) {
            setActiveDate(selectedDate);
            setActiveHour(selectedDate.getHours());
            setActiveMinute(Math.floor(selectedDate.getMinutes() / 5) * 5);
        }
    }, [visible, selectedDate]);

    const handleConfirm = () => {
        const final = setMinutes(setHours(activeDate, activeHour), activeMinute);
        onSelectDate(final);
        onClose();
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    const weeks = useMemo(() => {
        const monthStart = startOfMonth(viewMonth);
        const monthEnd = endOfMonth(viewMonth);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const rows: Date[][] = [];
        let day = calStart;
        while (day <= calEnd) {
            const week: Date[] = [];
            for (let i = 0; i < 7; i++) {
                week.push(day);
                day = addDays(day, 1);
            }
            rows.push(week);
        }
        return rows;
    }, [viewMonth]);

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
                    {/* Month header */}
                    <View style={styles.monthHeader}>
                        <TouchableOpacity onPress={() => setViewMonth(subMonths(viewMonth, 1))} style={styles.navBtn}>
                            {isWeb ? <Icon icon="mdi:chevron-left" width={24} color={colors.foreground} /> : <Text style={{ color: colors.foreground, fontSize: 20 }}>‹</Text>}
                        </TouchableOpacity>
                        <Text style={[styles.monthTitle, { color: colors.foreground }]}>
                            {format(viewMonth, 'MMMM yyyy')}
                        </Text>
                        <TouchableOpacity onPress={() => setViewMonth(addMonths(viewMonth, 1))} style={styles.navBtn}>
                            {isWeb ? <Icon icon="mdi:chevron-right" width={24} color={colors.foreground} /> : <Text style={{ color: colors.foreground, fontSize: 20 }}>›</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* Day labels */}
                    <View style={styles.dayLabelsRow}>
                        {dayLabels.map((label, i) => (
                            <View key={i} style={styles.dayLabelCell}>
                                <Text style={[styles.dayLabelText, { color: colors.mutedForeground }]}>{label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar grid */}
                    {weeks.map((week, wi) => (
                        <View key={wi} style={styles.weekRow}>
                            {week.map((day, di) => {
                                const inMonth = isSameMonth(day, viewMonth);
                                const selected = isSameDay(day, activeDate);
                                const today = isToday(day);

                                return (
                                    <TouchableOpacity
                                        key={di}
                                        onPress={() => {
                                            if (showTime) {
                                                setActiveDate(day);
                                            } else {
                                                onSelectDate(day);
                                                onClose();
                                            }
                                        }}
                                        style={[
                                            styles.dayCell,
                                            selected && { backgroundColor: colors.primary },
                                            today && !selected && { borderWidth: 1, borderColor: colors.primary },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                { color: inMonth ? colors.foreground : colors.mutedForeground + '50' },
                                                selected && { color: '#fff', fontWeight: '700' },
                                                today && !selected && { color: colors.primary, fontWeight: '700' },
                                            ]}
                                        >
                                            {format(day, 'd')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}

                    {showTime && (
                        <View style={[styles.timePickerContainer, { borderTopColor: colors.border }]}>
                            <Text style={[styles.timePickerLabel, { color: colors.mutedForeground }]}>Time</Text>
                            <View style={styles.timeCols}>
                                <View style={styles.timeCol}>
                                    <Text style={[styles.timeColLabel, { color: colors.mutedForeground }]}>Hour</Text>
                                    <ScrollView showsVerticalScrollIndicator={false} style={styles.timeScroll}>
                                        {hours.map((h) => {
                                            const isSelected = activeHour === h;
                                            return (
                                                <TouchableOpacity
                                                    key={h}
                                                    onPress={() => setActiveHour(h)}
                                                    style={[styles.timeItem, isSelected && { backgroundColor: colors.primary + '20' }]}
                                                >
                                                    <Text style={[styles.timeItemText, { color: colors.foreground }, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                                                        {h.toString().padStart(2, '0')}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                <View style={styles.timeCol}>
                                    <Text style={[styles.timeColLabel, { color: colors.mutedForeground }]}>Min</Text>
                                    <ScrollView showsVerticalScrollIndicator={false} style={styles.timeScroll}>
                                        {minutes.map((m) => {
                                            const isSelected = activeMinute === m;
                                            return (
                                                <TouchableOpacity
                                                    key={m}
                                                    onPress={() => setActiveMinute(m)}
                                                    style={[styles.timeItem, isSelected && { backgroundColor: colors.primary + '20' }]}
                                                >
                                                    <Text style={[styles.timeItemText, { color: colors.foreground }, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                                                        {m.toString().padStart(2, '0')}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Today shortcut */}
                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={() => {
                                const now = new Date();
                                if (showTime) {
                                    setActiveDate(now);
                                    setViewMonth(startOfMonth(now));
                                } else {
                                    onSelectDate(now);
                                    onClose();
                                }
                            }}
                            style={styles.todayBtn}
                        >
                            <Text style={[styles.todayBtnText, { color: colors.mutedForeground }]}>Go to Today</Text>
                        </TouchableOpacity>

                        {showTime && (
                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                            >
                                <Text style={styles.confirmBtnText}>Done</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    card: {
        borderRadius: 16,
        paddingTop: 16,
        paddingHorizontal: 0, // removed to handle time list flush
        width: 320,
        maxHeight: '80%',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    monthTitle: { fontSize: 16, fontWeight: '700' },
    navBtn: { padding: 4 },
    dayLabelsRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    dayLabelCell: {
        flex: 1,
        alignItems: 'center',
    },
    dayLabelText: { fontSize: 12, fontWeight: '600' },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingHorizontal: 16,
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        maxHeight: 38,
    },
    dayText: { fontSize: 14 },
    timePickerContainer: {
        borderTopWidth: 1,
        paddingTop: 12,
        marginTop: 12,
        height: 180,
    },
    timePickerLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginLeft: 20,
        marginBottom: 8,
    },
    timeCols: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    timeCol: {
        flex: 1,
    },
    timeColLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 4,
        opacity: 0.6,
    },
    timeScroll: {
        flex: 1,
    },
    timeItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        marginVertical: 1,
    },
    timeItemText: { fontSize: 15 },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    todayBtn: {
        paddingVertical: 8,
    },
    todayBtnText: { fontSize: 14, fontWeight: '700' },
    confirmBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
