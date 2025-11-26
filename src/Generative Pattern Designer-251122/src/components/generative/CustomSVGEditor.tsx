import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Copy, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CustomSVGData } from '../../types/generative';
import { prepareSVG, getSVGDimensions } from '../../utils/svgToImage';
import { toast } from 'sonner';

interface CustomSVGEditorProps {
  value?: CustomSVGData;
  onChange: (data: CustomSVGData | undefined) => void;
}

export function CustomSVGEditor({ value, onChange }: CustomSVGEditorProps) {
  const [svgCode, setSvgCode] = useState(value?.svgCode || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedFromClipboard, setCopiedFromClipboard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-apply SVG when code changes (with debounce)
  useEffect(() => {
    if (!svgCode.trim()) {
      onChange(undefined);
      return;
    }

    const timer = setTimeout(() => {
      tryApplySVG(svgCode);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [svgCode]);

  // Try to apply SVG code
  const tryApplySVG = (code: string) => {
    try {
      const prepared = prepareSVG(code);
      const dimensions = getSVGDimensions(prepared);
      onChange({
        svgCode: prepared,
        width: dimensions.width,
        height: dimensions.height,
      });
    } catch (error) {
      // Silent fail for auto-apply
    }
  };

  // Upload SVG file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.svg')) {
      toast.error('Please upload an SVG file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSvgCode(content);
      setIsExpanded(true);
      toast.success('SVG file loaded! 📁');
    };
    reader.readAsText(file);
  };

  // Paste from clipboard - Multiple methods
  const handlePasteFromClipboard = async () => {
    try {
      // Method 1: Try to read from clipboard API
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            // Try SVG
            if (item.types.includes('image/svg+xml')) {
              const blob = await item.getType('image/svg+xml');
              const text = await blob.text();
              setSvgCode(text);
              setIsExpanded(true);
              setCopiedFromClipboard(true);
              setTimeout(() => setCopiedFromClipboard(false), 2000);
              toast.success('SVG pasted from clipboard! 📋');
              return;
            }
            // Try text
            if (item.types.includes('text/plain')) {
              const blob = await item.getType('text/plain');
              const text = await blob.text();
              if (text.includes('<svg') || text.includes('<?xml')) {
                setSvgCode(text);
                setIsExpanded(true);
                setCopiedFromClipboard(true);
                setTimeout(() => setCopiedFromClipboard(false), 2000);
                toast.success('SVG pasted from clipboard! 📋');
                return;
              }
            }
          }
        } catch (e) {
          // Continue to next method
        }
      }

      // Method 2: Try readText
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('<svg') || text.includes('<?xml'))) {
          setSvgCode(text);
          setIsExpanded(true);
          setCopiedFromClipboard(true);
          setTimeout(() => setCopiedFromClipboard(false), 2000);
          toast.success('SVG pasted from clipboard! 📋');
          return;
        }
      }

      // Method 3: Focus textarea and trigger paste
      if (textareaRef.current) {
        textareaRef.current.focus();
        toast.info('Please paste directly (Cmd/Ctrl+V) into the text area');
        setIsExpanded(true);
        return;
      }

      toast.error('No SVG found. Try pasting directly into the text area.');
    } catch (error) {
      // Final fallback
      if (textareaRef.current) {
        textareaRef.current.focus();
        toast.info('Please paste directly (Cmd/Ctrl+V) into the text area');
        setIsExpanded(true);
      } else {
        toast.error('Failed to access clipboard');
      }
    }
  };

  // Handle manual paste event
  const handleTextareaPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    if (text && (text.includes('<svg') || text.includes('<?xml'))) {
      toast.success('SVG code pasted! 📋');
    }
  };

  // Clear SVG
  const handleClear = () => {
    setSvgCode('');
    onChange(undefined);
    toast.info('SVG cleared');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label style={{ color: 'var(--color-foreground)' }}>Custom SVG</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <FileText className="w-4 h-4 mr-1" />
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-1" />
          Upload
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePasteFromClipboard}
          className="w-full"
        >
          {copiedFromClipboard ? (
            <Check className="w-4 h-4 mr-1" />
          ) : (
            <Copy className="w-4 h-4 mr-1" />
          )}
          Paste
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* SVG Code Editor */}
      {isExpanded && (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            onPaste={handleTextareaPaste}
            placeholder="Paste SVG code here or upload a file..."
            className="font-mono"
            style={{
              minHeight: '150px',
              fontSize: '12px',
            }}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="w-full"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Preview - Auto-show when SVG exists */}
      {value && (
        <div 
          className="relative rounded overflow-hidden"
          style={{
            backgroundColor: 'var(--color-muted)',
            padding: '50px',
            aspectRatio: '1 / 1',
            width: '100%',
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: value.svgCode }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
          
          {/* Dimensions label */}
          <div
            className="absolute bottom-2 right-2 px-2 py-1 rounded"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-muted-foreground)',
              fontSize: '10px',
              opacity: 0.8,
            }}
          >
            {Math.round(value.width)}×{Math.round(value.height)}
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className="p-2 rounded text-xs"
        style={{
          backgroundColor: 'var(--color-muted)',
          color: 'var(--color-muted-foreground)',
          lineHeight: '1.4',
        }}
      >
        💡 Tip: Copy from Figma (Cmd/Ctrl+C) and paste here, or upload an SVG file
      </div>
    </div>
  );
}
