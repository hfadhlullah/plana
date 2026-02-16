import React, { createContext, useCallback, useContext, useState } from 'react';
import { LayoutRectangle } from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

export type DragItem = {
    id: string;
    type: string;
    data: any;
    originalLayout: LayoutRectangle;
};

type DragContextType = {
    dragItem: DragItem | null;
    startDrag: (item: DragItem) => void;
    endDrag: (success: boolean, dropZoneId?: string) => void;
    // Shared values for coordinates to avoid bridge crossing
    dragX: SharedValue<number>;
    dragY: SharedValue<number>;
    // Registry for drop zones
    registerDropZone: (id: string, layout: LayoutRectangle) => void;
    unregisterDropZone: (id: string) => void;
    checkDropZone: (x: number, y: number) => string | undefined;
};

const DragContext = createContext<DragContextType | null>(null);

export const useDrag = () => {
    const context = useContext(DragContext);
    if (!context) throw new Error('useDrag must be used within DragProvider');
    return context;
};

export function DragProvider({ children }: { children: React.ReactNode }) {
    const [dragItem, setDragItem] = useState<DragItem | null>(null);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);

    // Simple in-memory map for drop zones (ref pattern)
    const dropZones = React.useRef<Map<string, LayoutRectangle>>(new Map()).current;

    const startDrag = useCallback((item: DragItem) => {
        setDragItem(item);
    }, []);

    const endDrag = useCallback((success: boolean, dropZoneId?: string) => {
        console.log('End Drag:', success ? 'Dropped in ' + dropZoneId : 'Cancelled');
        setDragItem(null);
        dragX.value = 0;
        dragY.value = 0;
    }, []);

    const registerDropZone = useCallback((id: string, layout: LayoutRectangle) => {
        dropZones.set(id, layout);
    }, []);

    const unregisterDropZone = useCallback((id: string) => {
        dropZones.delete(id);
    }, []);

    const checkDropZone = useCallback((x: number, y: number) => {
        // This is a naive implementation. For many zones, use a quadtree or just loop.
        for (const [id, layout] of dropZones.entries()) {
            if (
                x >= layout.x &&
                x <= layout.x + layout.width &&
                y >= layout.y &&
                y <= layout.y + layout.height
            ) {
                return id;
            }
        }
        return undefined;
    }, []);

    return (
        <DragContext.Provider
            value={{
                dragItem,
                startDrag,
                endDrag,
                dragX,
                dragY,
                registerDropZone,
                unregisterDropZone,
                checkDropZone,
            }}
        >
            {children}
        </DragContext.Provider>
    );
}
