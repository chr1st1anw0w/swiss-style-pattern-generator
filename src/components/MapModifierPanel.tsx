import React, { useRef } from 'react';
import { useGenerator } from './context/GeneratorContext';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { FigmaSlider } from './FigmaSlider';
import { Checkbox } from './ui/checkbox';
import { cn } from '../lib/utils';
import { MdUpload, MdClose, MdWaves, MdImage } from 'react-icons/md';

export const MapModifierPanel = () => {
    const { state, dispatch } = useGenerator();
    const { activeLayerId, layers } = state;
    const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, img.width, img.height);
                        // Default guess: Enable Scale X/Y and Offset X/Y
                        const currentSettings = activeLayer.mask.settings;
                        dispatch({ 
                            type: 'SET_MASK', 
                            payload: { 
                                imageUrl: event.target?.result as string,
                                imageData: imageData,
                                settings: {
                                    ...currentSettings,
                                    width: { ...currentSettings.width, enabled: true, min: 0.5, max: 1.5 },
                                    height: { ...currentSettings.height, enabled: true, min: 0.5, max: 1.5 },
                                    x: { ...currentSettings.x, enabled: true },
                                    y: { ...currentSettings.y, enabled: true }
                                }
                            } 
                        });
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMaskSettingChange = (key: string, updates: any) => {
        const currentSettings = activeLayer.mask.settings || {};
        const currentKeySettings = (currentSettings as any)[key] || { enabled: false, min: 0, max: 0 };
        
        const newSettings = {
            ...currentSettings,
            [key]: { ...currentKeySettings, ...updates }
        };
        dispatch({ type: 'SET_MASK', payload: { settings: newSettings } });
    };

    const maskSettingsOrder = [
        { key: 'width', label: 'Scale X', min: -1, max: 2, step: 0.01, suffix: 'x' },
        { key: 'height', label: 'Scale Y', min: -1, max: 2, step: 0.01, suffix: 'x' },
        { key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.01 },
        { key: 'rotation', label: 'Rotation', min: -180, max: 180, step: 1, suffix: '°' },
        { key: 'radius', label: 'Radius', min: 0, max: 100, step: 1, suffix: 'px' },
        { key: 'color', label: 'Color Shift', min: -100, max: 100, step: 1, suffix: '%' },
        { key: 'strokeWidth', label: 'Stroke Width', min: 0, max: 20, step: 0.5, suffix: 'px' },
        { key: 'x', label: 'Offset X', min: -100, max: 100, step: 1, suffix: 'px' },
        { key: 'y', label: 'Offset Y', min: -100, max: 100, step: 1, suffix: 'px' },
    ];

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Source Type</Label>
                <div className="flex rounded-md bg-[rgb(190,190,190)] p-1 gap-1">
                     <Button 
                        variant={activeLayer.mask.type === 'image' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="flex-1 text-xs h-7 bg-[rgba(129,129,129,0)] text-[rgb(48,48,48)]"
                        onClick={() => dispatch({ type: 'SET_MASK', payload: { type: 'image' } })}
                     >
                        <MdImage className="mr-1 w-3 h-3" /> Image
                     </Button>
                     <Button 
                        variant={activeLayer.mask.type === 'perlin' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="flex-1 text-xs h-7 bg-[rgb(5,5,5)]"
                        onClick={() => dispatch({ type: 'SET_MASK', payload: { type: 'perlin' } })}
                     >
                        <MdWaves className="mr-1 w-3 h-3" /> Perlin Noise
                     </Button>
                </div>
            </div>

            {activeLayer.mask.type === 'image' ? (
                 <div className="flex flex-col gap-3">
                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                        <MdUpload className="w-4 h-4 mr-2"/> Upload Image
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                    
                    {activeLayer.mask.imageUrl && (
                        <div className="relative w-full aspect-video rounded overflow-hidden border border-[var(--border)] group">
                            <img src={activeLayer.mask.imageUrl} className="w-full h-full object-cover opacity-50" alt="Mask"/>
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => dispatch({ type: 'SET_MASK', payload: { imageUrl: null } })}>
                                <MdClose className="w-3 h-3" />
                            </Button>
                        </div>
                    )}

                    {activeLayer.mask.imageUrl && (
                        <div className="flex items-center space-x-2 px-1">
                            <Checkbox 
                                id="mask-preview-check"
                                checked={activeLayer.mask.preview?.visible ?? false}
                                onCheckedChange={(c: boolean) => {
                                    const prev = activeLayer.mask.preview || { visible: false, opacity: 0.5 };
                                    dispatch({ 
                                        type: 'SET_MASK', 
                                        payload: { preview: { ...prev, visible: !!c } } 
                                    });
                                }}
                            />
                            <Label htmlFor="mask-preview-check" className="cursor-pointer text-xs">Preview on Canvas</Label>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50 bg-[rgba(194,194,194,0)]">
                     <FigmaSlider 
                        label="Noise Scale"
                        value={activeLayer.mask.perlin?.scale ?? 20}
                        min={1} max={200} step={1}
                        onValueChange={(v) => {
                            const current = activeLayer.mask.perlin || { scale: 20, seed: 0 };
                            dispatch({ type: 'SET_MASK', payload: { perlin: { ...current, scale: v } } });
                        }}
                     />
                     <FigmaSlider 
                         label="Seed"
                         value={activeLayer.mask.perlin?.seed ?? 0}
                         min={0} max={1000} step={1}
                         onValueChange={(v) => {
                            const current = activeLayer.mask.perlin || { scale: 20, seed: 0 };
                            dispatch({ type: 'SET_MASK', payload: { perlin: { ...current, seed: v } } });
                         }}
                     />
                 </div>
            )}

            <div className="space-y-3 pt-2 border-t border-border">
                <Label>Influence Map</Label>
                <div className="grid grid-cols-2 gap-4">
                    {maskSettingsOrder.map((item) => {
                        const settings = activeLayer.mask.settings as any;
                        const s = settings?.[item.key] || { enabled: false, min: item.min, max: item.max };
                        return (
                            <div key={item.key} className={cn("p-2 rounded border border-[var(--border)] bg-[var(--card)]/30", s.enabled ? "" : "opacity-60")}>
                                <FigmaSlider 
                                    label={
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox 
                                                id={`mask-${item.key}`} 
                                                checked={s.enabled} 
                                                onCheckedChange={(c: boolean) => handleMaskSettingChange(item.key, { enabled: !!c })}
                                            />
                                            <Label htmlFor={`mask-${item.key}`} className="text-xs font-medium cursor-pointer">{item.label}</Label>
                                        </div>
                                    }
                                    value={[s.min, s.max]} 
                                    min={item.min} max={item.max} step={item.step}
                                    onValueChange={(vals) => {
                                        if (Array.isArray(vals)) {
                                            handleMaskSettingChange(item.key, { min: vals[0], max: vals[1] });
                                        }
                                    }}
                                    suffix={item.suffix}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <FigmaSlider 
                label="Global Strength"
                value={activeLayer.mask.opacity}
                max={100} step={1}
                onValueChange={(v) => dispatch({ type: 'SET_MASK', payload: { opacity: v } })}
                suffix="%"
            />
        </div>
    );
};