import { useThemeColors } from '@/hooks/useThemeColors';
import Activity, { ActivityType } from '@/model/Activity';
import { database } from '@/model/database';
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const TYPES: { value: ActivityType; label: string; icon: string; color: string }[] = [
    { value: 'task', label: 'Task', icon: 'mdi:checkbox-marked-circle-outline', color: '#A67C52' },
    { value: 'event', label: 'Event', icon: 'mdi:calendar-star', color: '#5B8DEF' },
    { value: 'habit', label: 'Habit', icon: 'mdi:refresh-circle', color: '#43A680' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const COLORS = [
    '#A67C52', '#5B8DEF', '#43A680', '#E57373', '#F06292', '#BA68C8',
    '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC',
    '#81C784', '#AED581', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F',
];

interface Props {
    visible: boolean;
    onClose: () => void;
    activity: Activity | null;
}

export default function EditActivityModal({ visible, onClose, activity }: Props) {
    const colors = useThemeColors();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ActivityType>('task');
    const [duration, setDuration] = useState(30);
    const [customColor, setCustomColor] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (activity) {
            setTitle(activity.title);
            setType(activity.type);
            setDuration(activity.duration);
            setCustomColor(activity.color);
            setDescription(activity.description || '');
        }
    }, [activity]);

    const handleSubmit = async () => {
        if (!title.trim() || !activity) return;

        await database.write(async () => {
            await activity.update((a: any) => {
                a.title = title.trim();
                a.type = type;
                a.duration = duration;
                a.color = customColor;
                a.description = description.trim();
            });
        });

        onClose();
    };

    if (!activity) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Edit Activity</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            {Platform.OS === 'web' ? (
                                <Icon icon="mdi:close" width={22} color={colors.mutedForeground} />
                            ) : (
                                <Text style={{ color: colors.mutedForeground, fontSize: 22 }}>✕</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Title Input */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>Title</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                placeholder="What needs to be done?"
                                placeholderTextColor={colors.mutedForeground}
                                value={title}
                                onChangeText={setTitle}
                                autoFocus
                            />
                        </View>

                        {/* Type Picker */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>Type</Text>
                            <View style={styles.typeRow}>
                                {TYPES.map((t) => (
                                    <TouchableOpacity
                                        key={t.value}
                                        onPress={() => setType(t.value)}
                                        style={[
                                            styles.typeChip,
                                            {
                                                backgroundColor: type === t.value ? t.color + '20' : colors.background,
                                                borderColor: type === t.value ? t.color : colors.border,
                                            },
                                        ]}
                                    >
                                        {Platform.OS === 'web' && (
                                            <Icon icon={t.icon} width={18} color={type === t.value ? t.color : colors.mutedForeground} />
                                        )}
                                        <Text
                                            style={[
                                                styles.typeLabel,
                                                { color: type === t.value ? t.color : colors.mutedForeground },
                                            ]}
                                        >
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Duration Picker */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>Duration</Text>
                            <View style={styles.durationRow}>
                                {DURATIONS.map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        onPress={() => setDuration(d)}
                                        style={[
                                            styles.durationChip,
                                            {
                                                backgroundColor: duration === d ? colors.primary : colors.background,
                                                borderColor: duration === d ? colors.primary : colors.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.durationLabel,
                                                { color: duration === d ? '#fff' : colors.mutedForeground },
                                            ]}
                                        >
                                            {d >= 60 ? `${d / 60}h` : `${d}m`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Color Picker */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>Color</Text>
                            <View style={styles.colorGrid}>
                                {COLORS.map((c) => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => setCustomColor(customColor === c ? null : c)}
                                        style={[
                                            styles.colorChip,
                                            { backgroundColor: c },
                                            customColor === c && styles.colorChipSelected,
                                        ]}
                                    >
                                        {customColor === c && (
                                            Platform.OS === 'web' ? (
                                                <Icon icon="mdi:check" width={16} color="#fff" />
                                            ) : (
                                                <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>
                                            )
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                placeholder="Add notes or details..."
                                placeholderTextColor={colors.mutedForeground}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>

                    {/* Submit */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: title.trim() ? 1 : 0.4 }]}
                            disabled={!title.trim()}
                        >
                            {Platform.OS === 'web' && (
                                <Icon icon="mdi:check-circle" width={20} color="#fff" />
                            )}
                            <Text style={styles.submitText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
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
        maxHeight: '90%',
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    sheetTitle: { fontSize: 18, fontWeight: '800' },
    closeBtn: { padding: 4 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    field: { marginTop: 20 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 15,
    },
    textArea: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 15,
        minHeight: 100,
    },
    typeRow: { flexDirection: 'row', gap: 8 },
    typeChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    typeLabel: { fontSize: 13, fontWeight: '600' },
    durationRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    durationChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    durationLabel: { fontSize: 13, fontWeight: '600' },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    colorChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorChipSelected: {
        borderWidth: 3,
        borderColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
