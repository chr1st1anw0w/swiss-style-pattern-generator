/**
 * Convert SVG code to Image object for canvas rendering
 */
export function svgToImage(svgCode: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Create SVG blob
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = url;
  });
}

/**
 * Get SVG dimensions from code
 */
export function getSVGDimensions(svgCode: string): { width: number; height: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');
  
  if (svgElement) {
    const width = parseFloat(svgElement.getAttribute('width') || '50');
    const height = parseFloat(svgElement.getAttribute('height') || '50');
    return { width, height };
  }
  
  return { width: 50, height: 50 };
}

/**
 * Prepare SVG for rendering (ensure it has proper attributes)
 */
export function prepareSVG(svgCode: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');
  
  if (!svgElement) {
    throw new Error('Invalid SVG code');
  }
  
  // Ensure viewBox exists
  if (!svgElement.getAttribute('viewBox')) {
    const width = parseFloat(svgElement.getAttribute('width') || '50');
    const height = parseFloat(svgElement.getAttribute('height') || '50');
    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }
  
  // Ensure width and height exist
  if (!svgElement.getAttribute('width')) {
    svgElement.setAttribute('width', '50');
  }
  if (!svgElement.getAttribute('height')) {
    svgElement.setAttribute('height', '50');
  }
  
  return new XMLSerializer().serializeToString(svgElement);
}
