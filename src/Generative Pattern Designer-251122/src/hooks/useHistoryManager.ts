import { useState, useCallback, useRef } from 'react';
import { PatternConfig } from '../types/pattern';

const MAX_HISTORY = 50;

export function useHistoryManager(initialConfig: PatternConfig) {
  const [history, setHistory] = useState<PatternConfig[]>([initialConfig]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const addToHistory = useCallback((config: PatternConfig) => {
    // Don't add to history if this is an undo/redo operation
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory(prev => {
      // Remove any future history after current index
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new config
      newHistory.push(config);
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(newHistory.length - MAX_HISTORY);
      }
      return newHistory;
    });
    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
    });
  }, [currentIndex]);

  const undo = useCallback((): PatternConfig | null => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback((): PatternConfig | null => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
