import React, { useEffect, useRef, useState } from 'react';
import { useGenerator, GeneratorState, Layer } from './context/GeneratorContext';
import { calculateProps, getGradientColor, generateSVG, MaskData, roundRect } from '../lib/generatorUtils';
import { copyToClipboard, cn } from '../lib/utils';
import { MdVisibility, MdVisibilityOff, MdDelete, MdDragHandle } from 'react-icons/md';
import { Slider } from './ui/slider';

const MaskOverlay = ({ state, dispatch }: { state: GeneratorState, dispatch: any }) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
    const { mask } = activeLayer;
    const { canvas } = state;
    const { transform, preview, imageUrl } = mask;
    
    // Local state for interactions
    const [isSelected, setIsSelected] = useState(false);
    const [dragState, setDragState] = useState<{
        type: 'move' | 'scale' | 'rotate',
        startX: number,
        startY: number,
        initX: number,
        initY: number,
        initScale: number,
        initRot: number,
        centerX: number,
        centerY: number
    } | null>(null);
    
    const boxRef = useRef<HTMLDivElement>(null);
    const zoom = canvas.zoom / 100;
    
    // Transform values with defaults
    const tx = transform?.x ?? 0;
    const ty = transform?.y ?? 0;
    const scale = transform?.scale ?? 1;
    const rot = transform?.rotation ?? 0;

    const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'scale' | 'rotate') => {
        e.stopPropagation();
        e.preventDefault();
        setIsSelected(true);
        
        const box = boxRef.current?.getBoundingClientRect();
        const centerX = box ? box.left + box.width / 2 : 0;
        const centerY = box ? box.top + box.height / 2 : 0;

        setDragState({ 
            type,
            startX: e.clientX, 
            startY: e.clientY, 
            initX: tx, 
            initY: ty, 
            initScale: scale,
            initRot: rot,
            centerX,
            centerY
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragState) return;

            if (dragState.type === 'move') {
                const dx = (e.clientX - dragState.startX) / zoom;
                const dy = (e.clientY - dragState.startY) / zoom;
                
                dispatch({
                    type: 'SET_MASK',
                    payload: {
                        transform: {
                            ...activeLayer.mask.transform,
                            x: dragState.initX + dx,
                            y: dragState.initY + dy
                        }
                    }
                });
            } else if (dragState.type === 'scale') {
                // Simple uniform scale based on distance from start
                // Moving right/down increases scale
                const dx = (e.clientX - dragState.startX);
                const dy = (e.clientY - dragState.startY);
                // Project delta onto diagonal vector for better feel? 
                // Or just use max delta. simple approach:
                const scaleDelta = (dx + dy) * 0.005; 
                const newScale = Math.max(0.1, dragState.initScale + scaleDelta);
                
                dispatch({
                    type: 'SET_MASK',
                    payload: {
                        transform: { ...activeLayer.mask.transform, scale: newScale }
                    }
                });
            } else if (dragState.type === 'rotate') {
                // Calculate angle relative to center
                const currentAngle = Math.atan2(e.clientY - dragState.centerY, e.clientX - dragState.centerX) * 180 / Math.PI;
                const startAngle = Math.atan2(dragState.startY - dragState.centerY, dragState.startX - dragState.centerX) * 180 / Math.PI;
                const deltaRot = currentAngle - startAngle;
                
                dispatch({
                    type: 'SET_MASK',
                    payload: {
                        transform: { ...activeLayer.mask.transform, rotation: dragState.initRot + deltaRot }
                    }
                });
            }
        };

        const handleMouseUp = () => {
            setDragState(null);
        };

        if (dragState) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, zoom, dispatch, activeLayer.mask.transform]);

    // Click outside to deselect
    useEffect(() => {
        const handleClickOutside = () => setIsSelected(false);
        if (isSelected) window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isSelected]);

    if (!preview?.visible || !imageUrl) return null;

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
             <div 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
             >
                 <div
                    ref={boxRef}
                    className={cn(
                        "relative group select-none",
                        isSelected ? "z-50" : "hover:opacity-90"
                    )}
                    style={{
                        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
                        width: '100%', 
                        height: '100%', 
                        pointerEvents: 'auto'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                    onClick={(e) => e.stopPropagation()}
                 >
                    <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className={cn(
                            "w-full h-full object-fill pointer-events-none border-2 transition-colors",
                            isSelected ? "border-[#00A3FF]" : "border-transparent hover:border-[#00A3FF]/50"
                        )}
                        style={{ opacity: preview.opacity }}
                    />
                    
                    {/* Selection UI - Figma Style */}
                    {isSelected && (
                        <>
                            {/* Corner Handles */}
                            {/* NW */}
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#00A3FF] shadow-sm cursor-nwse-resize z-50"
                                 onMouseDown={(e) => handleMouseDown(e, 'scale')} />
                            {/* NE */}
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#00A3FF] shadow-sm cursor-nesw-resize z-50"
                                 onMouseDown={(e) => handleMouseDown(e, 'scale')} />
                            {/* SW */}
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#00A3FF] shadow-sm cursor-nesw-resize z-50"
                                 onMouseDown={(e) => handleMouseDown(e, 'scale')} />
                            {/* SE */}
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#00A3FF] shadow-sm cursor-nwse-resize z-50"
                                 onMouseDown={(e) => handleMouseDown(e, 'scale')} />

                            {/* Rotation Handle (Top Center) */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing group/rot"
                                 onMouseDown={(e) => handleMouseDown(e, 'rotate')}>
                                <div className="w-2 h-2 rounded-full bg-white border border-[#00A3FF] shadow-sm mb-0.5 group-hover/rot:scale-125 transition-transform" />
                                <div className="w-px h-4 bg-[#00A3FF]" />
                            </div>

                            {/* Context Toolbar (Visibility/Opacity) */}
                            <div 
                                className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] p-1 rounded shadow-xl z-50 pointer-events-auto min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
                                style={{
                                    transform: `rotate(${-rot}deg) scale(${1 / (scale * zoom)})`,
                                    transformOrigin: 'top center'
                                }}
                            >
                                <button 
                                    onClick={() => dispatch({ type: 'SET_MASK', payload: { preview: { ...preview, visible: false } } })}
                                    className="p-1 hover:bg-[var(--muted)] rounded text-[var(--foreground)] transition-colors"
                                    title="Hide Layer"
                                >
                                    <MdVisibility className="w-4 h-4" />
                                </button>
                                <div className="w-20 px-2">
                                    <Slider 
                                        min={0} max={1} step={0.01}
                                        value={[preview.opacity]}
                                        onValueChange={([v]) => dispatch({ type: 'SET_MASK', payload: { preview: { ...preview, opacity: v } } })}
                                    />
                                </div>
                                <div className="text-[10px] text-[var(--muted-foreground)] tabular-nums">
                                    {Math.round(preview.opacity * 100)}%
                                </div>
                                <div className="w-px h-4 bg-[var(--border)] mx-1" />
                                <button 
                                    onClick={() => dispatch({ type: 'SET_MASK', payload: { imageUrl: null } })}
                                    className="p-1 hover:bg-destructive/10 rounded text-[var(--text-muted)] hover:text-destructive transition-colors"
                                    title="Delete Layer"
                                >
                                    <MdDelete className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                 </div>
             </div>
        </div>
    );
};

const GradientOverlay = ({ state, dispatch }: { state: GeneratorState, dispatch: any }) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
    const { colors, grid } = activeLayer;
    const { canvas } = state;
    const { showCanvasControls } = state.colors;
    const { gradient } = colors;
    const zoom = canvas.zoom / 100;
    
    const [dragging, setDragging] = useState<{ target: 'handle' | string, id?: string } | null>(null);

    // Grid Specs for Line Length
    const gridWidth = (grid.cols - 1) * grid.spacingX;
    const gridHeight = (grid.rows - 1) * grid.spacingY;
    // Use a fixed length relative to grid or cover logic
    // Logic uses maxDist = diagonal / 2
    const maxDist = Math.sqrt(gridWidth*gridWidth + gridHeight*gridHeight) / 2;
    
    const angleRad = gradient.angle * Math.PI / 180;
    
    // Endpoints relative to center
    const ex = Math.cos(angleRad) * maxDist;
    const ey = Math.sin(angleRad) * maxDist;
    
    const p1 = { x: -ex, y: -ey }; // Start (0%)
    const p2 = { x: ex, y: ey };   // End (100%)

    const handleMouseDown = (e: React.MouseEvent, target: 'handle' | string, id?: string) => {
        e.stopPropagation();
        e.preventDefault();
        setDragging({ target, id });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging) return;
            
            const container = document.querySelector('.canvas-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            
            // Mouse relative to center, unscaled
            const mx = (e.clientX - rect.left - cx) / zoom;
            const my = (e.clientY - rect.top - cy) / zoom;

            if (dragging.target === 'handle') {
                // Rotate
                let newAngle = Math.atan2(my, mx) * 180 / Math.PI;
                // If dragging start handle (p1), invert angle
                if (dragging.id === 'start') newAngle += 180;
                
                dispatch({ 
                    type: 'SET_COLORS', 
                    payload: { 
                        gradient: { ...gradient, angle: newAngle } 
                    } 
                });
            } else if (dragging.target === 'stop' && dragging.id) {
                // Move Stop along line
                // Project M onto vector P1->P2
                // Vector V = P2 - P1 = (2*ex, 2*ey)
                // P1 is origin for t calculation?
                // t = ((M - P1) dot V) / (V dot V)
                
                const vx = p2.x - p1.x;
                const vy = p2.y - p1.y;
                const vLen2 = vx*vx + vy*vy;
                
                if (vLen2 < 0.001) return;

                const pmx = mx - p1.x;
                const pmy = my - p1.y;
                
                let t = (pmx * vx + pmy * vy) / vLen2;
                t = Math.max(0, Math.min(1, t));
                
                const newStops = gradient.stops.map(s => 
                    s.id === dragging.id ? { ...s, position: t * 100 } : s
                );
                
                dispatch({ 
                    type: 'SET_COLORS', 
                    payload: { 
                        gradient: { ...gradient, stops: newStops } 
                    } 
                });
            }
        };

        const handleMouseUp = () => setDragging(null);

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, zoom, gradient, dispatch, maxDist]);

    // Only show when "Colors" panel is active (editing colors)
    if (!showCanvasControls) return null;
    
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
            <div 
                style={{ 
                    transform: `scale(${zoom})`,
                    width: 0, height: 0,
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {/* Gradient Line */}
                <div 
                    className="absolute h-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                    style={{
                        width: maxDist * 2,
                        transform: `rotate(${gradient.angle}deg)`
                    }}
                />
                
                {/* Handles (Start/End) */}
                {[p1, p2].map((p, i) => (
                    <div
                        key={i === 0 ? 'start' : 'end'}
                        className="absolute w-3 h-3 bg-white border border-[#00A3FF] shadow-sm rotate-45 cursor-crosshair pointer-events-auto hover:scale-125 transition-transform"
                        style={{
                            left: p.x, top: p.y,
                            marginLeft: -6, marginTop: -6
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'handle', i === 0 ? 'start' : 'end')}
                    />
                ))}

                {/* Stops */}
                {gradient.stops.map(stop => {
                    // Calculate position
                    const t = stop.position / 100;
                    // Interpolate P1 -> P2
                    const sx = p1.x + (p2.x - p1.x) * t;
                    const sy = p1.y + (p2.y - p1.y) * t;
                    
                    return (
                        <div
                            key={stop.id}
                            className="absolute w-4 h-4 bg-white border-2 border-white shadow-md rounded-full cursor-grab active:cursor-grabbing pointer-events-auto hover:scale-110 transition-transform flex items-center justify-center group"
                            style={{
                                left: sx, top: sy,
                                marginLeft: -8, marginTop: -8,
                                backgroundColor: stop.color,
                                borderColor: dragging?.id === stop.id ? '#000' : '#fff'
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'stop', stop.id)}
                        >
                            {/* Tooltip / Color Picker Trigger could go here */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                                {Math.round(stop.position)}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export function CanvasArea() {
  const { state, dispatch } = useGenerator();
  const activeLayer = state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We keep the mask image data in a ref to avoid re-renders
  const maskDataRef = useRef<{ data: Uint8ClampedArray; width: number; height: number } | null>(null);

  // 1. Handle Image Mask Loading
  useEffect(() => {
    if (!activeLayer.mask.imageUrl) {
      maskDataRef.current = null;
      render();
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = activeLayer.mask.imageUrl;
    img.onload = () => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = img.width;
      offCanvas.height = img.height;
      const ctx = offCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            maskDataRef.current = {
                data: imageData.data,
                width: imageData.width,
                height: imageData.height
            };
            render(); // Trigger re-render once loaded
        } catch (e) {
            console.error("Could not get image data", e);
        }
      }
    };
  }, [activeLayer.mask.imageUrl]);

  // 2. Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
        // Ignore if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        const isCmd = e.metaKey || e.ctrlKey;

        // Undo/Redo
        if (isCmd && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                dispatch({ type: 'REDO' });
            } else {
                dispatch({ type: 'UNDO' });
            }
            return;
        }

        // Zoom to Fit (Reset to default)
        if (isCmd && e.key === '0') {
            e.preventDefault();
            dispatch({ type: 'SET_CANVAS', payload: { zoom: 85 } });
            return;
        }

        // Copy SVG
        if (isCmd && e.key === 'c') {
            e.preventDefault();
            const svg = generateSVG(activeLayer, state.colors.background, maskDataRef.current);
            try {
                await copyToClipboard(svg);
                console.log('SVG copied to clipboard');
            } catch (err) {
                console.error('Failed to copy SVG', err);
            }
            return;
        }

        // Paste Image
        if (isCmd && e.key === 'v') {
            try {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    if (item.types.some(t => t.startsWith('image/'))) {
                         const blob = await item.getType(item.types.find(t => t.startsWith('image/'))!);
                         const url = URL.createObjectURL(blob);
                         dispatch({ type: 'SET_MASK', payload: { imageUrl: url } });
                         break;
                    }
                }
            } catch (err) {
                console.error('Failed to read clipboard', err);
            }
            return;
        }

        // Opacity (1-0)
        if (!isCmd && !e.shiftKey && !e.altKey) {
            if (/^[0-9]$/.test(e.key)) {
                const val = e.key === '0' ? 1 : parseInt(e.key) / 10;
                dispatch({ 
                    type: 'SET_MASK', 
                    payload: { 
                        preview: { ...activeLayer.mask.preview, opacity: val } 
                    } 
                });
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, dispatch]);

  // 3. Main Render Function
  const render = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Retina Display
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Background
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Zoom & Pan (Center Origin)
    const zoom = state.canvas.zoom / 100;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);

    // Render all visible layers
    state.layers.forEach(layer => {
        if (!layer.visible) return;

        // Grid Calculation
        const { width: unitW, height: unitH, spacingX, spacingY, cols, rows, lineColor } = layer.grid;
        
        // Calculate Grid Bounds to center it
        const gridWidth = (cols - 1) * spacingX;
        const gridHeight = (rows - 1) * spacingY;
        
        const startX = (rect.width - gridWidth) / 2;
        const startY = (rect.height - gridHeight) / 2;

        // Pre-sort stops for performance
        const sortedStops = [...layer.colors.gradient.stops].sort((a, b) => a.position - b.position);

        // Loop
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            let x = startX + i * spacingX;
            let y = startY + j * spacingY;
            
            // Only apply mask if this is the active layer (limitation for now)
            const mask = layer.id === activeLayer.id ? maskDataRef.current : null;

            // --- Sequence & Effects Logic (Shared) ---
            const props = calculateProps(x, y, i, j, cols, rows, rect.width, rect.height, layer, mask);
            
            // @ts-ignore
            const { x: drawX, y: drawY, xOffset, yOffset, rotation, scaleX, scaleY, skewX, skewY, opacity, colorT, strokeWidth } = props;

            // --- Drawing ---
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(rotation * Math.PI / 180);
            if (xOffset || yOffset) ctx.translate(xOffset, yOffset);
            
            // Apply Skew
            if (skewX || skewY) {
                const radX = (skewX || 0) * Math.PI / 180;
                const radY = (skewY || 0) * Math.PI / 180;
                ctx.transform(1, Math.tan(radY), Math.tan(radX), 1, 0, 0);
            }

            ctx.scale(scaleX, scaleY);

            // Color
            ctx.fillStyle = getGradientColor(sortedStops, colorT);
            ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
            ctx.strokeStyle = layer.unit.strokeColor;
            ctx.lineWidth = strokeWidth;

            // Shape
            ctx.beginPath();
            const w = unitW; 
            const h = unitH; 
            let radius: number | [number, number, number, number] = 0;
            const baseRadius = layer.unit.borderRadius;
            
            if (Array.isArray(baseRadius)) {
                 radius = baseRadius.map(v => Math.max(0, v + props.radiusMod)) as [number, number, number, number];
            } else {
                 radius = Math.max(0, baseRadius + props.radiusMod);
            }

            if (layer.unit.shape === 'circle') {
                ctx.ellipse(0, 0, w/2, h/2, 0, 0, 2 * Math.PI);
            } else if (layer.unit.shape === 'triangle') {
                ctx.moveTo(0, -h/2);
                ctx.lineTo(w/2, h/2);
                ctx.lineTo(-w/2, h/2);
                ctx.closePath();
            } else if (layer.unit.shape === 'rect') {
                 const hasRadius = Array.isArray(radius) ? radius.some(r => r > 0) : radius > 0;
                 if (hasRadius) {
                     roundRect(ctx, -w/2, -h/2, w, h, radius);
                 } else {
                     ctx.rect(-w/2, -h/2, w, h);
                 }
            } else if (layer.unit.shape === 'custom' && layer.unit.customSvg) {
                 const p = new Path2D(layer.unit.customSvg);
                 
                 const bounds = layer.unit.customBounds || { x: 0, y: 0, width: 24, height: 24 }; // Fallback
                 // Auto-fit logic
                 const scale = Math.min(w / bounds.width, h / bounds.height);
                 
                 ctx.scale(scale, scale);
                 ctx.translate(-bounds.x - bounds.width/2, -bounds.y - bounds.height/2);
                 
                 ctx.fill(p);
                 if (layer.unit.strokeWidth > 0) ctx.stroke(p);
                 ctx.restore();
                 ctx.save(); 
            } else if (layer.unit.shape === 'custom') {
                 // Fallback X
                 ctx.moveTo(-w/2, -h/2); ctx.lineTo(w/2, h/2);
                 ctx.moveTo(w/2, -h/2); ctx.lineTo(-w/2, h/2);
            }
            
            if (layer.unit.shape !== 'custom') {
                ctx.fill();
                if (layer.unit.strokeWidth > 0) ctx.stroke();
            }

            ctx.restore();
          }
        }
    });

    // Grid Overlay (Active Layer Only)
    if (activeLayer.grid.toggle) {
        const { width: unitW, height: unitH, spacingX, spacingY, cols, rows } = activeLayer.grid;
        
        const gridWidth = (cols - 1) * spacingX;
        const gridHeight = (rows - 1) * spacingY;
        
        const startX = (rect.width - gridWidth) / 2;
        const startY = (rect.height - gridHeight) / 2;

        // 1. Grid Lines (spacing)
        ctx.strokeStyle = 'rgba(0, 255, 140, 0.5)'; // #00FF8C @ 50%
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Vertical lines
        for (let i = 0; i < cols; i++) {
            const x = startX + i * spacingX;
            ctx.moveTo(x, startY); ctx.lineTo(x, startY + gridHeight);
        }
        // Horizontal lines
        for (let j = 0; j < rows; j++) {
            const y = startY + j * spacingY;
            ctx.moveTo(startX, y); ctx.lineTo(startX + gridWidth, y);
        }
        ctx.stroke();

        // 2. Unit Shape Bounds (width/height)
        ctx.strokeStyle = 'rgba(0, 255, 140, 0.8)'; // #00FF8C @ 80%
        ctx.lineWidth = 1;
        
        // Apply transform scale to preview
        const scaledW = unitW * activeLayer.transform.scaleX;
        const scaledH = unitH * activeLayer.transform.scaleY;

        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
           for (let j = 0; j < rows; j++) {
               const x = startX + i * spacingX;
               const y = startY + j * spacingY;
               // Centered bounds with scale
               ctx.rect(x - scaledW/2, y - scaledH/2, scaledW, scaledH);
           }
        }
        ctx.stroke();
    }
  };

  // Trigger render on state change
  useEffect(() => {
    render();
  }, [state]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => render());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
      // Support direct scroll to zoom (Map style) since we don't have Pan yet
      e.preventDefault();
      // Adjust sensitivity: Mouse wheel is usually ~100, Trackpad is smaller
      const sensitivity = 0.1; 
      const delta = -e.deltaY * sensitivity;
      
      const newZoom = Math.max(10, Math.min(500, state.canvas.zoom + delta));
      dispatch({ type: 'SET_CANVAS', payload: { zoom: newZoom } });
  };

  return (
    <div 
        className="flex-1 h-full relative bg-[#0a0a0a] overflow-hidden canvas-container" 
        ref={containerRef}
        onWheel={handleWheel}
    >
      <canvas id="main-canvas" ref={canvasRef} className="absolute top-0 left-0 block" />
      <MaskOverlay state={state} dispatch={dispatch} />
      <GradientOverlay state={state} dispatch={dispatch} />
    </div>
  );
}
