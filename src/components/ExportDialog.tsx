import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { MdDownload, MdContentCopy, MdImage, MdCode } from 'react-icons/md';
import { useGenerator } from './context/GeneratorContext';
import { generateSVG, loadMaskData } from '../lib/generatorUtils';
import { copyToClipboard } from '../lib/utils';
import { toast } from 'sonner';

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
    const { state } = useGenerator();

    const handleCopySVG = async () => {
        const maskData = await loadMaskData(state.mask.imageUrl || '');
        const svg = generateSVG(state, maskData);
        try {
            await copyToClipboard(svg);
            toast.success("SVG copied to clipboard! Paste in Figma.");
        } catch (e) {
            console.error(e);
            toast.error("Failed to copy SVG.");
        }
    };

    const handleDownloadSVG = async () => {
        const maskData = await loadMaskData(state.mask.imageUrl || '');
        const svg = generateSVG(state, maskData);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'geometric-design.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("SVG downloaded.");
    };

    const handleDownloadPNG = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'geometric-design.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("PNG downloaded.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[var(--background)] border-[var(--border)]">
                <DialogHeader>
                    <DialogTitle className="text-[var(--foreground)]">Export Pattern</DialogTitle>
                    <DialogDescription className="text-[var(--muted-foreground)]">
                        Choose a format to download or copy your design.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    {/* Preview Area */}
                    <div className="aspect-video w-full rounded-[var(--radius)] border border-[var(--border)] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-center overflow-hidden flex items-center justify-center relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <span className="text-xs text-[var(--muted-foreground)]">Live Preview</span>
                        {/* In a real app, we might render a small canvas or SVG here */}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={handleDownloadPNG} className="flex flex-col h-24 gap-2 hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
                            <MdImage className="w-6 h-6" />
                            <span>Download PNG</span>
                        </Button>
                        <Button variant="outline" onClick={handleDownloadSVG} className="flex flex-col h-24 gap-2 hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
                            <MdCode className="w-6 h-6" />
                            <span>Download SVG</span>
                        </Button>
                    </div>

                    <Button className="w-full gap-2 bg-[var(--primary)] text-white hover:opacity-90" onClick={handleCopySVG}>
                        <MdContentCopy className="w-4 h-4" />
                        Copy SVG Code (Figma)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
