import React, { useRef } from 'react';
import { useGenerator, Layer } from './context/GeneratorContext';
import { MdAdd, MdDelete, MdContentCopy, MdVisibility, MdVisibilityOff, MdLock, MdLockOpen, MdDragIndicator } from 'react-icons/md';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';
import { useDrag, useDrop } from 'react-dnd';

interface LayerItemProps {
    layer: Layer;
    index: number;
    isActive: boolean;
    moveLayer: (dragIndex: number, hoverIndex: number) => void;
    onActivate: () => void;
    onToggleVisibility: () => void;
    onToggleLock: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const LayerItem = ({ layer, index, isActive, moveLayer, onActivate, onToggleVisibility, onToggleLock, onDelete, onDuplicate }: LayerItemProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ handlerId }, drop] = useDrop({
        accept: 'LAYER',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: any, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveLayer(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'LAYER',
        item: () => ({ id: layer.id, index }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0.4 : 1;
    drag(drop(ref));

    return (
        <div 
            ref={ref} 
            style={{ opacity }} 
            data-handler-id={handlerId}
            className={cn(
                "flex items-center gap-2 p-2 rounded-md group mb-1 border border-transparent cursor-pointer transition-colors",
                isActive ? "bg-[var(--accent)]/20 border-[var(--accent)]/50" : "hover:bg-[var(--muted)]",
                !layer.visible && "opacity-60"
            )}
            onClick={onActivate}
        >
            <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--foreground)] p-1">
                <MdDragIndicator className="w-4 h-4" />
            </div>
            
            <div className="flex-1 truncate text-sm font-medium select-none">
                {layer.name}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleVisibility} title={layer.visible ? "Hide" : "Show"}>
                    {layer.visible ? <MdVisibility className="w-3 h-3" /> : <MdVisibilityOff className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleLock} title={layer.locked ? "Unlock" : "Lock"}>
                    {layer.locked ? <MdLock className="w-3 h-3" /> : <MdLockOpen className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDuplicate} title="Duplicate">
                    <MdContentCopy className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive hover:bg-destructive/10" onClick={onDelete} title="Delete">
                    <MdDelete className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
};

export function LayerPanel({ className }: { className?: string }) {
    const { state, dispatch } = useGenerator();
    const { layers, activeLayerId } = state;

    const moveLayer = (dragIndex: number, hoverIndex: number) => {
        const dragLayer = layers[dragIndex];
        const newLayers = [...layers];
        newLayers.splice(dragIndex, 1);
        newLayers.splice(hoverIndex, 0, dragLayer);
        dispatch({ type: 'REORDER_LAYERS', payload: newLayers });
    };

    const addLayer = () => dispatch({ type: 'ADD_LAYER' });

    return (
        <div className={cn("flex flex-col bg-[var(--sidebar)]", className)}>
            <div className="p-4 border-b border-[var(--sidebar-border)] flex items-center justify-between">
                <h2 className="font-bold text-sm">Layers</h2>
                <Button size="sm" variant="ghost" onClick={addLayer} className="h-8 px-2">
                    <MdAdd className="w-4 h-4 mr-1" /> New
                </Button>
            </div>
            
            <ScrollArea className="flex-1 p-2">
                {layers.map((layer, index) => (
                    <LayerItem 
                        key={layer.id} 
                        index={index}
                        layer={layer} 
                        isActive={layer.id === activeLayerId}
                        moveLayer={moveLayer}
                        onActivate={() => dispatch({ type: 'SET_ACTIVE_LAYER', payload: layer.id })}
                        onToggleVisibility={() => dispatch({ type: 'UPDATE_LAYER', payload: { id: layer.id, updates: { visible: !layer.visible } } })}
                        onToggleLock={() => dispatch({ type: 'UPDATE_LAYER', payload: { id: layer.id, updates: { locked: !layer.locked } } })}
                        onDelete={() => dispatch({ type: 'DELETE_LAYER', payload: layer.id })}
                        onDuplicate={() => dispatch({ type: 'DUPLICATE_LAYER', payload: layer.id })}
                    />
                ))}
            </ScrollArea>
        </div>
    );
}
