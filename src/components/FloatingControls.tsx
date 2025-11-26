import React, { useState } from 'react';
import { useGenerator } from './context/GeneratorContext';
import { Button } from './ui/button';
import { FigmaSlider } from './FigmaSlider';
import { generateSVG, loadMaskData } from '../lib/generatorUtils';
import { MdTune, MdUpload, MdDownload, MdContentCopy, MdImage, MdDelete, MdCode, MdAdd, MdRemove, MdLink, MdLinkOff, MdTextFields, MdCropFree } from 'react-icons/md';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { cn, copyToClipboard } from '../lib/utils';
import { ExportDialog } from './ExportDialog';
import { SVGInputDialog } from './SVGInputDialog';

const extractPathAndBounds = (svgContent: string) => {
    let content = svgContent.trim();
    if (content.startsWith('M') || content.startsWith('m')) {
        content = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${content}"/></svg>`;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "image/svg+xml");
    const pathEl = doc.querySelector('path');
    
    if (!pathEl) return null;
    const d = pathEl.getAttribute('d');
    if (!d) return null;
    
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    tempSvg.style.position = 'absolute';
    tempSvg.style.visibility = 'hidden';
    tempSvg.style.pointerEvents = 'none';
    document.body.appendChild(tempSvg);

    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute('d', d);
    tempSvg.appendChild(tempPath);
    
    let bbox = { x: 0, y: 0, width: 100, height: 100 };
    try {
        bbox = tempPath.getBBox();
    } catch (e) {
        console.warn("SVG Measure Error", e);
    } finally {
        document.body.removeChild(tempSvg);
    }
    
    if (bbox.width === 0 || bbox.height === 0) bbox = { x: 0, y: 0, width: 100, height: 100 };

    return {
        path: d,
        bounds: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
    };
};

export function FloatingControls() {
  const { state, dispatch } = useGenerator();
  const { activeLayerId, layers } = state;
  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];

  const [inputOpen, setInputOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [scaleLinked, setScaleLinked] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const handleUnitChange = (field: string, value: any) => {
    dispatch({ type: 'SET_UNIT', payload: { [field]: value } });
  };

  const handleTransformChange = (field: string, value: number) => {
    if (scaleLinked && (field === 'scaleX' || field === 'scaleY')) {
        dispatch({ type: 'SET_TRANSFORM', payload: { scaleX: value, scaleY: value } });
    } else {
        dispatch({ type: 'SET_TRANSFORM', payload: { [field]: value } });
    }
  };

  const handleImportSVG = (text: string) => {
      const result = extractPathAndBounds(text);
      if (result) {
          dispatch({ type: 'SET_UNIT', payload: { shape: 'custom', customSvg: result.path, customBounds: result.bounds } });
      }
  };

  React.useEffect(() => {
      const handlePaste = (e: ClipboardEvent) => {
          const text = e.clipboardData?.getData('text');
          if (!text) return;
          
          if (text.includes('<svg') || text.includes('d="') || text.trim().startsWith('M') || text.trim().startsWith('m')) {
              handleImportSVG(text);
          }
      };

      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
  }, [dispatch]);

  const handleClearAll = () => {
      dispatch({ type: 'SET_MASK', payload: { imageUrl: null, influence: [] } });
      dispatch({ type: 'SET_UNIT', payload: { shape: 'rect', customSvg: null } });
  };

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
          const text = ev.target?.result as string;
          handleImportSVG(text);
      };
      reader.readAsText(file);
    }
  };
  
  const handleMaskUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        dispatch({ type: 'SET_MASK', payload: { imageUrl: url } });
      }
  };

  const updateGrid = (key: string, value: any) => {
      dispatch({ type: 'SET_GRID', payload: { [key]: value } });
  };

  const zoomIn = () => dispatch({ type: 'SET_CANVAS', payload: { zoom: Math.min(500, state.canvas.zoom + 10) } });
  const zoomOut = () => dispatch({ type: 'SET_CANVAS', payload: { zoom: Math.max(10, state.canvas.zoom - 10) } });
  const zoomFit = () => dispatch({ type: 'SET_CANVAS', payload: { zoom: 100 } });

  return (
    <>
      <input 
        type="file" 
        id="svg-upload" 
        accept=".svg" 
        className="hidden" 
        onChange={handleSvgUpload} 
      />
      <input 
        type="file" 
        id="mask-upload-fab" 
        accept="image/*" 
        className="hidden" 
        onChange={handleMaskUpload} 
      />
      
      {/* Top Left - Unit Settings */}
      <div className="absolute top-4 left-4 z-10 max-md:left-14">
          <Popover>
             <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-11 h-11 text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <MdTextFields className="w-5 h-5" />
                </Button>
             </PopoverTrigger>
             <PopoverContent side="bottom" align="start" className="w-[300px] bg-[var(--card)] border-[var(--border)] p-4 shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                    <h4 className="font-medium text-[var(--text)] text-sm border-b border-[var(--border)] pb-2">Unit & Transform</h4>
                    
                    {/* Shape Type */}
                    <div className="space-y-2">
                        <Label>Shape Type</Label>
                        <Select value={activeLayer.unit.shape} onValueChange={(val: string) => handleUnitChange('shape', val)}>
                        <SelectTrigger><SelectValue placeholder="Select shape" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rect">Rectangle</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="triangle">Triangle</SelectItem>
                            <SelectItem value="custom">Custom SVG</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    {/* Unit Props */}
                    <FigmaSlider 
                        label="Stroke Width"
                        value={activeLayer.unit.strokeWidth}
                        max={10} step={0.5}
                        onValueChange={(v) => handleUnitChange('strokeWidth', v)}
                        suffix="px"
                    />
                    
                    <div className="space-y-2">
                         <Label>Stroke Color</Label>
                         <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={activeLayer.unit.strokeColor}
                                onChange={(e) => handleUnitChange('strokeColor', e.target.value)}
                                className="w-8 h-8 rounded bg-transparent border-none cursor-pointer"
                            />
                            <span className="text-[var(--font-xs)]">{activeLayer.unit.strokeColor}</span>
                        </div>
                    </div>

                    {activeLayer.unit.shape === 'rect' ? (
                        <div className="space-y-1">
                             <div className="flex items-center justify-between mb-1">
                                <Label className="text-[14px] font-semibold">Border Radius</Label>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className={cn("h-5 w-5", Array.isArray(activeLayer.unit.borderRadius) ? "text-[var(--accent)]" : "text-[var(--text-muted)]")}
                                    onClick={() => {
                                        if (Array.isArray(activeLayer.unit.borderRadius)) {
                                            handleUnitChange('borderRadius', activeLayer.unit.borderRadius[0]);
                                        } else {
                                            const r = activeLayer.unit.borderRadius as number;
                                            handleUnitChange('borderRadius', [r, r, r, r]);
                                        }
                                    }}
                                    title="Independent Corners"
                                >
                                    <MdCropFree className="w-3 h-3" />
                                </Button>
                             </div>
                             
                             {Array.isArray(activeLayer.unit.borderRadius) ? (
                                 <div className="grid grid-cols-2 gap-x-2 gap-y-4 pl-1">
                                     {['TL', 'TR', 'BR', 'BL'].map((corner, i) => (
                                         <FigmaSlider 
                                            key={corner}
                                            label={corner}
                                            value={(activeLayer.unit.borderRadius as number[])[i]}
                                            max={50} step={1}
                                            onValueChange={(v) => {
                                                const newR = [...(activeLayer.unit.borderRadius as number[])];
                                                newR[i] = v;
                                                handleUnitChange('borderRadius', newR);
                                            }}
                                            suffix=""
                                            className="gap-0" 
                                         />
                                     ))}
                                 </div>
                             ) : (
                                <div className="-mt-2"> 
                                    <FigmaSlider 
                                        label=""
                                        value={activeLayer.unit.borderRadius as number}
                                        max={50} step={1}
                                        onValueChange={(v) => handleUnitChange('borderRadius', v)}
                                        suffix="px"
                                    />
                                </div>
                             )}
                        </div>
                    ) : (
                        <FigmaSlider 
                            label="Border Radius"
                            value={activeLayer.unit.borderRadius as number}
                            max={50} step={1}
                            onValueChange={(v) => handleUnitChange('borderRadius', v)}
                            suffix="px"
                        />
                    )}
                    
                    <div className="h-[1px] bg-[var(--border)] my-2" />
                    
                    {/* Transform */}
                    <FigmaSlider 
                        label="Rotation"
                        value={activeLayer.transform.rotation}
                        max={360} step={1}
                        onValueChange={(v) => handleTransformChange('rotation', v)}
                        suffix="°"
                    />

                    <FigmaSlider 
                        label="Variance"
                        value={activeLayer.transform.variance || 0}
                        max={360} step={1}
                        onValueChange={(v) => handleTransformChange('variance', v)}
                        suffix="°"
                    />

                    <div className="space-y-2">
                        <Label>Scale</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <FigmaSlider 
                                    label="X"
                                    value={activeLayer.transform.scaleX}
                                    min={0.1} max={3} step={0.1}
                                    onValueChange={(v) => handleTransformChange('scaleX', v)}
                                    formatValue={(v) => v.toFixed(1)}
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className={cn("mt-6 h-8 w-8", scaleLinked ? "text-[var(--foreground)]" : "text-[var(--text-muted)]")}
                                onClick={() => setScaleLinked(!scaleLinked)}
                                title={scaleLinked ? "Unlink Scales" : "Link Scales"}
                            >
                                {scaleLinked ? <MdLink className="w-4 h-4" /> : <MdLinkOff className="w-4 h-4" />}
                            </Button>
                            <div className="flex-1">
                                <FigmaSlider 
                                    label="Y"
                                    value={activeLayer.transform.scaleY}
                                    min={0.1} max={3} step={0.1}
                                    onValueChange={(v) => handleTransformChange('scaleY', v)}
                                    formatValue={(v) => v.toFixed(1)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                             <div className="flex-1">
                                <FigmaSlider 
                                    label="Skew X"
                                    value={activeLayer.transform.skewX || 0}
                                    min={-90} max={90} step={1}
                                    onValueChange={(v) => handleTransformChange('skewX', v)}
                                    suffix="°"
                                />
                            </div>
                            <div className="flex-1">
                                <FigmaSlider 
                                    label="Skew Y"
                                    value={activeLayer.transform.skewY || 0}
                                    min={-90} max={90} step={1}
                                    onValueChange={(v) => handleTransformChange('skewY', v)}
                                    suffix="°"
                                />
                            </div>
                        </div>
                    </div>
                </div>
             </PopoverContent>
          </Popover>
      </div>
      
      {/* Top Right - Grid Settings */}
      <div className="absolute top-4 right-4 z-10">
         <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-full w-11 h-11 hover:bg-[var(--muted)] transition-colors",
                        activeLayer.grid.toggle ? "text-[var(--primary)] hover:text-[var(--primary)]" : "text-white hover:text-[var(--foreground)]"
                    )}
                >
                  <MdTune className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-[300px] bg-[var(--card)] border-[var(--border)] p-4 shadow-xl">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                        <h4 className="font-medium text-[var(--text)] text-sm">Grid Settings</h4>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="grid-toggle" className="text-xs font-normal text-muted-foreground">Preview</Label>
                            <Switch 
                                id="grid-toggle" 
                                checked={activeLayer.grid.toggle}
                                onCheckedChange={(v: boolean) => updateGrid('toggle', v)}
                            />
                        </div>
                    </div>
                    
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">Background</Label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={state.colors.background}
                                    onChange={(e) => dispatch({ type: 'SET_COLORS', payload: { background: e.target.value } })}
                                    className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <Label className="text-xs">Grid Color</Label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={activeLayer.grid.lineColor}
                                    onChange={(e) => updateGrid('lineColor', e.target.value)}
                                    className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Columns & Rows */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                         <FigmaSlider 
                            label="Columns"
                            value={activeLayer.grid.cols}
                            min={1} max={100} step={1}
                            onValueChange={(v) => updateGrid('cols', v)}
                        />
                         <FigmaSlider 
                            label="Rows"
                            value={activeLayer.grid.rows}
                            min={1} max={100} step={1}
                            onValueChange={(v) => updateGrid('rows', v)}
                        />
                    </div>
                    
                    {/* Grid Width & Height */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                         <FigmaSlider 
                            label="Grid Width"
                            value={activeLayer.grid.width}
                            min={5} max={200} step={1}
                            onValueChange={(v) => updateGrid('width', v)}
                            suffix="px"
                        />
                         <FigmaSlider 
                            label="Grid Height"
                            value={activeLayer.grid.height}
                            min={5} max={200} step={1}
                            onValueChange={(v) => updateGrid('height', v)}
                            suffix="px"
                        />
                    </div>

                    {/* Spacing */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                         <FigmaSlider 
                            label="Spacing X"
                            value={activeLayer.grid.spacingX}
                            min={10} max={300} step={1}
                            onValueChange={(v) => updateGrid('spacingX', v)}
                            suffix="px"
                        />
                         <FigmaSlider 
                            label="Spacing Y"
                            value={activeLayer.grid.spacingY}
                            min={10} max={300} step={1}
                            onValueChange={(v) => updateGrid('spacingY', v)}
                            suffix="px"
                        />
                    </div>
                </div>
            </PopoverContent>
         </Popover>
      </div>

      {/* Bottom Left - Zoom Controls */}
      <div className="absolute bottom-6 left-6 z-10 max-md:left-4 max-md:bottom-20 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={zoomOut}>
              <MdRemove className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono w-10 text-center text-white">{Math.round(state.canvas.zoom)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={zoomIn}>
              <MdAdd className="w-4 h-4" />
          </Button>
          <div className="h-4 w-[1px] bg-white/20 mx-1" />
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-medium text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={zoomFit}>
              Fit
          </Button>
      </div>

      {/* Bottom Right - I/O Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 max-md:bottom-20">
         <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-md text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" 
            onClick={async () => {
                try {
                    const maskData = await loadMaskData(activeLayer.mask.imageUrl || '');
                    const svg = generateSVG(activeLayer, state.colors.background, maskData);
                    await copyToClipboard(svg);
                } catch(e) { console.error(e); }
            }} 
            title="Copy to Figma"
         >
            <MdContentCopy className="w-4 h-4" />
         </Button>
         <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => setExportOpen(true)} title="Export">
            <MdDownload className="w-4 h-4" />
         </Button>
         <div className="h-4 w-[1px] bg-white/20 mx-1" />
         <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => setImportOpen(true)} title="Paste SVG">
             <MdCode className="w-4 h-4" />
         </Button>
         <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => document.getElementById('svg-upload')?.click()} title="Upload SVG">
             <MdUpload className="w-4 h-4" />
         </Button>
         <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-white hover:text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => document.getElementById('mask-upload-fab')?.click()} title="Upload Mask">
             <MdImage className="w-4 h-4" />
         </Button>
         <div className="h-4 w-[1px] bg-white/20 mx-1" />
         <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-white hover:text-destructive hover:bg-destructive/10" onClick={handleClearAll} title="Clear All">
             <MdDelete className="w-4 h-4" />
         </Button>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <SVGInputDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImportSVG} />
    </>
  );
}