import { PatternConfig } from '../types/pattern';

export function exportAsPNG(canvasElement: HTMLCanvasElement, filename = 'pattern') {
  try {
    canvasElement.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Failed to export PNG:', error);
  }
}

export function exportAsSVG(canvasElement: HTMLCanvasElement, config: PatternConfig, filename = 'pattern') {
  // For now, we'll convert canvas to data URL and embed in SVG
  // A full SVG implementation would recreate the pattern using SVG elements
  try {
    const dataURL = canvasElement.toDataURL('image/png');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${config.canvasWidth}" height="${config.canvasHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${config.canvasWidth}" height="${config.canvasHeight}" xlink:href="${dataURL}"/>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export SVG:', error);
  }
}

export function exportConfig(config: PatternConfig, filename = 'pattern-config') {
  try {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export config:', error);
  }
}
