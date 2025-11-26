import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onRandomize: () => void;
  onSavePreset: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function useKeyboardShortcuts({
  onRandomize,
  onSavePreset,
  onExport,
  onUndo,
  onRedo,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for modifier keys
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Cmd/Ctrl + Z (Undo)
      if (isCmdOrCtrl && e.key === 'z' && !isShift) {
        e.preventDefault();
        onUndo();
        return;
      }

      // Cmd/Ctrl + Shift + Z (Redo)
      if (isCmdOrCtrl && e.key === 'z' && isShift) {
        e.preventDefault();
        onRedo();
        return;
      }

      // Don't handle shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Single key shortcuts (only when not in input)
      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          onRandomize();
          break;
        case 's':
          e.preventDefault();
          onSavePreset();
          break;
        case 'e':
          e.preventDefault();
          onExport();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRandomize, onSavePreset, onExport, onUndo, onRedo]);
}
