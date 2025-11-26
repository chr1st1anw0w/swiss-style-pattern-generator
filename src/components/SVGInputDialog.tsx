import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useGenerator } from './context/GeneratorContext';

interface SVGInputDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (svgContent: string) => void;
}

export function SVGInputDialog({ open, onOpenChange, onImport }: SVGInputDialogProps) {
    const [text, setText] = useState('');

    const handleImport = () => {
        if (text.trim()) {
            onImport(text);
            setText('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[var(--background)] border-[var(--border)]">
                <DialogHeader>
                    <DialogTitle>Import SVG</DialogTitle>
                    <DialogDescription>
                        Paste your SVG code below to use it as a custom shape.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        value={text} 
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your SVG code here (<svg>...</svg> or path d='...')"
                        className="min-h-[200px] font-mono text-xs bg-[var(--muted)] border-[var(--border)]"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        Tip: Right-click an element in Figma and select "Copy as SVG".
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleImport} className="bg-[var(--primary)] text-white">Import</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
