import { useThemeColors } from '@/hooks/useThemeColors';
import Activity from '@/model/Activity';
import { minutesToTimeString } from '@/utils/timeGrid';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import React from 'react';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    activity: Activity | null;
    onUnschedule?: (activity: Activity) => void;
    onEdit?: (activity: Activity) => void;
}

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
    task: { icon: 'mdi:checkbox-marked-circle-outline', label: 'Task', color: '#A67C52' },
    event: { icon: 'mdi:calendar-star', label: 'Event', color: '#5B8DEF' },
    habit: { icon: 'mdi:refresh-circle', label: 'Habit', color: '#43A680' },
};

export default function ActivityDetailModal({ visible, onClose, activity, onUnschedule, onEdit }: Props) {
    const colors = useThemeColors();
    const isWeb = Platform.OS === 'web';

    if (!activity) return null;

    const meta = TYPE_META[activity.type] || TYPE_META.task;
    const accentColor = activity.color || meta.color;
    const startMin = activity.startTime
        ? new Date(activity.startTime).getHours() * 60 + new Date(activity.startTime).getMinutes()
        : 0;
    const endMin = startMin + activity.duration;
    const dateStr = activity.startTime ? format(new Date(activity.startTime), 'EEEE, MMMM d, yyyy') : '';

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
                    {/* Color accent bar */}
                    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: colors.foreground }]}>{activity.title}</Text>
                            <View style={styles.typeBadge}>
                                {isWeb && <Icon icon={meta.icon} width={16} color={meta.color} />}
                                <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            {isWeb ? (
                                <Icon icon="mdi:close" width={24} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ color: colors.mutedForeground, fontSize: 24 }}>✕</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Details */}
                    <View style={[styles.detailsSection, { borderTopColor: colors.border }]}>
                        {/* Date */}
                        <View style={styles.detailRow}>
                            {isWeb ? (
                                <Icon icon="mdi:calendar" width={20} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ fontSize: 16 }}>📅</Text>
                            )}
                            <Text style={[styles.detailText, { color: colors.foreground }]}>{dateStr}</Text>
                        </View>

                        {/* Time */}
                        <View style={styles.detailRow}>
                            {isWeb ? (
                                <Icon icon="mdi:clock-outline" width={20} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ fontSize: 16 }}>🕐</Text>
                            )}
                            <Text style={[styles.detailText, { color: colors.foreground }]}>
                                {minutesToTimeString(startMin)} – {minutesToTimeString(endMin)}
                            </Text>
                        </View>

                        {/* Duration */}
                        <View style={styles.detailRow}>
                            {isWeb ? (
                                <Icon icon="mdi:timer-outline" width={20} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ fontSize: 16 }}>⏱</Text>
                            )}
                            <Text style={[styles.detailText, { color: colors.foreground }]}>
                                {activity.duration >= 60
                                    ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60 > 0 ? `${activity.duration % 60}m` : ''}`
                                    : `${activity.duration}m`}
                            </Text>
                        </View>

                        {/* Priority */}
                        <View style={styles.detailRow}>
                            {isWeb ? (
                                <Icon icon="mdi:flag-outline" width={20} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ fontSize: 16 }}>🚩</Text>
                            )}
                            <Text style={[styles.detailText, { color: colors.foreground, textTransform: 'capitalize' }]}>
                                {activity.priority || 'Medium'} priority
                            </Text>
                        </View>

                        {/* Description */}
                        {activity.description ? (
                            <View style={[styles.descriptionBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                <Text style={[styles.descriptionText, { color: colors.foreground }]}>
                                    {activity.description}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Actions */}
                    <View style={[styles.actions, { borderTopColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {onEdit && (
                                <TouchableOpacity
                                    onPress={() => {
                                        onEdit(activity);
                                    }}
                                    style={[styles.actionBtn, { flex: 1, borderColor: colors.primary + '40' }]}
                                >
                                    {isWeb && <Icon icon="mdi:pencil" width={18} color={colors.primary} />}
                                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
                                </TouchableOpacity>
                            )}
                            {onUnschedule && (
                                <TouchableOpacity
                                    onPress={() => {
                                        onUnschedule(activity);
                                        onClose();
                                    }}
                                    style={[styles.actionBtn, { flex: 1, borderColor: colors.destructive + '40' }]}
                                >
                                    {isWeb && <Icon icon="mdi:calendar-remove" width={18} color={colors.destructive} />}
                                    <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Unschedule</Text>
                                </TouchableOpacity>
                            )}
                        </View>
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
        width: 340,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    accentBar: {
        height: 4,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        gap: 12,
    },
    title: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    typeLabel: { fontSize: 13, fontWeight: '600' },
    closeBtn: { padding: 4 },
    detailsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        gap: 14,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: { fontSize: 14 },
    descriptionBox: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 4,
    },
    descriptionText: { fontSize: 13, lineHeight: 20 },
    actions: {
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    actionBtnText: { fontSize: 14, fontWeight: '600' },
});
