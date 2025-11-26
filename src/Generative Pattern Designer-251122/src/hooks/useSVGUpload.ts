import { CustomSVGData } from '../types/generative';

/**
 * Hook for handling SVG uploads and clipboard paste
 */
export function useSVGUpload() {
  /**
   * Upload SVG from file
   */
  const uploadSVG = async (file: File): Promise<CustomSVGData | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const svgCode = e.target?.result as string;
        
        if (!svgCode || !svgCode.includes('<svg')) {
          resolve(null);
          return;
        }
        
        // Parse SVG dimensions
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgCode, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        
        if (!svgElement) {
          resolve(null);
          return;
        }
        
        // Get dimensions
        let width = 100;
        let height = 100;
        
        const widthAttr = svgElement.getAttribute('width');
        const heightAttr = svgElement.getAttribute('height');
        const viewBox = svgElement.getAttribute('viewBox');
        
        if (widthAttr && heightAttr) {
          width = parseFloat(widthAttr);
          height = parseFloat(heightAttr);
        } else if (viewBox) {
          const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(parseFloat);
          width = vbWidth;
          height = vbHeight;
        }
        
        resolve({
          svgCode,
          width,
          height,
        });
      };
      
      reader.onerror = () => {
        resolve(null);
      };
      
      reader.readAsText(file);
    });
  };

  /**
   * Paste SVG from clipboard (e.g., from Figma)
   */
  const pasteFromClipboard = async (): Promise<CustomSVGData | null> => {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('Clipboard API not available');
      }

      const clipboardText = await navigator.clipboard.readText();
      
      if (!clipboardText || !clipboardText.includes('<svg')) {
        return null;
      }
      
      // Parse SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(clipboardText, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (!svgElement) {
        return null;
      }
      
      // Get dimensions
      let width = 100;
      let height = 100;
      
      const widthAttr = svgElement.getAttribute('width');
      const heightAttr = svgElement.getAttribute('height');
      const viewBox = svgElement.getAttribute('viewBox');
      
      if (widthAttr && heightAttr) {
        width = parseFloat(widthAttr);
        height = parseFloat(heightAttr);
      } else if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(parseFloat);
        width = vbWidth;
        height = vbHeight;
      }
      
      return {
        svgCode: clipboardText,
        width,
        height,
      };
    } catch (error: any) {
      // If permission denied, rethrow so caller can handle fallback
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError' || error.message?.includes('NotAllowedError')) {
        throw error;
      }
      
      console.error('Failed to read clipboard:', error);
      // Return null to indicate clipboard read failed (but not permission error)
      return null;
    }
  };

  /**
   * Parse SVG from text input (manual paste alternative)
   */
  const parseSVGFromText = (text: string): CustomSVGData | null => {
    try {
      if (!text || !text.includes('<svg')) {
        return null;
      }
      
      // Parse SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (!svgElement) {
        return null;
      }
      
      // Get dimensions
      let width = 100;
      let height = 100;
      
      const widthAttr = svgElement.getAttribute('width');
      const heightAttr = svgElement.getAttribute('height');
      const viewBox = svgElement.getAttribute('viewBox');
      
      if (widthAttr && heightAttr) {
        width = parseFloat(widthAttr);
        height = parseFloat(heightAttr);
      } else if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(parseFloat);
        width = vbWidth;
        height = vbHeight;
      }
      
      return {
        svgCode: text,
        width,
        height,
      };
    } catch (error) {
      console.error('Failed to parse SVG:', error);
      return null;
    }
  };

  return {
    uploadSVG,
    pasteFromClipboard,
    parseSVGFromText,
  };
}