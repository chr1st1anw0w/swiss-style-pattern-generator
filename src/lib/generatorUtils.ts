import { GeneratorState, Layer } from '../components/context/GeneratorContext';

export interface MaskData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}

export function interpolateColor(color1: string, color2: string, factor: number) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `rgb(${r},${g},${b})`;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | [number, number, number, number]) {
  let tl, tr, br, bl;
  if (Array.isArray(radius)) {
      [tl, tr, br, bl] = radius;
  } else {
      tl = tr = br = bl = radius;
  }
  
  // Basic clamping to avoid negative radii
  tl = Math.max(0, tl); tr = Math.max(0, tr); br = Math.max(0, br); bl = Math.max(0, bl);

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.arcTo(x + width, y, x + width, y + height, tr);
  ctx.arcTo(x + width, y + height, x, y + height, br);
  ctx.arcTo(x, y + height, x, y, bl);
  ctx.arcTo(x, y, x + width, y, tl);
  ctx.closePath();
}

export function getGradientColor(stops: any[], position: number) {
    if (stops.length === 0) return '#ffffff';
    if (position <= stops[0].position) return stops[0].color;
    if (position >= stops[stops.length - 1].position) return stops[stops.length - 1].color;

    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        if (position >= start.position && position <= end.position) {
            const t = (position - start.position) / (end.position - start.position);
            return interpolateColor(start.color, end.color, t);
        }
    }
    return stops[0].color;
}

export function calculateProps(
    x: number, y: number, i: number, j: number, 
    cols: number, rows: number, width: number, height: number, 
    layer: Layer, maskData: MaskData | null
) {
    // 1. Sequence
    let sizeXMod = 0;
    let sizeYMod = 0;
    let rotMod = 0;
    let opacityMod = 1;
    let seqXOffset = 0;
    let seqYOffset = 0;

    if (layer.sequence.enabled && layer.sequence.type !== 'none') {
        // Calculate Angle & Projection
        const angleRad = (layer.sequence.angle || 0) * Math.PI / 180;
        const cx = (cols - 1) / 2;
        const cy = (rows - 1) / 2;
        const px = i - cx;
        const py = j - cy;
        
        let t = 0;
        let patternIdx = 0; // For custom type
        
        if (layer.sequence.direction === 'radial') {
             const maxDist = Math.sqrt(cx * cx + cy * cy);
             const dist = Math.sqrt(px * px + py * py);
             t = dist / Math.max(1, maxDist);
             patternIdx = Math.floor(dist);
        } else {
             let theta = angleRad;
             if (layer.sequence.direction === 'column') theta += Math.PI / 2;
             else if (layer.sequence.direction === 'diagonal') theta += Math.PI / 4;
             
             const getProj = (x: number, y: number) => x * Math.cos(theta) + y * Math.sin(theta);
             const proj = getProj(px, py);
             patternIdx = Math.floor(proj);
             
             // Bounds for normalization
             const corners = [
                { x: -cx, y: -cy },
                { x: cols - 1 - cx, y: -cy },
                { x: -cx, y: rows - 1 - cy },
                { x: cols - 1 - cx, y: rows - 1 - cy }
             ];
             let minProj = Infinity, maxProj = -Infinity;
             for (const c of corners) {
                 const p = getProj(c.x, c.y);
                 minProj = Math.min(minProj, p);
                 maxProj = Math.max(maxProj, p);
             }
             t = (proj - minProj) / Math.max(0.001, maxProj - minProj);
        }

        if (layer.sequence.reverse) t = 1 - t;

        // Apply curve based on type
        if (layer.sequence.type === 'custom' && layer.sequence.customValues?.length) {
            // patternIdx might be negative, handle modulo correctly
            const len = layer.sequence.customValues.length;
            const idx = ((patternIdx % len) + len) % len;
            t = layer.sequence.customValues[idx];
        } else if (layer.sequence.type === 'geometric') {
            t = t * t; // Simple exponential
        } else if (layer.sequence.type === 'fibonacci') {
            t = Math.pow(t, 1.618);
        }
        // Linear is default (t = t)

        // Apply to targets
        const { targets } = layer.sequence;
        if (targets) { // Check existence for safety during migration
            if ((targets as any).sizeX?.enabled) sizeXMod = lerp((targets as any).sizeX.min, (targets as any).sizeX.max, t);
            if ((targets as any).sizeY?.enabled) sizeYMod = lerp((targets as any).sizeY.min, (targets as any).sizeY.max, t);
            if (targets.rotation?.enabled) rotMod = lerp(targets.rotation.min, targets.rotation.max, t);
            if (targets.opacity?.enabled) opacityMod = lerp(targets.opacity.min, targets.opacity.max, t);
            if (targets.offsetX?.enabled) seqXOffset = lerp(targets.offsetX.min, targets.offsetX.max, t);
            if (targets.offsetY?.enabled) seqYOffset = lerp(targets.offsetY.min, targets.offsetY.max, t);
        }
    }

    // 2. Distortion
    let dx = x, dy = y;
    if (layer.distortion.enabled && layer.distortion.waveAmount !== 0) {
         dx += Math.sin(dy * 0.01 * layer.distortion.waveFreq) * layer.distortion.waveAmount;
         dy += Math.cos(dx * 0.01 * layer.distortion.waveFreq) * layer.distortion.waveAmount;
    }
    if (layer.distortion.enabled && layer.distortion.vortexAmount !== 0) {
        const cx = width / 2; const cy = height / 2;
        const vx = dx - cx; const vy = dy - cy;
        const dist = Math.sqrt(vx * vx + vy * vy);
        const angle = Math.atan2(vy, vx);
        if (dist < layer.distortion.vortexRadius * 2) {
            const vortex = (1 - dist / (layer.distortion.vortexRadius * 2)) * (layer.distortion.vortexAmount * 0.01);
            const newAngle = angle + vortex;
            dx = cx + Math.cos(newAngle) * dist;
            dy = cy + Math.sin(newAngle) * dist;
        }
    }

    // 3. Mask
    let maskLum = 0;
    let radiusMod = 0;
    let colorShift = 0;
    
    const maskIntensity = layer.mask.enabled ? layer.mask.opacity / 100 : 0;

    if (layer.mask.type === 'perlin') {
         const scale = layer.mask.perlin?.scale ?? 20;
         const seed = layer.mask.perlin?.seed ?? 0;
         const nx = (dx / width) * (scale / 10); // Adjust scale factor for better usability
         const ny = (dy / height) * (scale / 10);
         // Use perlin2D (defined below)
         const val = perlin2D(nx, ny, seed);
         maskLum = (val + 1) / 2; // Map -1..1 to 0..1
         maskLum = Math.max(0, Math.min(1, maskLum));
    } else if (maskData) {
         const tx = layer.mask.transform?.x ?? 0;
         const ty = layer.mask.transform?.y ?? 0;
         const s = layer.mask.transform?.scale ?? 1;
         const r = ((layer.mask.transform?.rotation ?? 0) * Math.PI) / 180;
         
         const cx = width / 2;
         const cy = height / 2;
         
         // Inverse Transform
         const px = dx - cx - tx;
         const py = dy - cy - ty;
         
         // Rotate (inverse)
         const rotX = px * Math.cos(r) + py * Math.sin(r);
         const rotY = -px * Math.sin(r) + py * Math.cos(r);
         
         // Scale
         const safeS = s === 0 ? 0.001 : s;
         const scX = rotX / safeS;
         const scY = rotY / safeS;
         
         // Map back to 0..1
         let u = (scX + cx) / width;
         let v = (scY + cy) / height;
         
         // Wrap UV (Repeat)
         u = u - Math.floor(u);
         v = v - Math.floor(v);
         
         const mx = Math.floor(u * maskData.width);
         const my = Math.floor(v * maskData.height);

         const idx = (my * maskData.width + mx) * 4;
         const rVal = maskData.data[idx];
         const gVal = maskData.data[idx + 1];
         const bVal = maskData.data[idx + 2];
         maskLum = (0.299 * rVal + 0.587 * gVal + 0.114 * bVal) / 255;
    }

    const { settings } = layer.mask;
    
    // Scale Mods
    let scaleXMod = 1 + sizeXMod;
    let scaleYMod = 1 + sizeYMod;
    
    // Scale Multipliers (Map Modifier)
    if (settings.width?.enabled) {
        // "scale x,y from px change to multiply -1 to 2"
        const multiplier = lerp(settings.width.min, settings.width.max, maskLum);
        const finalMult = lerp(1, multiplier, maskIntensity);
        scaleXMod *= finalMult;
    } else if (layer.mask.influence.includes('width')) {
        scaleXMod *= (1 - maskIntensity + maskIntensity * maskLum);
    }

    if (settings.height?.enabled) {
        const multiplier = lerp(settings.height.min, settings.height.max, maskLum);
        const finalMult = lerp(1, multiplier, maskIntensity);
        scaleYMod *= finalMult;
    }

    // Opacity
    if (settings.opacity?.enabled) {
        const target = lerp(settings.opacity.min, settings.opacity.max, maskLum);
        opacityMod *= lerp(1, target, maskIntensity);
    }

    // Rotation
    if (settings.rotation?.enabled) {
        const target = lerp(settings.rotation.min, settings.rotation.max, maskLum);
        rotMod += lerp(0, target, maskIntensity);
    }

    // Radius
    if (settings.radius?.enabled) {
        const target = lerp(settings.radius.min, settings.radius.max, maskLum);
        radiusMod += lerp(0, target, maskIntensity);
    }
    
    // Color
    if (settings.color?.enabled) {
        const target = lerp(settings.color.min, settings.color.max, maskLum);
        colorShift += lerp(0, target, maskIntensity);
    }

    // Stroke Width
    let strokeWidth = layer.unit.strokeWidth;
    if (settings.strokeWidth?.enabled) {
        const target = lerp(settings.strokeWidth.min, settings.strokeWidth.max, maskLum);
        strokeWidth = lerp(strokeWidth, target, maskIntensity);
    }

    // Position X
    let xMod = 0;
    if (settings.x?.enabled) {
        const target = lerp(settings.x.min, settings.x.max, maskLum);
        xMod = lerp(0, target, maskIntensity);
    }

    // Position Y
    let yMod = 0;
    if (settings.y?.enabled) {
        const target = lerp(settings.y.min, settings.y.max, maskLum);
        yMod = lerp(0, target, maskIntensity);
    }

    // 5. Color T
    const angleRad = layer.colors.gradient.angle * Math.PI / 180;
    const cx = width / 2;
    const cy = height / 2;
    const px = dx - cx;
    const py = dy - cy;
    const rotatedX = px * Math.cos(-angleRad) - py * Math.sin(-angleRad);
    const maxDist = Math.sqrt(width*width + height*height) / 2;
    let t = (rotatedX + maxDist) / (maxDist * 2); 
    t = Math.max(0, Math.min(1, t));

    if (layer.colors.gradient.type === 'radial') {
        const d = Math.sqrt(px*px + py*py);
        t = Math.min(1, d / maxDist);
    }
    
    t += colorShift / 100;
    t = Math.max(0, Math.min(1, t));

    return {
        x: dx, 
        y: dy,
        xOffset: xMod + seqXOffset,
        yOffset: yMod + seqYOffset,
        rotation: layer.transform.rotation + rotMod + (Math.sin(i * 12.9898 + j * 78.233) * 43758.5453 % 1) * layer.transform.variance,
        scaleX: layer.transform.scaleX * scaleXMod,
        scaleY: layer.transform.scaleY * scaleYMod,
        skewX: layer.transform.skewX || 0,
        skewY: layer.transform.skewY || 0,
        opacity: opacityMod,
        radiusMod,
        strokeWidth,
        colorT: t * 100
    };
}

export function generateSVG(layer: Layer, background: string, maskData: MaskData | null) {
    const spacingX = layer.grid.spacingX;
    const spacingY = layer.grid.spacingY;
    const w = layer.grid.width; 
    const h = layer.grid.height;
    const cols = layer.grid.cols;
    const rows = layer.grid.rows;
    
    const gridWidth = (cols - 1) * spacingX;
    const gridHeight = (rows - 1) * spacingY;
    
    const exportW = gridWidth + spacingX * 4;
    const exportH = gridHeight + spacingY * 4;

    const startX = (exportW - gridWidth) / 2;
    const startY = (exportH - gridHeight) / 2;

    const sortedStops = [...layer.colors.gradient.stops].sort((a, b) => a.position - b.position);
    
    let shapesSVG = '';

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = startX + i * spacingX;
        let y = startY + j * spacingY;
        
        const props = calculateProps(x, y, i, j, cols, rows, exportW, exportH, layer, maskData);
        
        const color = getGradientColor(sortedStops, props.colorT);
        const transform = `translate(${props.x}, ${props.y}) rotate(${props.rotation}) translate(${props.xOffset}, ${props.yOffset}) skewX(${props.skewX}) skewY(${props.skewY}) scale(${props.scaleX}, ${props.scaleY})`;
        
        let shapeInner = '';
        if (layer.unit.shape === 'rect') {
             const baseRadius = layer.unit.borderRadius;
             let r: number | [number, number, number, number];
             
             if (Array.isArray(baseRadius)) {
                 r = baseRadius.map(v => Math.max(0, v + props.radiusMod)) as [number, number, number, number];
             } else {
                 r = Math.max(0, baseRadius + props.radiusMod);
             }

             if (Array.isArray(r)) {
                 const [tl, tr, br, bl] = r;
                 const x = -w/2, y = -h/2;
                 // SVG Path for rounded rect with individual corners
                 const d = `M ${x+tl} ${y} L ${x+w-tr} ${y} A ${tr} ${tr} 0 0 1 ${x+w} ${y+tr} L ${x+w} ${y+h-br} A ${br} ${br} 0 0 1 ${x+w-br} ${y+h} L ${x+bl} ${y+h} A ${bl} ${bl} 0 0 1 ${x} ${y+h-bl} L ${x} ${y+tl} A ${tl} ${tl} 0 0 1 ${x+tl} ${y} Z`;
                 shapeInner = `<path d="${d}" fill="${color}" fill-opacity="${props.opacity}" stroke="${layer.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
             } else {
                 shapeInner = `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${r}" fill="${color}" fill-opacity="${props.opacity}" stroke="${layer.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
             }
        } else if (layer.unit.shape === 'circle') {
             shapeInner = `<circle cx="0" cy="0" r="${w/2}" fill="${color}" fill-opacity="${props.opacity}" stroke="${layer.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
        } else if (layer.unit.shape === 'triangle') {
             shapeInner = `<polygon points="0,${-h/2} ${w/2},${h/2} ${-w/2},${h/2}" fill="${color}" fill-opacity="${props.opacity}" stroke="${layer.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
        } else if (layer.unit.shape === 'custom' && layer.unit.customSvg) {
             // Ensure path is clean
             const pathData = layer.unit.customSvg.replace(/"/g, "'");
             shapeInner = `<path d="${pathData}" transform="translate(${-w/2}, ${-h/2})" fill="${color}" fill-opacity="${props.opacity}" stroke="${layer.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
        }

        shapesSVG += `<g transform="${transform}">${shapeInner}</g>`;
      }
    }

    return `
<svg width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${background}" />
  ${shapesSVG}
</svg>`;
}

export async function loadMaskData(url: string): Promise<MaskData | null> {
    if (!url) return null;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = img.width;
            offCanvas.height = img.height;
            const ctx = offCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                try {
                    const imageData = ctx.getImageData(0, 0, img.width, img.height);
                    resolve({
                        data: imageData.data,
                        width: imageData.width,
                        height: imageData.height
                    });
                } catch (e) {
                    console.error("Could not get image data", e);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
    });
}

// --- Perlin Noise Implementation ---
const PERLIN_PERM = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
const perm = new Array(512);
for(let i=0; i<512; i++) perm[i] = PERLIN_PERM[i & 255];

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerpVal(t: number, a: number, b: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function perlin2D(x: number, y: number, seed: number) {
    x += seed * 10.123;
    y += seed * 10.123;

    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = fade(x);
    const v = fade(y);
    
    const A = (perm[X]+Y) & 255;
    const B = (perm[X+1]+Y) & 255;
    
    return lerpVal(v, lerpVal(u, grad(perm[A], x, y), grad(perm[B], x-1, y)),
                   lerpVal(u, grad(perm[A+1], x, y-1), grad(perm[B+1], x-1, y-1)));
}
