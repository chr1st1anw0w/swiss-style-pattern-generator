import { useState, useRef, useEffect } from 'react';
import { Canvas, CanvasRef } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { PatternMobilePanel } from './components/PatternMobilePanel';
import { PaintMixerModal } from './components/PaintMixerModal';
import { SavePresetDialog } from './components/SavePresetDialog';
import { ExportDialog } from './components/ExportDialog';
import { PatternConfig } from './types/pattern';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHistoryManager } from './hooks/useHistoryManager';
import { usePresetManager } from './hooks/usePresetManager';
import { useResponsive } from './hooks/useResponsive';
import { randomizePattern } from './utils/randomizePattern';
import { exportAsPNG, exportAsSVG } from './utils/exportUtils';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Grid3x3, Layers, LayoutGrid, Shapes, Wand2 } from 'lucide-react';

// Generative Mode Imports
import { GenerativeConfig } from './types/generative';
import { DEFAULT_GENERATIVE_CONFIG } from './constants/generativeDefaults';
import { GenerativeUnifiedPanel } from './components/GenerativeUnifiedPanel';
import { GenerativeMobilePanel } from './components/GenerativeMobilePanel';
import { GenerativeCanvas, GenerativeCanvasRef } from './components/GenerativeCanvas';
import { GenerativeExportDialog } from './components/generative/GenerativeExportDialog';
import { PresetsDialog } from './components/generative/PresetsDialog';
import { SVGInputDialog } from './components/SVGInputDialog';
import { useGenerativeEngine } from './hooks/useGenerativeEngine';
import { useGenerativePresets } from './hooks/useGenerativePresets';
import { useSVGUpload } from './hooks/useSVGUpload';
import { generateSVGCode, exportSVGFile, copyToFigma } from './utils/generativeSVGExport';
import { randomizeGenerativeConfig } from './utils/randomizeGenerativeConfig';

type AppMode = 'pattern' | 'generative';

const initialConfig: PatternConfig = {
  // Unit Shape Size
  unitSizeX: 50,
  unitSizeY: 50,
  sizeIncrementX: 0,
  sizeIncrementY: 0,
  
  // Quantity Control
  quantityX: 5,
  quantityY: 5,
  
  // Rotation
  rotation: 0,
  rotationIncrement: 0,
  randomRotation: false,
  randomRotationRange: 0,
  
  // Combination Methods
  combinationMethod: 'grid',
  mirrorHorizontal: false,
  mirrorVertical: false,
  multiAxisSymmetry: 1,
  radialCount: 8,
  
  // Scale Variation
  scaleVariation: 'none',
  scaleMin: 0.5,
  scaleMax: 1.5,
  
  // Visual Properties
  density: 100,
  strokeEnabled: true,
  strokeWidth: 2,
  strokeGradient: false,
  strokeWidthMin: 1,
  strokeWidthMax: 5,
  spacing: 10,
  spacingMin: 5,
  spacingMax: 20,
  
  // Fill Options
  fillEnabled: true,
  fillType: 'solid',
  fillColor: '#E4E4E4',
  fillGradientType: 'linear',
  fillGradientAngle: 90,
  fillGradientStops: [
    { position: 0, color: '#000000' },
    { position: 100, color: '#ffffff' },
  ],
  
  // Stroke Options
  strokeType: 'solid',
  strokeColor: '#000000',
  strokeGradientType: 'linear',
  strokeGradientAngle: 90,
  strokeGradientStops: [
    { position: 0, color: '#000000' },
    { position: 100, color: '#ffffff' },
  ],
  
  // Background Options
  backgroundEnabled: false,
  backgroundType: 'solid',
  backgroundColor: '#ffffff',
  backgroundGradientType: 'linear',
  backgroundGradientAngle: 90,
  backgroundGradientStops: [
    { position: 0, color: '#f0f0f0' },
    { position: 100, color: '#ffffff' },
  ],
  
  // Color & Opacity
  gradientType: 'none',
  gradientAngle: 0,
  colorStart: '#000000',
  colorEnd: '#ffffff',
  colorMid: '#888888',
  opacity: 100,
  individualOpacity: false,
  
  // Blending
  blendMode: 'normal',
  layerOpacity: 100,
  
  // Algorithm Modes
  algorithmMode: 'none',
  
  // Perlin/Simplex Noise
  noiseFrequency: 0.05,
  noiseAmplitude: 50,
  noiseOctaves: 3,
  
  // Sequence Patterns
  sequenceType: 'fibonacci',
  
  // Voronoi
  voronoiPoints: 20,
  voronoiMetric: 'euclidean',
  
  // Fractal
  fractalType: 'koch',
  fractalIterations: 3,
  fractalScale: 0.33,
  
  // Shape
  shapeType: 'rectangle',
  customPath: '',
  
  // Canvas Options
  aspectRatio: 'fit-screen',
  canvasWidth: 800,
  canvasHeight: 800,
};

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('generative');
  const { isMobile } = useResponsive();

  // ==========================================
  // PATTERN MODE STATE & HANDLERS
  // ==========================================
  const [config, setConfig] = useState<PatternConfig>(initialConfig);
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [paintMixerOpen, setPaintMixerOpen] = useState(false);
  const [paintMixerTarget, setPaintMixerTarget] = useState<'fill' | 'stroke' | 'background'>('fill');
  const canvasRef = useRef<CanvasRef>(null);

  const { addToHistory, undo, redo, canUndo, canRedo } = useHistoryManager(initialConfig);
  const { savePreset } = usePresetManager();

  useEffect(() => {
    addToHistory(config);
  }, [config, addToHistory]);

  const handleSetConfig = (newConfig: PatternConfig) => {
    setConfig(newConfig);
  };

  const handleRandomize = () => {
    const randomConfig = randomizePattern(config);
    setConfig(randomConfig);
    toast.success('Pattern randomized! 🎲');
  };

  const handleSavePreset = () => setSavePresetOpen(true);
  const handleExport = () => setExportOpen(true);
  
  const handleUndo = () => {
    if (canUndo) {
      const prevConfig = undo();
      if (prevConfig) {
        setConfig(prevConfig);
        toast.info('Undo');
      }
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const nextConfig = redo();
      if (nextConfig) {
        setConfig(nextConfig);
        toast.info('Redo');
      }
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      exportAsPNG(canvas, 'pattern');
      toast.success('Exported as PNG! 📸');
    }
  };

  const handleExportSVG = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      exportAsSVG(canvas, config, 'pattern');
      toast.success('Exported as SVG! 🎨');
    }
  };

  const handleSavePresetConfirm = (name: string) => {
    savePreset(name, config);
    toast.success(`Preset "${name}" saved! 💾`);
  };

  // Pattern Keyboard Shortcuts
  useKeyboardShortcuts({
    onRandomize: appMode === 'pattern' ? handleRandomize : undefined,
    onSavePreset: appMode === 'pattern' ? handleSavePreset : undefined,
    onExport: appMode === 'pattern' ? handleExport : undefined,
    onUndo: appMode === 'pattern' ? handleUndo : undefined,
    onRedo: appMode === 'pattern' ? handleRedo : undefined,
  });


  // ==========================================
  // GENERATIVE MODE STATE & HANDLERS
  // ==========================================
  const [genConfig, setGenConfig] = useState<GenerativeConfig>(DEFAULT_GENERATIVE_CONFIG);
  const [genSavePresetOpen, setGenSavePresetOpen] = useState(false);
  const [genExportOpen, setGenExportOpen] = useState(false);
  const [genPresetsOpen, setGenPresetsOpen] = useState(false);
  const [svgDialogOpen, setSvgDialogOpen] = useState(false);
  const genCanvasRef = useRef<GenerativeCanvasRef>(null);

  const { elements, generate } = useGenerativeEngine(genConfig);
  const { savePreset: saveGenPreset } = useGenerativePresets();
  const { uploadSVG, pasteFromClipboard, parseSVGFromText } = useSVGUpload();

  const handleGenConfigChange = (updates: Partial<GenerativeConfig>) => {
    setGenConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleGenGenerate = () => {
    generate();
    toast.success('Pattern regenerated! ✨');
  };

  const handleGenRandomize = () => {
    const randomConfig = randomizeGenerativeConfig(genConfig);
    setGenConfig(randomConfig);
    toast.success('Randomized all parameters! 🎲');
  };

  const handleGenExport = () => setGenExportOpen(true);
  const handleGenSavePreset = () => setGenSavePresetOpen(true);
  const handleGenLoadPreset = () => setGenPresetsOpen(true);
  const handleSelectGenPreset = (presetConfig: GenerativeConfig) => {
    setGenConfig(presetConfig);
    toast.success('Preset loaded! 🎨');
  };
  
  const handleSaveGenPresetConfirm = (name: string) => {
    saveGenPreset(name, genConfig);
    toast.success(`Preset "${name}" saved! 💾`);
  };

  const handleGenExportPNG = () => {
    const canvas = genCanvasRef.current?.getCanvas();
    if (canvas) {
      exportAsPNG(canvas, 'generative-pattern');
      toast.success('Exported as PNG! 📸');
    }
  };

  const handleGenExportSVG = () => {
    try {
      const svg = generateSVGCode(elements, genConfig);
      exportSVGFile(svg, 'generative-pattern');
      toast.success('Exported as SVG! 🎨');
    } catch (error) {
      toast.error('Failed to export SVG');
    }
  };

  const handleCopyToFigma = async () => {
    try {
      const success = await copyToFigma(elements, genConfig);
      if (success) {
        toast.success('✅ SVG copied! Now paste in Figma (Cmd/Ctrl+V)');
      } else {
        toast.error('❌ Failed to copy. Try Export → SVG instead');
      }
    } catch (error) {
      toast.error('❌ Failed to copy. Try Export → SVG instead');
    }
  };

  const handleUploadSVG = async (file: File) => {
    const svgData = await uploadSVG(file);
    if (svgData) {
      setGenConfig((prev) => ({ ...prev, baseShape: 'custom', customSVG: svgData }));
      toast.success('✅ SVG uploaded successfully!');
    } else {
      toast.error('❌ Failed to upload SVG.');
    }
  };

  const handlePasteSVG = async () => {
    try {
      const svgData = await pasteFromClipboard();
      if (svgData) {
        setGenConfig((prev) => ({ ...prev, baseShape: 'custom', customSVG: svgData }));
        toast.success('✅ SVG pasted from clipboard!');
      } else {
        toast.error('❌ No SVG found in clipboard.');
      }
    } catch (error) {
      toast.info('📋 Please paste your SVG code manually.');
      setSvgDialogOpen(true);
    }
  };

  const handleParseSVGFromText = (svgText: string) => {
    const svgData = parseSVGFromText(svgText);
    if (svgData) {
      setGenConfig((prev) => ({ ...prev, baseShape: 'custom', customSVG: svgData }));
      toast.success('✅ SVG parsed successfully!');
    } else {
      toast.error('❌ Failed to parse SVG.');
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-background)] font-sans overflow-hidden">
      {/* Unified Sidebar */}
      {!isMobile && (
        <aside className="w-80 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-background)] flex-shrink-0 z-20">
          {/* Mode Toggle Header */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex p-1 rounded-md bg-[var(--color-muted)]">
              <Button
                variant={appMode === 'generative' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAppMode('generative')}
                className="flex-1 gap-2 h-8 rounded-sm shadow-none"
              >
                <LayoutGrid className="w-4 h-4" />
                Generative
              </Button>

            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {appMode === 'pattern' ? (
              <ControlPanel config={config} setConfig={handleSetConfig} />
            ) : (
              <GenerativeUnifiedPanel
                config={genConfig}
                onChange={handleGenConfigChange}
                onGenerate={handleGenGenerate}
                onRandomize={handleGenRandomize}
                onExport={handleGenExport}
                onSavePreset={handleGenSavePreset}
                onLoadPreset={handleGenLoadPreset}
                onCopyToFigma={handleCopyToFigma}
                onUploadSVG={handleUploadSVG}
                onPasteSVG={handlePasteSVG}
                onOpenSVGDialog={() => setSvgDialogOpen(true)}
              />
            )}
          </div>
        </aside>
      )}

      {/* Main Canvas Area */}
      <main className="flex-1 relative bg-[var(--color-muted)]/20 overflow-hidden flex flex-col">
        {/* Mobile Header (Mode Switcher for Mobile) */}
        {isMobile && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-1 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg">
              <Button
                variant={appMode === 'generative' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAppMode('generative')}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={appMode === 'pattern' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAppMode('pattern')}
                className="h-8 w-8 p-0"
              >
                <Shapes className="w-4 h-4" />
              </Button>
           </div>
        )}

        <div className="flex-1 relative flex flex-col">
            {appMode === 'pattern' ? (
              <Canvas ref={canvasRef} config={config} />
            ) : (
              <GenerativeCanvas ref={genCanvasRef} config={genConfig} elements={elements} />
            )}
        </div>

        {/* Mobile Bottom Panels */}
        {isMobile && (
          <>
            {appMode === 'pattern' ? (
              <PatternMobilePanel
                config={config}
                onChange={(updates) => setConfig({ ...config, ...updates })}
                onRandomize={handleRandomize}
                onExport={handleExport}
                onSavePreset={handleSavePreset}
                onOpenPaintMixer={(target) => {
                  setPaintMixerTarget(target);
                  setPaintMixerOpen(true);
                }}
              />
            ) : (
              <GenerativeMobilePanel
                config={genConfig}
                onChange={handleGenConfigChange}
                onGenerate={handleGenGenerate}
                onRandomize={handleGenRandomize}
                onExport={handleGenExport}
                onSavePreset={handleGenSavePreset}
                onCopyToFigma={handleCopyToFigma}
              />
            )}
          </>
        )}
      </main>

      {/* Dialogs for Pattern Mode */}
      <SavePresetDialog
        open={savePresetOpen}
        onOpenChange={setSavePresetOpen}
        onSave={handleSavePresetConfirm}
      />
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
      />
      <PaintMixerModal
        open={paintMixerOpen}
        onOpenChange={setPaintMixerOpen}
        target={paintMixerTarget}
        config={config}
        onConfigChange={(updates) => setConfig({ ...config, ...updates })}
      />

      {/* Dialogs for Generative Mode */}
      <SavePresetDialog
        open={genSavePresetOpen}
        onOpenChange={setGenSavePresetOpen}
        onSave={handleSaveGenPresetConfirm}
      />
      <GenerativeExportDialog
        open={genExportOpen}
        onOpenChange={setGenExportOpen}
        onExportPNG={handleGenExportPNG}
        onExportSVG={handleGenExportSVG}
        onCopyToFigma={handleCopyToFigma}
      />
      <PresetsDialog
        open={genPresetsOpen}
        onOpenChange={setGenPresetsOpen}
        onSelectPreset={handleSelectGenPreset}
      />
      <SVGInputDialog
        open={svgDialogOpen}
        onOpenChange={setSvgDialogOpen}
        onSubmit={handleParseSVGFromText}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}