import { useState, useEffect, useCallback } from 'react';
import { GenerativeConfig, GeneratedElement } from '../types/generative';
import { generateElements } from '../utils/generativeEngine';

export function useGenerativeEngine(config: GenerativeConfig) {
  const [elements, setElements] = useState<GeneratedElement[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(() => {
    setIsGenerating(true);
    
    // Generate elements
    const newElements = generateElements(config);
    setElements(newElements);
    
    setIsGenerating(false);
  }, [config]);

  // Auto-generate on config change
  useEffect(() => {
    generate();
  }, [generate]);

  return {
    elements,
    generate,
    isGenerating,
  };
}
