import { GenerativeConfig, GeneratedElement } from '../types/generative';

/**
 * Generate true vector SVG from generative pattern
 */
export function generateSVGCode(
  elements: GeneratedElement[],
  config: GenerativeConfig
): string {
  const { canvasWidth, canvasHeight, backgroundColor, baseShape, customSVG } = config;

  // Start SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <g id="pattern">
`;

  // Render each element
  for (const element of elements) {
    const { x, y, rotation, scaleX, scaleY, opacity, color } = element;
    
    svg += `    <g transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})" opacity="${(opacity / 100).toFixed(3)}">\n`;
    
    if (baseShape === 'custom' && customSVG) {
      // Use custom SVG
      const cleanedSVG = customSVG.svgCode
        .replace(/<\?xml.*?\?>/, '')
        .replace(/<svg[^>]*>/, '')
        .replace(/<\/svg>/, '')
        .trim();
      
      // Apply color to fill and stroke
      const coloredSVG = cleanedSVG
        .replace(/fill="[^"]*"/g, `fill="${color}"`)
        .replace(/stroke="[^"]*"/g, `stroke="${color}"`);
      
      svg += `      ${coloredSVG}\n`;
    } else {
      // Use built-in shapes
      svg += generateShapeSVG(baseShape, color, config.polygonSides);
    }
    
    svg += `    </g>\n`;
  }

  // Close SVG
  svg += `  </g>
</svg>`;

  return svg;
}

/**
 * Generate SVG code for built-in shapes
 */
function generateShapeSVG(shape: string, color: string, polygonSides?: number): string {
  const size = 25;
  
  switch (shape) {
    case 'circle':
      return `      <circle cx="0" cy="0" r="${size}" fill="${color}"/>\n`;
    
    case 'square':
      return `      <rect x="${-size}" y="${-size}" width="${size * 2}" height="${size * 2}" fill="${color}"/>\n`;
    
    case 'triangle':
      return `      <polygon points="0,${-size} ${size},${size} ${-size},${size}" fill="${color}"/>\\n`;
    
    case 'polygon': {
      // Generate polygon with specified number of sides
      const sides = polygonSides || 6;
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      return `      <polygon points="${points.join(' ')}" fill="${color}"/>\\n`;
    }
    
    case 'cross': {
      const armWidth = size * 0.3;
      return `
        <g fill="${color}">
          <rect x="${-size}" y="${-armWidth}" width="${size * 2}" height="${armWidth * 2}"/>
          <rect x="${-armWidth}" y="${-size}" width="${armWidth * 2}" height="${size * 2}"/>
        </g>
      `;
    }
    
    default:
      // Fallback to circle
      return `<circle cx="0" cy="0" r="${size}" fill="${color}"/>`;
  }
}

/**
 * Export SVG to file
 */
export function exportSVGFile(svg: string, filename: string = 'generative-pattern') {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy SVG to clipboard (for Figma)
 */
export async function copySVGToClipboard(svg: string): Promise<boolean> {
  try {
    // Try modern Clipboard API with SVG
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const item = new ClipboardItem({
      'image/svg+xml': blob,
      'text/plain': new Blob([svg], { type: 'text/plain' }),
    });
    
    await navigator.clipboard.write([item]);
    return true;
  } catch (error) {
    // Fallback 1: Try text-only clipboard
    try {
      await navigator.clipboard.writeText(svg);
      return true;
    } catch (textError) {
      // Fallback 2: Use legacy execCommand
      try {
        const textArea = document.createElement('textarea');
        textArea.value = svg;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          return true;
        }
      } catch (execError) {
        console.error('All clipboard methods failed:', execError);
      }
    }
  }
  
  return false;
}

/**
 * Copy SVG to clipboard for Figma import
 */
export async function copyToFigma(
  elements: GeneratedElement[],
  config: GenerativeConfig
): Promise<boolean> {
  const svg = generateSVGCode(elements, config);
  const success = await copySVGToClipboard(svg);
  return success;
}