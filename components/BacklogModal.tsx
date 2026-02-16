import { useBacklog } from '@/hooks/useBacklog';
import { useThemeColors } from '@/hooks/useThemeColors';
import Activity from '@/model/Activity';
import { Icon } from '@iconify/react';
import React from 'react';
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
    selectedActivity: Activity | null;
    onSelectActivity: (activity: Activity | null) => void;
}

export default function BacklogModal({
    visible,
    onClose,
    selectedActivity,
    onSelectActivity,
}: Props) {
    const colors = useThemeColors();
    const { backlog } = useBacklog();
    const isWeb = Platform.OS === 'web';

    const iconMap: Record<string, string> = {
        task: 'mdi:checkbox-marked-circle-outline',
        event: 'mdi:calendar-star',
        habit: 'mdi:refresh-circle',
    };
    const colorMap: Record<string, string> = {
        task: '#A67C52',
        event: '#5B8DEF',
        habit: '#43A680',
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={[styles.sheet, { backgroundColor: colors.card }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Icon icon="mdi:clipboard-list" width={24} color={colors.foreground} />
                        <Text style={[styles.title, { color: colors.foreground }]}>
                            Activities ({backlog.length})
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            {isWeb ? (
                                <Icon icon="mdi:close" width={24} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ color: colors.mutedForeground, fontSize: 24 }}>✕</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* List */}
                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {backlog.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                    No activities yet. Tap + to create one.
                                </Text>
                            </View>
                        ) : (
                            backlog.map((activity) => {
                                const isSelected = selectedActivity?.id === activity.id;
                                return (
                                    <TouchableOpacity
                                        key={activity.id}
                                        onPress={() => {
                                            onSelectActivity(isSelected ? null : activity);
                                            onClose();
                                        }}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.item,
                                            {
                                                backgroundColor: isSelected
                                                    ? colors.primary + '15'
                                                    : colors.background,
                                                borderColor: isSelected ? colors.primary : colors.border,
                                                borderWidth: isSelected ? 2 : 1,
                                            },
                                        ]}
                                    >
                                        {/* Icon */}
                                        {isWeb ? (
                                            <Icon
                                                icon={iconMap[activity.type] || iconMap.task}
                                                width={24}
                                                color={colorMap[activity.type] || colorMap.task}
                                            />
                                        ) : (
                                            <Text style={{ fontSize: 20 }}>
                                                {activity.type === 'event'
                                                    ? '📅'
                                                    : activity.type === 'habit'
                                                        ? '🔁'
                                                        : '📝'}
                                            </Text>
                                        )}

                                        {/* Content */}
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[styles.itemTitle, { color: colors.foreground }]}
                                                numberOfLines={2}
                                            >
                                                {activity.title}
                                            </Text>
                                            <View style={styles.itemMeta}>
                                                <Text
                                                    style={[
                                                        styles.itemMetaText,
                                                        { color: colors.mutedForeground },
                                                    ]}
                                                >
                                                    {activity.duration}m
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.itemMetaText,
                                                        { color: colors.mutedForeground },
                                                    ]}
                                                >
                                                    •
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.itemMetaText,
                                                        { color: colors.mutedForeground },
                                                    ]}
                                                >
                                                    {activity.type}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Selected badge */}
                                        {isSelected && (
                                            <View
                                                style={[
                                                    styles.selectedBadge,
                                                    { backgroundColor: colors.primary },
                                                ]}
                                            >
                                                {isWeb ? (
                                                    <Icon icon="mdi:check" width={16} color="#fff" />
                                                ) : (
                                                    <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Footer hint */}
                    {selectedActivity && (
                        <View
                            style={[
                                styles.footer,
                                {
                                    backgroundColor: colors.primary + '15',
                                    borderTopColor: colors.primary + '30',
                                },
                            ]}
                        >
                            {isWeb && (
                                <Icon icon="mdi:gesture-tap" width={18} color={colors.primary} />
                            )}
                            <Text
                                style={[styles.footerText, { color: colors.primary }]}
                                numberOfLines={1}
                            >
                                Tap a time slot to schedule "{selectedActivity.title}"
                            </Text>
                        </View>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '75%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    title: { fontSize: 20, fontWeight: '800' },
    closeBtn: { padding: 4 },
    list: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    itemMetaText: {
        fontSize: 12,
    },
    selectedBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
});
