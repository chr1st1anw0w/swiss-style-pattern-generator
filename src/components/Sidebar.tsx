import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGenerator, GradientStop, initialState, Preset, Layer } from './context/GeneratorContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Label } from './ui/label';
import { FigmaSlider } from './FigmaSlider';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { cn } from '../lib/utils';
import { 
  MdUpload, MdClose, MdDownload, MdRotateLeft, MdPalette, MdTextFields, MdLayers, 
  MdAutoAwesome, MdImage, MdDragIndicator, MdOpenInNew, 
  MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdAdd, MdDelete,
  MdAutoFixHigh, MdPsychology, MdSwapHoriz, MdViewModule, MdTrendingUp
} from 'react-icons/md';
import { useDrag, useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';

import { MapModifierPanel } from './MapModifierPanel';

const CustomSequenceInput = ({ values, onChange }: { values: number[], onChange: (vals: number[]) => void }) => {
    const [text, setText] = useState(values.join(', '));
    
    useEffect(() => {
        setText(values.join(', '));
    }, [values]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const commit = () => {
        const parsed = text.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        onChange(parsed);
    };

    return (
        <div className="space-y-2">
             <Label className="text-xs">Values (comma separated)</Label>
             <Textarea 
                value={text}
                onChange={handleChange}
                onBlur={commit}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
                className="font-mono text-xs h-20 bg-[var(--input)] border-[var(--border)]"
                placeholder="0, 45, 90..."
             />
             <div className="flex flex-wrap gap-2">
                 {[
                     { label: 'Binary', val: [0, 1] },
                     { label: 'Stairs', val: [0.2, 0.4, 0.6, 0.8] },
                     { label: 'Tri', val: [0, 1, 0] }
                 ].map(p => (
                     <button 
                        key={p.label}
                        onClick={() => onChange(p.val)}
                        className="text-[10px] px-2 py-1 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-whiactiveLayer.transition-colors border border-[var(--border)]"
                     >
                        {p.label}
                     </button>
                 ))}
             </div>
        </div>
    );
};

const SequenceCurvePreview = ({ type, customValues }: { type: string, customValues: number[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;
        
        // Handle High DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = cvs.getBoundingClientRect();
        
        // Only resize if dimensions mismatch to avoid flicker loop if used wrong
        if (cvs.width !== rect.width * dpr || cvs.height !== rect.height * dpr) {
            cvs.width = rect.width * dpr;
            cvs.height = rect.height * dpr;
        }
        
        ctx.scale(dpr, dpr);
        const w = rect.width;
        const h = rect.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // 1. Background & Grid
        // Subtle grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Horizontal
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.moveTo(0, h*0.25); ctx.lineTo(w, h*0.25);
        ctx.moveTo(0, h*0.75); ctx.lineTo(w, h*0.75);
        // Vertical
        const cols = 8;
        for(let i=1; i<cols; i++) {
            ctx.moveTo(i * w / cols, 0); ctx.lineTo(i * w / cols, h);
        }
        ctx.stroke();

        // 2. Calculate Curve Points
        const points: [number, number][] = [];
        const steps = 100;
        const padding = 4; // pixels
        const drawH = h - (padding * 2);
        
        for(let i=0; i<=steps; i++) {
            let t = i / steps;
            let y = t; // Linear
            
            if (type === 'geometric') y = t * t;
            else if (type === 'fibonacci') y = Math.pow(t, 1.618);
            else if (type === 'power') y = Math.pow(t, 3);
            else if (type === 'custom' && customValues.length > 0) {
                 // Smooth interpolation for custom values
                 const rawIdx = t * (customValues.length - 1);
                 const idx = Math.floor(rawIdx);
                 const nextIdx = Math.min(idx + 1, customValues.length - 1);
                 const mix = rawIdx - idx;
                 
                 const v1 = customValues[Math.min(idx, customValues.length - 1)] || 0;
                 const v2 = customValues[nextIdx] || 0;
                 
                 y = v1 + (v2 - v1) * mix;
            }
            
            // Clamp
            const vy = Math.max(0, Math.min(1, y));
            // Invert Y (Canvas 0 is top)
            const py = h - padding - (vy * drawH);
            const px = t * w;
            
            points.push([px, py]);
        }
        
        // 3. Gradient Fill
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(0, 163, 255, 0.4)'); // #00A3FF top
        gradient.addColorStop(1, 'rgba(0, 163, 255, 0.0)'); // Transparent bottom
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, h);
        if (points.length > 0) {
            ctx.lineTo(points[0][0], h); // Start bottom-left
            points.forEach(p => ctx.lineTo(p[0], p[1]));
            ctx.lineTo(w, h); // End bottom-right
        }
        ctx.closePath();
        ctx.fill();

        // 4. Stroke Line
        ctx.strokeStyle = '#00A3FF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p[0], p[1]);
            else ctx.lineTo(p[0], p[1]);
        });
        ctx.stroke();
        
    }, [type, customValues]);

    return <canvas ref={canvasRef} className="w-full h-16 bg-[var(--card)] rounded-md border border-[var(--border)] shadow-inner" />;
};

interface SidebarProps {
    className?: string;
}

const PANEL_CONFIG = {
  colors: { title: 'Colors', icon: MdPalette },
  presets: { title: 'AI & Presets', icon: MdAutoFixHigh },
  sequence: { title: 'Sequence System', icon: MdLayers },
  mask: { title: 'Map Modifier', icon: MdImage },
  effects: { title: 'Spatial Effects', icon: MdAutoAwesome },
};

// Sortable Item Component
interface SortablePanelProps {
  id: string;
  index: number;
  movePanel: (dragIndex: number, hoverIndex: number) => void;
  onFloat: (id: string) => void;
  children: React.ReactNode;
}

const SortablePanel = ({ id, index, movePanel, onFloat, children }: SortablePanelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: 'PANEL',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: unknown, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = (item as { index: number }).index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      movePanel(dragIndex, hoverIndex);
      (item as { index: number }).index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'PANEL',
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragHandleRef = useRef<HTMLDivElement>(null);
  const opacity = isDragging ? 0 : 1;
  
  drop(preview(ref));
  drag(dragHandleRef);

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId} className="group relative">
      <div ref={dragHandleRef} className="absolute left-0 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1">
         <MdDragIndicator className="w-4 h-4 text-[var(--text-muted)]" />
      </div>
      <div className="absolute right-8 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 hover:bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onFloat(id); }}
          >
              <MdOpenInNew className="w-3 h-3" />
          </Button>
      </div>
      <div className="bg-[var(--card)] relative rounded-xl w-full mx-0 my-0 border border-[var(--border)] shadow-sm">
          <div className="w-full">
              <div className="box-border flex flex-col p-3 relative w-full gap-2 bg-[rgba(0,0,0,0)]">
                  {children}
              </div>
          </div>
      </div>
    </div>
  );
};

// Draggable Floating Window Component
const FloatingWindow = ({ id, onClose, children }: { id: string, onClose: () => void, children: React.ReactNode }) => {
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 3 });
    const draggingRef = useRef(false);
    const offsetRef = useRef({ x: 0, y: 0 });
    const config = PANEL_CONFIG[id as keyof typeof PANEL_CONFIG];

    const handleMouseDown = (e: React.MouseEvent) => {
        draggingRef.current = true;
        offsetRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (draggingRef.current) {
            setPosition({
                x: e.clientX - offsetRef.current.x,
                y: e.clientY - offsetRef.current.y
            });
        }
    };

    const handleMouseUp = () => {
        draggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div 
            className="fixed z-50 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl flex flex-col overflow-hidden"
            style={{ left: position.x, top: position.y }}
        >
            <div 
                className="flex items-center justify-between px-3 py-2 bg-[var(--muted)]/30 cursor-move select-none border-b border-[var(--border)]"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    {React.createElement(config.icon, { className: "w-4 h-4 text-[var(--accent)]" })}
                    <span className="text-xs font-semibold">{config.title}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClose}>
                    <MdClose className="w-3 h-3" />
                </Button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto bg-[var(--card)]">
                {children}
            </div>
        </div>
    );
};

export function Sidebar({ className }: SidebarProps) {
  const { state, dispatch } = useGenerator();
  const activeLayer = state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const presetImportRef = useRef<HTMLInputElement>(null);
  
  // Sidebar State
  const [width, setWidth] = useState(320);
  const [collapsed, setCollapsed] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [panelOrder, setPanelOrder] = useState(['presets', 'sequence', 'mask', 'effects', 'colors']);
  const [floatingPanels, setFloatingPanels] = useState<string[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [draggingStopId, setDraggingStopId] = useState<string | null>(null);
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const gradientRef = useRef<HTMLDivElement>(null);

  // Resizing Logic
  const startResizing = useCallback(() => {
    setResizing(true);
  }, []);

  useEffect(() => {
    const stopResizing = () => setResizing(false);
    const resize = (e: MouseEvent) => {
        if (resizing) {
            setWidth(Math.max(240, Math.min(600, e.clientX)));
        }
    };

    if (resizing) {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
    }
    return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
    };
  }, [resizing]);

  // Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.metaKey || e.ctrlKey) {
              if (e.key === 'z') {
                  e.preventDefault();
                  if (e.shiftKey) {
                      dispatch({ type: 'REDO' });
                  } else {
                      dispatch({ type: 'UNDO' });
                  }
              } else if (e.key === 's') {
                  e.preventDefault();
                  const shape = activeLayer.unit.shape;
                  const seq = activeLayer.sequence.type;
                  const name = `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${seq !== 'none' ? seq.charAt(0).toUpperCase() + seq.slice(1) : 'Style'}`;
                  setPresetName(name);
                  setSavePresetOpen(true);
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, activeLayer.unit.shape, activeLayer.sequence.type]);

  // Dragging Logic for Gradient
  const gradientStateRef = useRef(activeLayer.colors.gradient);
  useEffect(() => { gradientStateRef.current = activeLayer.colors.gradient; }, [activeLayer.colors.gradient]);

  useEffect(() => {
    if (draggingStopId) {
        const handleMouseMove = (e: MouseEvent) => {
            if (!gradientRef.current) return;
            const rect = gradientRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            const currentGradient = gradientStateRef.current;
            const newStops = currentGradient.stops.map(s => 
                s.id === draggingStopId ? { ...s, position: percent } : s
            );
            
            dispatch({ 
                type: 'SET_COLORS', 
                payload: { 
                    gradient: { ...currentGradient, stops: newStops } 
                } 
            });
        };
        const handleMouseUp = () => setDraggingStopId(null);
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }
  }, [draggingStopId, dispatch]);

  // DnD Logic
  const movePanel = useCallback((dragIndex: number, hoverIndex: number) => {
    setPanelOrder((prevCards) => {
      const newCards = [...prevCards];
      const draggedCard = newCards[dragIndex];
      newCards.splice(dragIndex, 1);
      newCards.splice(hoverIndex, 0, draggedCard);
      return newCards;
    });
  }, []);

  const toggleFloat = (id: string) => {
      if (floatingPanels.includes(id)) {
          setFloatingPanels(prev => prev.filter(p => p !== id));
      } else {
          setFloatingPanels(prev => [...prev, id]);
      }
  };

  // Paste Logic for SVG
  useEffect(() => {
      const handlePaste = (e: ClipboardEvent) => {
          const text = e.clipboardData?.getData('text');
          if (!text) return;
          
          if (text.includes('<svg') || text.includes('d="')) {
              // Simple parser to extract path d
              // This is naive, for production we might want a full DOMParser
              const parser = new DOMParser();
              const doc = parser.parseFromString(text, "image/svg+xml");
              const path = doc.querySelector('path')?.getAttribute('d');
              
              if (path) {
                  dispatch({ type: 'SET_UNIT', payload: { shape: 'custom', customSvg: path } });
              } else {
                   // Try to find primitives and convert to path if needed, or just assume it's a path string if it starts with M
                   if (text.trim().startsWith('M')) {
                        dispatch({ type: 'SET_UNIT', payload: { shape: 'custom', customSvg: text } });
                   }
              }
          }
      };

      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
  }, [dispatch]);


  // AI Pattern Generator (Mock)
  const handleGeneratePattern = () => {
      if (!promptText.trim()) return;
      setIsGenerating(true);
      
      // Simulate AI processing delay
      setTimeout(() => {
          const text = promptText.toLowerCase();
          const base = { ...state };
          // Create a deep copy for modification to avoid direct mutation issues if any
          let newState = JSON.parse(JSON.stringify(base));

          // Heuristic Rules based on keywords
          if (text.includes('rain') || text.includes('drop')) {
               newState.unit.shape = 'rect';
               newState.unit.scale = 0.5;
               newState.transform.rotation = 15;
               newState.grid.rows = 20;
               newState.grid.cols = 40;
               newState.sequence.type = 'custom';
               newState.sequence.customValues = [0.1, 0.4, 0.7, 1.0, 0.2];
               newState.transform.variance = 0.3;
          } 
          else if (text.includes('circle') || text.includes('bubble') || text.includes('dot')) {
               newState.unit.shape = 'circle';
               newState.grid.spacingX = 10;
               newState.grid.spacingY = 10;
               newState.distortion.vortexAmount = 20;
          }
          else if (text.includes('glitch') || text.includes('chaos') || text.includes('noise')) {
               newState.distortion.waveAmount = 80;
               newState.distortion.waveFreq = 9;
               newState.transform.variance = 1.0;
               newState.transform.skewX = 45;
          }
          else if (text.includes('wave') || text.includes('flow') || text.includes('sea')) {
               newState.distortion.waveAmount = 40;
               newState.distortion.waveFreq = 3;
               newState.sequence.type = 'geometric';
               newState.sequence.direction = 'row';
          }
          else if (text.includes('grid') || text.includes('box') || text.includes('square')) {
               newState.unit.shape = 'rect';
               newState.grid.spacingX = 2;
               newState.grid.spacingY = 2;
               newState.transform.variance = 0;
               newState.distortion.waveAmount = 0;
          }

          // Apply
          dispatch({ type: 'LOAD_PRESET', payload: newState });
          setIsGenerating(false);
      }, 1000);
  };

  // Helper Functions
  const handleSliderChange = (category: string, field: string, value: number[]) => {
    dispatch({ type: `SET_${category.toUpperCase()}` as any, payload: { [field]: value[0] } });
  };
  
  const handleInputChange = (category: string, field: string, value: any) => {
    dispatch({ type: `SET_${category.toUpperCase()}` as any, payload: { [field]: value } });
  };

  // Gradient Helpers
  const handleGradientChange = (field: string, value: any) => {
     dispatch({ type: 'SET_COLORS', payload: { gradient: { ...activeLayer.colors.gradient, [field]: value } } });
  };

  const handleSavePreset = () => {
      const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      
      const thumbnail = canvas.toDataURL('image/jpeg', 0.4);
      // @ts-ignore - Dynamic destructuring
      const { presets, history, ...stateToSave } = state;
      
      const newPreset: Preset = {
          id: uuidv4(),
          name: presetName || `Preset ${state.presets.length + 1}`,
          thumbnail,
          state: stateToSave,
          timestamp: Date.now()
      };
      
      dispatch({ type: 'ADD_PRESET', payload: newPreset });
      setSavePresetOpen(false);
      setPresetName('');
  };

  const addStop = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      if (activeLayer.colors.gradient.stops.length >= 10) return;

      const newStop = { id: uuidv4(), color: '#ffffff', position: pos };
      const newStops = [...activeLayer.colors.gradient.stops, newStop].sort((a, b) => a.position - b.position);
      
      dispatch({ type: 'SET_COLORS', payload: { gradient: { ...activeLayer.colors.gradient, stops: newStops } } });
      setSelectedStopId(newStop.id);
  };

  const updateStop = (id: string, updates: Partial<GradientStop>) => {
      const newStops = activeLayer.colors.gradient.stops.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => a.position - b.position);
      dispatch({ type: 'SET_COLORS', payload: { gradient: { ...activeLayer.colors.gradient, stops: newStops } } });
  };

  const deleteStop = (id: string) => {
      if (activeLayer.colors.gradient.stops.length <= 2) return; // Min 2 stops
      const newStops = activeLayer.colors.gradient.stops.filter(s => s.id !== id);
      dispatch({ type: 'SET_COLORS', payload: { gradient: { ...activeLayer.colors.gradient, stops: newStops } } });
      if (selectedStopId === id) setSelectedStopId(null);
  };

  const handleInfluenceChange = (checked: boolean, value: string) => {
    const current = activeLayer.mask.influence;
    const next = checked ? [...current, value] : current.filter(v => v !== value);
    dispatch({ type: 'SET_MASK', payload: { influence: next } });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => { dispatch({ type: 'SET_MASK', payload: { imageUrl: url } }); };
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // 1. Analyze Image
            const aspect = img.width / img.height;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Resize for analysis
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(img, 0, 0, 100, 100);
            const data = ctx.getImageData(0, 0, 100, 100).data;

            // 2. Extract Colors (Quantization)
            const colorCounts: Record<string, number> = {};
            for(let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
                const r = Math.floor(data[i] / 32) * 32;
                const g = Math.floor(data[i+1] / 32) * 32;
                const b = Math.floor(data[i+2] / 32) * 32;
                const key = `${r},${g},${b}`;
                colorCounts[key] = (colorCounts[key] || 0) + 1;
            }
            
            const sortedColors = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([k]) => {
                    const [r,g,b] = k.split(',').map(Number);
                    const toHex = (n: number) => n.toString(16).padStart(2, '0');
                    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                });

            const background = sortedColors[0] || '#111111';
            
            // Construct gradient from secondary dominant colors
            const newStops: GradientStop[] = [];
            const gradientColors = sortedColors.slice(1); // Use others for gradient
            if (gradientColors.length > 0) {
                gradientColors.forEach((color, index) => {
                    newStops.push({
                        id: uuidv4(),
                        position: Math.round((index / Math.max(1, gradientColors.length - 1)) * 100),
                        color
                    });
                });
            } else {
                 // Fallback if image is single color
                 newStops.push({ id: uuidv4(), position: 0, color: background });
                 newStops.push({ id: uuidv4(), position: 100, color: background });
            }

            // 3. Grid System Analysis
            // Attempt to match density approx 40 cols, but respect aspect ratio
            const cols = 40;
            const rows = Math.round(cols / aspect);

            // 4. Construct State
            const newState = {
                ...state,
                colors: { 
                    ...state.colors, 
                    gradient: { ...activeLayer.colors.gradient, stops: newStops },
                    background 
                },
                mask: {
                    ...activeLayer.mask,
                    type: 'image' as const,
                    imageUrl: event.target?.result as string,
                    opacity: 100,
                    settings: {
                         ...activeLayer.mask.settings,
                         width: { enabled: true, min: 2, max: 30 },
                         height: { enabled: true, min: 2, max: 30 },
                         opacity: { enabled: true, min: 0.2, max: 1.0 }
                    }
                },
                grid: {
                    ...activeLayer.grid,
                    cols: cols, 
                    rows: rows,
                    // Default integer spacing
                    spacingX: 0, 
                    spacingY: 0,
                    width: 20, 
                    height: 20
                },
                unit: {
                    ...activeLayer.unit,
                    shape: 'rect' as const, // Default to rect as requested
                    strokeWidth: 0
                }
            };
            
            dispatch({ type: 'LOAD_PRESET', payload: newState });
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleExportPresets = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.presets));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "presets.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (Array.isArray(json)) {
                  json.forEach((p: Preset) => {
                      if (p.name && p.state) {
                          dispatch({ type: 'ADD_PRESET', payload: { ...p, id: uuidv4() } });
                      }
                  });
              }
          } catch (err) {
              console.error("Failed to parse presets", err);
          }
      };
      reader.readAsText(file);
  };

  // Render Content Helper
  const renderPanelContent = (id: string, isFloating: boolean = false) => {
      switch (id) {
          case 'colors':
              const gradientStyle = {
                  background: `linear-gradient(90deg, ${activeLayer.colors.gradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
              };
              const selectedStop = activeLayer.colors.gradient.stops.find(s => s.id === selectedStopId);

              return (
                <div className="space-y-4">
                    {/* Gradient Preview & Editor */}
                    <div className="space-y-2 m-[4px] p-[4px]">
                        <Label>Gradient</Label>
                        <div 
                            ref={gradientRef}
                            className="h-6 w-full rounded cursor-crosshair relative border border-[var(--border)]"
                            style={gradientStyle}
                            onClick={addStop}
                        >
                            {activeLayer.colors.gradient.stops.map(stop => (
                                <div 
                                    key={stop.id}
                                    className={cn(
                                        "absolute top-0 h-full w-3 -ml-1.5 border-2 border-white shadow-md cursor-grab hover:scale-110 transition-transform",
                                        selectedStopId === stop.id ? "z-10 scale-110 border-black" : ""
                                    )}
                                    style={{ left: `${stop.position}%`, backgroundColor: stop.color }}
                                    onMouseDown={(e) => { 
                                        e.stopPropagation(); 
                                        setSelectedStopId(stop.id);
                                        setDraggingStopId(stop.id);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>

                     {/* Selected Stop Controls */}
                     {selectedStop && (
                         <div className="p-3 bg-[var(--card)] rounded border border-[var(--border)] space-y-3">
                             <div className="flex justify-between items-center">
                                 <span className="text-xs font-semibold">Stop {activeLayer.colors.gradient.stops.indexOf(selectedStop) + 1}</span>
                                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => deleteStop(selectedStop.id)} disabled={activeLayer.colors.gradient.stops.length <= 2}>
                                     <MdDelete className="w-3 h-3" />
                                 </Button>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                     <Label className="text-[var(--font-xs)]">Color</Label>
                                     <div className="flex items-center gap-2 mt-1">
                                        <input type="color" value={selectedStop.color} onChange={(e) => updateStop(selectedStop.id, { color: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"/>
                                        <span className="text-[var(--font-xs)] font-mono">{selectedStop.color}</span>
                                     </div>
                                 </div>
                                 <div>
                                     <Label className="text-[var(--font-xs)]">Position (%)</Label>
                                     <Input 
                                        type="number" 
                                        min={0} max={100} 
                                        value={Math.round(selectedStop.position)} 
                                        onChange={(e) => updateStop(selectedStop.id, { position: Number(e.target.value) })}
                                        className="h-7 mt-1 text-xs"
                                     />
                                 </div>
                             </div>
                         </div>
                     )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={activeLayer.colors.gradient.type} onValueChange={(val: string) => handleGradientChange('type', val)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="linear">Linear</SelectItem>
                                    <SelectItem value="radial">Radial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                             <FigmaSlider 
                                label="Angle" 
                                value={activeLayer.colors.gradient.angle} 
                                max={360} 
                                onValueChange={(v) => handleGradientChange('angle', v)}
                                suffix="°"
                            />
                        </div>
                    </div>
               </div>
              );


            case 'presets':
                const loadPreset = (preset: Preset) => {
                    const newState = {
                        ...initialState,
                        ...preset.state,
                        presets: state.presets, 
                        history: { past: [], future: [] }
                    };
                    dispatch({ type: 'LOAD_PRESET', payload: newState });
                };

                const applySystemPreset = (id: string) => {
                    const defaultLayer = initialState.layers[0];
                    let newLayer = JSON.parse(JSON.stringify(defaultLayer)); // Deep copy
                    let newBackground = initialState.colors.background;

                    // Base for monochrome styles
                    newLayer.colors.gradient.stops = [{id:'1', position:0, color:'#ffffff'}, {id:'2', position:100, color:'#eeeeee'}];
                    newLayer.grid.lineColor = 'transparent';
                    newBackground = '#111111';
                    
                    switch(id) {
                        case 'layer-lines':
                            newLayer.grid = { ...newLayer.grid, cols: 20, rows: 10, spacingX: 20, spacingY: 30, width: 15, height: 80, lineColor: 'rgba(255,0,0,0.2)' };
                            newLayer.unit = { ...newLayer.unit, shape: 'rect', strokeColor: '#FF3333', strokeWidth: 0 };
                            newLayer.colors.gradient.stops = [{id:'1', position:0, color:'#FF3333'}, {id:'2', position:100, color:'#CC0000'}];
                            newLayer.transform = { ...newLayer.transform, skewX: -20, scaleY: 1.2, rotation: 0, scaleX: 1, variance: 0, skewY: 0 };
                            newBackground = '#000000';
                            break;
                            
                        case 'helvetica-grid':
                            newLayer.grid = { ...newLayer.grid, cols: 12, rows: 12, spacingX: 45, spacingY: 45, width: 35, height: 35, lineColor: 'transparent' };
                            newLayer.unit = { ...newLayer.unit, shape: 'circle', strokeWidth: 4, strokeColor: '#ffffff', borderRadius: 100 };
                            newLayer.colors.gradient.stops = [{id:'1', position:0, color:'transparent'}, {id:'2', position:100, color:'transparent'}];
                            break;
                            
                        case 'kinetic-slant':
                            newLayer.grid = { ...newLayer.grid, cols: 20, rows: 20, spacingX: 25, spacingY: 25, width: 4, height: 45, lineColor: 'transparent' };
                            newLayer.unit = { ...newLayer.unit, shape: 'rect' };
                            newLayer.transform = { ...newLayer.transform, rotation: 45, scaleX: 1, scaleY: 1, variance: 0, skewX: 0, skewY: 0 };
                            break;

                         case 'grid-x':
                             const pathX = "M-10,-10L10,10M10,-10L-10,10";
                             newLayer.grid = { ...newLayer.grid, cols: 15, rows: 15, spacingX: 35, spacingY: 35, width: 20, height: 20, lineColor: 'transparent' };
                             newLayer.unit = { ...newLayer.unit, shape: 'custom', customSvg: pathX, strokeWidth: 3, strokeColor: '#ffffff' };
                             newLayer.colors.gradient.stops = [{id:'1', position:0, color:'transparent'}, {id:'2', position:100, color:'transparent'}];
                            break;

                         case 'warp-field':
                             newLayer.grid = { ...newLayer.grid, cols: 30, rows: 30, spacingX: 15, spacingY: 15, width: 8, height: 8, lineColor: 'transparent' };
                             newLayer.unit = { ...newLayer.unit, shape: 'rect', borderRadius: 2 };
                             newLayer.distortion = { ...newLayer.distortion, waveAmount: 15, waveFreq: 5, vortexAmount: 0 };
                             newLayer.transform = { ...newLayer.transform, scaleX: 0.8, scaleY: 0.8, rotation: 0, variance: 0.2, skewX: 0, skewY: 0 };
                             break;
                    }
                    
                    const newState = {
                        ...initialState,
                        layers: [newLayer],
                        activeLayerId: newLayer.id,
                        colors: { ...initialState.colors, background: newBackground },
                        presets: state.presets,
                        history: { past: [], future: [] }
                    };

                    dispatch({ type: 'LOAD_PRESET', payload: newState });
                };

                const randomize = () => {
                     const r = () => Math.random();
                     const vary = (val: number, range: number) => val + (r() - 0.5) * range;
                     const quantize = (val: number, step: number) => Math.round(val / step) * step;
                     
                     // 1. Transform: Orderly Rotation (Snap to 15deg)
                     const newTransform = {
                         ...activeLayer.transform,
                         rotation: quantize(vary(activeLayer.transform.rotation, 90), 15),
                         variance: Math.max(0, vary(activeLayer.transform.variance, 0.2)),
                         skewX: vary(activeLayer.transform.skewX || 0, 10),
                         skewY: vary(activeLayer.transform.skewY || 0, 10),
                         scaleX: Math.max(0.5, Math.min(2, vary(activeLayer.transform.scaleX, 0.5))),
                         scaleY: Math.max(0.5, Math.min(2, vary(activeLayer.transform.scaleY, 0.5))),
                     };

                     // 2. Distortion: Controlled
                     const newDistortion = {
                        ...activeLayer.distortion,
                        waveAmount: activeLayer.distortion.enabled ? vary(activeLayer.distortion.waveAmount, 5) : 0,
                        waveFreq: activeLayer.distortion.enabled ? Math.max(0.1, vary(activeLayer.distortion.waveFreq, 0.5)) : 1.0,
                    };

                    // 3. Grid: Spacing (Snap to 5)
                    const newGrid = {
                        ...activeLayer.grid,
                        spacingX: Math.max(10, Math.min(100, quantize(vary(activeLayer.grid.spacingX, 20), 5))),
                        spacingY: Math.max(10, Math.min(100, quantize(vary(activeLayer.grid.spacingY, 20), 5))),
                    };

                    // 4. Sequence: Targets
                    let newSequence = { ...activeLayer.sequence };
                    if (activeLayer.sequence.enabled) {
                        const t = { ...activeLayer.sequence.targets };
                        if (t.sizeX.enabled) {
                            t.sizeX.min = Math.max(0.1, vary(t.sizeX.min, 0.4));
                            t.sizeX.max = Math.max(0.1, vary(t.sizeX.max, 0.4));
                        }
                        if (t.rotation.enabled) {
                             t.rotation.min = quantize(vary(t.rotation.min, 45), 15);
                             t.rotation.max = quantize(vary(t.rotation.max, 45), 15);
                        }
                        newSequence.targets = t;
                        newSequence.angle = quantize(vary(activeLayer.sequence.angle, 90), 45);
                    }

                    // 5. Colors: Gradient Angle
                    let newGradient = { ...activeLayer.colors.gradient };
                    newGradient.angle = quantize(vary(activeLayer.colors.gradient.angle, 45), 45);

                     dispatch({ type: 'SET_TRANSFORM', payload: newTransform });
                     dispatch({ type: 'SET_DISTORTION', payload: newDistortion });
                     dispatch({ type: 'SET_GRID', payload: newGrid });
                     dispatch({ type: 'SET_SEQUENCE', payload: newSequence });
                     dispatch({ type: 'SET_COLORS', payload: { gradient: newGradient } });
                };



                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <Label>Style Presets</Label>
                                 <div className="flex gap-1">
                                     <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleExportPresets} title="Export Presets">
                                         <MdDownload className="w-3 h-3" />
                                     </Button>
                                     <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => presetImportRef.current?.click()} title="Import Presets">
                                         <MdUpload className="w-3 h-3" />
                                     </Button>
                                 </div>
                             </div>
                             <input ref={presetImportRef} type="file" accept=".json" className="hidden" onChange={handleImportPresets} />
                             <Dialog open={savePresetOpen} onOpenChange={setSavePresetOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                                        <MdAdd className="mr-1 w-3 h-3" /> Save Current
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-card border-border">
                                    <DialogHeader>
                                        <DialogTitle>Save Preset</DialogTitle>
                                        <DialogDescription>Enter a name for your new preset.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-2">
                                        <Label>Preset Name</Label>
                                        <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="My Cool Pattern" />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSavePreset}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                             </Dialog>
                        </div>

                        {state.presets && state.presets.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {state.presets.map(preset => (
                                    <div key={preset.id} className="relative group border border-[var(--border)] rounded-md overflow-hidden cursor-pointer bg-[var(--card)] hover:ring-1 ring-[var(--accent)] transition-all" onClick={() => loadPreset(preset)}>
                                        <div className="aspect-video bg-[var(--muted)]">
                                            <img src={preset.thumbnail} alt={preset.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-2 flex items-center justify-between bg-[var(--card)]">
                                            <span className="text-[10px] truncate font-medium">{preset.name}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-4 w-4 text-[var(--text-muted)] hover:text-destructive p-0"
                                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); dispatch({ type: 'DELETE_PRESET', payload: preset.id }); }}
                                            >
                                                <MdDelete className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">System</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" className="h-auto py-2 flex flex-col gap-1" onClick={() => applySystemPreset('layer-lines')}>
                                    <MdLayers className="w-4 h-4 mb-1" />
                                    <span className="text-[10px]">Layers</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-2 flex flex-col gap-1" onClick={() => applySystemPreset('helvetica-grid')}>
                                    <div className="w-4 h-4 rounded-full border-2 border-current mb-1" />
                                    <span className="text-[10px]">Circles</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-2 flex flex-col gap-1" onClick={() => applySystemPreset('kinetic-slant')}>
                                    <MdTrendingUp className="w-4 h-4 mb-1" />
                                    <span className="text-[10px]">Slant</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-2 flex flex-col gap-1" onClick={() => applySystemPreset('grid-x')}>
                                    <MdClose className="w-4 h-4 mb-1" />
                                    <span className="text-[10px]">Grid X</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-2 flex flex-col gap-1" onClick={() => applySystemPreset('warp-field')}>
                                    <MdViewModule className="w-4 h-4 mb-1" />
                                    <span className="text-[10px]">Warp</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-[var(--border)] space-y-3">
                            <Label className="flex items-center gap-2">
                                <MdAutoAwesome className="w-4 h-4 text-[var(--accent)]" />
                                AI Variation
                            </Label>
                            <p className="text-[var(--text-muted)] text-xs">Randomly mutate current parameters to find new styles.</p>
                            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:opacity-90" onClick={randomize}>
                                Generate Variation
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-[var(--border)] space-y-3">
                            <Label className="flex items-center gap-2">
                                <MdPsychology className="w-4 h-4" />
                                Prompt to Pattern
                            </Label>
                            <Textarea 
                                placeholder="Describe the pattern (e.g. 'Glitchy rain', 'Chaos', 'Circles')..." 
                                className="min-h-[80px] text-xs resize-none bg-[var(--input)]" 
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGeneratePattern(); } }}
                            />
                            <Button 
                                variant="default" 
                                className="w-full text-xs"
                                onClick={handleGeneratePattern}
                                disabled={isGenerating || !promptText.trim()}
                            >
                                {isGenerating ? (
                                    <>
                                        <MdAutoAwesome className="mr-2 w-3 h-3 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    "Generate Pattern"
                                )}
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-[var(--border)] space-y-3">
                            <Label className="flex items-center gap-2">
                                <MdImage className="w-4 h-4" />
                                Image to Image
                            </Label>
                            <Button variant="outline" className="w-full border-dashed text-[var(--text-muted)]" onClick={() => referenceInputRef.current?.click()}>
                                <MdUpload className="w-4 h-4 mr-2" /> Upload Reference
                            </Button>
                            <input ref={referenceInputRef} type="file" accept="image/*" className="hidden" onChange={handleReferenceUpload} />
                        </div>
                    </div>
                );

            case 'sequence':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Sequence Type</Label>
                            <Select value={activeLayer.sequence.type} onValueChange={(val: string) => handleInputChange('sequence', 'type', val)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="linear">Linear</SelectItem>
                                    <SelectItem value="geometric">Geometric</SelectItem>
                                    <SelectItem value="fibonacci">Fibonacci</SelectItem>
                                    <SelectItem value="custom">Custom (Array)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {activeLayer.sequence.type !== 'none' && (
                            <>
                                <div className="grid grid-cols-2 gap-4 pb-2">
                                    <FigmaSlider 
                                        label="Skew X" 
                                        value={activeLayer.transform.skewX || 0} 
                                        min={-60} max={60} step={1} 
                                        onValueChange={(v) => dispatch({ type: 'SET_TRANSFORM', payload: { ...activeLayer.transform, skewX: v } })}
                                        suffix="°"
                                    />
                                    <FigmaSlider 
                                        label="Skew Y" 
                                        value={activeLayer.transform.skewY || 0} 
                                        min={-60} max={60} step={1} 
                                        onValueChange={(v) => dispatch({ type: 'SET_TRANSFORM', payload: { ...activeLayer.transform, skewY: v } })}
                                        suffix="°"
                                    />
                                </div>
                                
                                {activeLayer.sequence.type === 'custom' && (
                                    <CustomSequenceInput 
                                        values={activeLayer.sequence.customValues || []} 
                                        onChange={(vals) => dispatch({ type: 'SET_SEQUENCE', payload: { customValues: vals } })} 
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Flow</Label>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className={cn("h-5 w-5", activeLayer.sequence.reverse ? "text-[var(--accent)]" : "text-[var(--text-muted)]")}
                                                onClick={() => handleInputChange('sequence', 'reverse', !activeLayer.sequence.reverse)}
                                                title="Reverse Direction"
                                            >
                                                <MdSwapHoriz className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <Select value={activeLayer.sequence.direction} onValueChange={(val: string) => handleInputChange('sequence', 'direction', val)}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="row">Row</SelectItem>
                                                <SelectItem value="column">Column</SelectItem>
                                                <SelectItem value="radial">Radial</SelectItem>
                                                <SelectItem value="diagonal">Diagonal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                         <FigmaSlider 
                                            label="Angle"
                                            value={activeLayer.sequence.angle || 0}
                                            min={-180} max={180} step={1}
                                            onValueChange={(v) => handleSliderChange('sequence', 'angle', [v])}
                                            suffix="°"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 space-y-3 border-t border-[var(--border)]">
                                    <Label className="text-xs font-semibold">Target Parameters</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'sizeX', label: 'Size X', min: -1, max: 2, step: 0.1, suffix: '' },
                                        { id: 'sizeY', label: 'Size Y', min: -1, max: 2, step: 0.1, suffix: '' },
                                        { id: 'rotation', label: 'Rotation', min: -180, max: 180, step: 1, suffix: '°' },
                                        { id: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.01, suffix: '' },
                                        { id: 'offsetX', label: 'Offset X', min: -100, max: 100, step: 1, suffix: 'px' },
                                        { id: 'offsetY', label: 'Offset Y', min: -100, max: 100, step: 1, suffix: 'px' }
                                    ].map((target) => {
                                        const tState = activeLayer.sequence.targets[target.id as keyof typeof activeLayer.sequence.targets];
                                        if (!tState) return null; 
                                        
                                        return (
                                            <div key={target.id} className={cn("p-2 rounded border border-[var(--border)] bg-[var(--card)]/30", tState.enabled ? "" : "opacity-60")}>
                                                <FigmaSlider 
                                                    label={
                                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox 
                                                                id={`seq-${target.id}`} 
                                                                checked={tState.enabled}
                                                                onCheckedChange={(checked: boolean) => {
                                                                    dispatch({ 
                                                                        type: 'SET_SEQUENCE', 
                                                                        payload: { 
                                                                            targets: {
                                                                                ...activeLayer.sequence.targets,
                                                                                [target.id]: { ...tState, enabled: !!checked }
                                                                            }
                                                                        } 
                                                                    });
                                                                }}
                                                            />
                                                            <Label htmlFor={`seq-${target.id}`} className="text-xs font-medium cursor-pointer">{target.label}</Label>
                                                        </div>
                                                    }
                                                    value={[tState.min, tState.max]} 
                                                    min={target.min} max={target.max} step={target.step}
                                                    onValueChange={(vals) => {
                                                        if (Array.isArray(vals)) {
                                                            dispatch({ 
                                                                type: 'SET_SEQUENCE', 
                                                                payload: { 
                                                                    targets: {
                                                                        ...activeLayer.sequence.targets,
                                                                        [target.id]: { ...tState, min: vals[0], max: vals[1] }
                                                                    }
                                                                } 
                                                            });
                                                        }
                                                    }}
                                                    suffix={target.suffix}
                                                />
                                            </div>
                                        );
                                    })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'mask':
                return <MapModifierPanel />;
            case 'effects':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <FigmaSlider 
                            label="Wave Amount"
                            value={activeLayer.distortion.waveAmount}
                            max={100} step={1}
                            onValueChange={(v) => handleSliderChange('distortion', 'waveAmount', [v])}
                        />
                        <FigmaSlider 
                            label="Wave Frequency"
                            value={activeLayer.distortion.waveFreq}
                            min={0.1} max={10} step={0.1}
                            onValueChange={(v) => handleSliderChange('distortion', 'waveFreq', [v])}
                        />
                        <FigmaSlider 
                            label="Vortex Amount"
                            value={activeLayer.distortion.vortexAmount}
                            min={-100} max={100} step={1}
                            onValueChange={(v) => handleSliderChange('distortion', 'vortexAmount', [v])}
                        />
                        <FigmaSlider 
                            label="Vortex Radius"
                            value={activeLayer.distortion.vortexRadius}
                            min={50} max={800} step={10}
                            onValueChange={(v) => handleSliderChange('distortion', 'vortexRadius', [v])}
                        />
                    </div>
                );
            default:
                return null;
      }
  };

  return (
    <>
        <div 
            className={cn("flex h-full flex-col bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] relative transition-all duration-200 ease-in-out", className)}
            style={{ width: collapsed ? '60px' : `${width}px` }}
        >
            {/* Resize Handle */}
            {!collapsed && (
                <div 
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors z-50"
                    onMouseDown={startResizing}
                />
            )}

            {/* Header */}
            <div className={cn("flex items-center py-4 border-b border-[var(--sidebar-border)]", collapsed ? "justify-center px-0" : "justify-between px-6")}>
                {!collapsed && (
                    <div className="flex flex-col">
                         <h1 className="font-bold text-[var(--sidebar-foreground)] whitespace-nowrap overflow-hidden text-ellipsis text-xl">Geometric</h1>
                        
                    </div>
                )}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <MdKeyboardDoubleArrowRight className="w-4 h-4" /> : <MdKeyboardDoubleArrowLeft className="w-4 h-4" />}
                </Button>
            </div>

            {/* Scroll Area & Accordion */}
            {!collapsed && (
                <div className="flex-1 px-4 py-4 overflow-y-auto bg-[rgba(0,0,0,0)]">
                    <Accordion 
                        type="multiple" 
                        defaultValue={['unit', 'sequence', 'mask', 'colors']} 
                        className="space-y-4"
                        onValueChange={(vals: string[]) => {
                            const showColors = vals.includes('colors');
                            if (showColors !== state.colors.showCanvasControls) {
                                dispatch({ type: 'SET_COLORS', payload: { showCanvasControls: showColors } });
                            }
                        }}
                    >
                        {panelOrder.map((id, index) => {
                                if (floatingPanels.includes(id)) return null;
                                const config = PANEL_CONFIG[id as keyof typeof PANEL_CONFIG];
                                
                                const enabledPanels = ['sequence', 'mask', 'effects', 'distortion', 'transform'];
                                const hasCheckbox = enabledPanels.includes(id);
                                const isEnabled = hasCheckbox ? (activeLayer[id as keyof Layer] as any)?.enabled : false;

                                return (
                                    <SortablePanel key={id} id={id} index={index} movePanel={movePanel} onFloat={toggleFloat}>
                                        <AccordionItem value={id} className="border-none">
                                            <AccordionTrigger className="hover:no-underline py-2 px-1 group">
                                                <div className="flex flex-1 items-center justify-between mr-2">
                                                    <span className="text-sm font-medium text-[14px] font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{config.title}</span>
                                                    {hasCheckbox && (
                                                        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                                                            <Checkbox 
                                                                checked={isEnabled}
                                                                onCheckedChange={(c: boolean) => {
                                                                    const typeMap: Record<string, string> = {
                                                                        sequence: 'SET_SEQUENCE',
                                                                        mask: 'SET_MASK',
                                                                        effects: 'SET_EFFECTS',
                                                                        distortion: 'SET_DISTORTION',
                                                                        transform: 'SET_TRANSFORM'
                                                                    };
                                                                    const actionType = typeMap[id];
                                                                    if (actionType) {
                                                                        dispatch({ type: actionType as any, payload: { enabled: !!c } });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pt-2 px-1">
                                                {renderPanelContent(id)}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </SortablePanel>
                                );
                            })}
                    </Accordion>
                </div>
            )}
            
            {collapsed && (
                 <div className="flex flex-col items-center py-4 gap-4">
                    {panelOrder.map((id) => {
                         if (floatingPanels.includes(id)) return null;
                         const config = PANEL_CONFIG[id as keyof typeof PANEL_CONFIG];
                         return (
                            <div key={id} className="p-2 hover:bg-[var(--accent)]/10 rounded-lg cursor-help transition-colors" title={config.title}>
                                {React.createElement(config.icon, { className: "w-5 h-5 text-[var(--muted-foreground)]" })}
                            </div>
                         );
                    })}
                 </div>
            )}
        </div>

        {/* Floating Windows */}
        {floatingPanels.map(id => (
            <FloatingWindow key={id} id={id} onClose={() => toggleFloat(id)}>
                {renderPanelContent(id, true)}
            </FloatingWindow>
        ))}
    </>
  );
}
