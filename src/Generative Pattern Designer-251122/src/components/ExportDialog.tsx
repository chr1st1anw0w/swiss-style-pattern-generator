import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Download, Image, FileCode } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
}

export function ExportDialog({ 
  open, 
  onOpenChange, 
  onExportPNG, 
  onExportSVG 
}: ExportDialogProps) {
  const handleExport = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--color-foreground)' }}>
            Export Pattern
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleExport(onExportPNG)}
          >
            <Image className="w-5 h-5" />
            <div className="text-left">
              <div style={{ color: 'var(--color-foreground)' }}>Export as PNG</div>
              <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                High quality raster image
              </div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleExport(onExportSVG)}
          >
            <FileCode className="w-5 h-5" />
            <div className="text-left">
              <div style={{ color: 'var(--color-foreground)' }}>Export as SVG</div>
              <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Scalable vector graphics
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
