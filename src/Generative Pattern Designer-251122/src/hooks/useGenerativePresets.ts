import { useState, useCallback } from 'react';
import { GenerativeConfig, GenerativePreset } from '../types/generative';

const STORAGE_KEY = 'generative-presets';

export function useGenerativePresets() {
  const [presets, setPresets] = useState<GenerativePreset[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const savePreset = useCallback((name: string, config: GenerativeConfig) => {
    const newPreset: GenerativePreset = {
      id: `preset-${Date.now()}`,
      name,
      config,
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
    
    return newPreset;
  }, [presets]);

  const deletePreset = useCallback((id: string) => {
    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
  }, [presets]);

  const loadPreset = useCallback((id: string) => {
    return presets.find(p => p.id === id);
  }, [presets]);

  return {
    presets,
    savePreset,
    deletePreset,
    loadPreset,
  };
}
