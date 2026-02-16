import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useBacklog } from '../hooks/useBacklog';
import Activity from '../model/Activity';
import DraggableActivity from './drag-drop/DraggableActivity';

interface BacklogDrawerProps {
    onDragStart?: (activity: Activity) => void;
    onDragEnd?: (activity: Activity, absoluteY: number) => void;
}

export default function BacklogDrawer({ onDragStart, onDragEnd }: BacklogDrawerProps) {
    const { backlog, addActivity } = useBacklog();
    const [newTitle, setNewTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const colors = useThemeColors();

    const handleAdd = () => {
        if (newTitle.trim()) {
            addActivity(newTitle.trim(), 'task');
            setNewTitle('');
            setIsAdding(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                    Activities ({backlog.length})
                </Text>
                <TouchableOpacity
                    onPress={() => setIsAdding(!isAdding)}
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                >
                    <Ionicons name={isAdding ? 'close' : 'add'} size={18} color={colors.primaryForeground} />
                </TouchableOpacity>
            </View>

            {/* Quick Add */}
            {isAdding && (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={[styles.addRow, { borderBottomColor: colors.border, backgroundColor: colors.muted }]}>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.foreground,
                            }]}
                            placeholder="What needs to be done?"
                            placeholderTextColor={colors.mutedForeground}
                            value={newTitle}
                            onChangeText={setNewTitle}
                            onSubmitEditing={handleAdd}
                            autoFocus
                        />
                        <TouchableOpacity
                            onPress={handleAdd}
                            style={[styles.submitButton, { backgroundColor: colors.primary }]}
                        >
                            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}

            {/* Activity List */}
            <FlatList
                data={backlog}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemWrapper}>
                        <DraggableActivity
                            activity={item}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            No activities yet. Tap + to add one.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        maxHeight: 300,
        borderTopWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        fontSize: 14,
    },
    submitButton: {
        marginLeft: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    submitText: {
        fontWeight: '700',
        fontSize: 14,
    },
    itemWrapper: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
});
