import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download, Copy, Image } from 'lucide-react';

interface GenerativeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onCopyToFigma: () => void;
}

export function GenerativeExportDialog({
  open,
  onOpenChange,
  onExportPNG,
  onExportSVG,
  onCopyToFigma,
}: GenerativeExportDialogProps) {
  const handleExportPNG = () => {
    onExportPNG();
    onOpenChange(false);
  };

  const handleExportSVG = () => {
    onExportSVG();
    onOpenChange(false);
  };

  const handleCopyToFigma = () => {
    onCopyToFigma();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
        }}
        aria-describedby="export-dialog-description"
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--color-foreground)' }}>
            Export Pattern
          </DialogTitle>
        </DialogHeader>

        <p id="export-dialog-description" className="sr-only">
          Choose an export format: PNG for raster images, SVG for vector graphics, or copy directly to Figma
        </p>

        <div className="space-y-3 py-4">
          {/* Export as PNG */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4"
            onClick={handleExportPNG}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded"
                style={{ backgroundColor: 'var(--color-muted)' }}
              >
                <Image className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
              </div>
              <div className="text-left flex-1">
                <div style={{ color: 'var(--color-foreground)', fontWeight: 600 }}>
                  Export as PNG
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  Raster image format
                </div>
              </div>
              <Download className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
            </div>
          </Button>

          {/* Export as SVG */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4"
            onClick={handleExportSVG}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded"
                style={{ backgroundColor: 'var(--color-muted)' }}
              >
                <Download className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
              </div>
              <div className="text-left flex-1">
                <div style={{ color: 'var(--color-foreground)', fontWeight: 600 }}>
                  Export as SVG
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  True vector format (recommended)
                </div>
              </div>
            </div>
          </Button>

          {/* Copy to Figma */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4"
            onClick={handleCopyToFigma}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded"
                style={{ backgroundColor: 'var(--color-muted)' }}
              >
                <Copy className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
              </div>
              <div className="text-left flex-1">
                <div style={{ color: 'var(--color-foreground)', fontWeight: 600 }}>
                  Copy to Figma
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  Copy SVG to clipboard
                </div>
              </div>
            </div>
          </Button>
        </div>

        <div
          className="p-3 rounded text-xs"
          style={{
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-muted-foreground)',
            lineHeight: '1.4',
          }}
        >
          💡 Tip: SVG format preserves vector quality and works perfectly in Figma
        </div>
      </DialogContent>
    </Dialog>
  );
}