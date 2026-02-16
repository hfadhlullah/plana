import { useThemeColors } from '@/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Activity from '../model/Activity';

interface ActivityCardProps {
    activity: Activity;
    isDragging?: boolean;
}

function getTypeColor(type: string, primary: string, accent: string, muted: string) {
    switch (type) {
        case 'task': return primary;
        case 'event': return '#8D6E4C';
        case 'habit': return accent;
        default: return muted;
    }
}

export default function ActivityCard({ activity, isDragging }: ActivityCardProps) {
    const colors = useThemeColors();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.foreground,
                },
                isDragging && styles.dragging,
            ]}
        >
            <View style={styles.topRow}>
                <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
                    {activity.title}
                </Text>
                <View style={[styles.durationBadge, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.durationText, { color: colors.mutedForeground }]}>
                        {activity.duration}m
                    </Text>
                </View>
            </View>

            {activity.description ? (
                <Text
                    style={[styles.description, { color: colors.mutedForeground }]}
                    numberOfLines={2}
                >
                    {activity.description}
                </Text>
            ) : null}

            <View style={styles.typeRow}>
                <View
                    style={[
                        styles.typeDot,
                        { backgroundColor: getTypeColor(activity.type, colors.primary, colors.accent, colors.muted) },
                    ]}
                />
                <Text style={[styles.typeLabel, { color: colors.mutedForeground }]}>
                    {activity.type}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 6,
        borderWidth: 1,
        marginBottom: 8,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    dragging: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
        transform: [{ scale: 1.05 }, { rotate: '-2deg' }],
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    durationBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        fontSize: 11,
        fontFamily: 'monospace',
    },
    description: {
        fontSize: 13,
        marginBottom: 8,
        lineHeight: 18,
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    typeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    typeLabel: {
        fontSize: 11,
        textTransform: 'capitalize',
    },
});
