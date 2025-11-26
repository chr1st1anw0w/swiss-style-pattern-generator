import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Clipboard, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface SVGInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (svgText: string) => void;
}

export function SVGInputDialog({ open, onOpenChange, onSubmit }: SVGInputDialogProps) {
  const [svgText, setSvgText] = useState('');

  const handleSubmit = () => {
    if (svgText.trim()) {
      onSubmit(svgText);
      setSvgText(''); // Clear input
      onOpenChange(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSvgText(text);
      toast.success('Pasted from clipboard!');
    } catch (error) {
      // If clipboard API fails, user can still manually paste into textarea
      toast.info('Please paste manually (Cmd/Ctrl+V) into the text area below');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
            }}
          >
            <FileCode className="inline-block w-5 h-5 mr-2" />
            Paste SVG Code
          </DialogTitle>
          <DialogDescription
            style={{
              color: 'var(--color-muted-foreground)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Copy SVG code from Figma and paste it here
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Instructions */}
          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: 'var(--color-muted)',
              borderColor: 'var(--color-border)',
            }}
          >
            <p
              className="text-sm"
              style={{
                color: 'var(--color-foreground)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <strong>How to copy from Figma:</strong>
            </p>
            <ol
              className="text-sm mt-2 ml-4 space-y-1"
              style={{
                color: 'var(--color-muted-foreground)',
                fontFamily: 'var(--font-sans)',
                listStyleType: 'decimal',
              }}
            >
              <li>Select your vector/shape in Figma</li>
              <li>Copy it (Cmd/Ctrl + C)</li>
              <li>Click "Paste" button below or manually paste into the text area</li>
            </ol>
          </div>

          {/* Textarea */}
          <div>
            <label
              className="text-sm block mb-2"
              style={{
                color: 'var(--color-foreground)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              SVG Code
            </label>
            <Textarea
              value={svgText}
              onChange={(e) => setSvgText(e.target.value)}
              placeholder="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot;...>"
              rows={12}
              className="font-mono text-xs"
              style={{
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePaste}
              className="flex-1"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste from Clipboard
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!svgText.trim()}
              className="flex-1"
            >
              Use This SVG
            </Button>
          </div>

          {/* Note */}
          <p
            className="text-xs"
            style={{
              color: 'var(--color-muted-foreground)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            💡 Tip: You can also manually paste (Cmd/Ctrl+V) directly into the text area above.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
