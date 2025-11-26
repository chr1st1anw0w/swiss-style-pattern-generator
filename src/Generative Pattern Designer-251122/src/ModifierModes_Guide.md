# Modifier Modes Guide: Normal & Sequence

**Version**: 1.0  
**Date**: 2025-11-22  
**Target**: Standardized Logic for Generative Parameters  

---

## 1. System Philosophy

The Generative Engine moves away from pure "Randomness" towards **Controlled Chaos**. We achieved this by unifying all modifier logic (Rotation, Scale, Position, Opacity) into two distinct modes:

1.  **Normal Mode**: Organic variation centered around a base value.
2.  **Sequence Mode**: Rhythmic, deterministic patterns based on looped arrays.

---

## 2. Mode 1: Normal (Base + Noise)

This mode is designed to simulate natural imperfection. Instead of selecting a random value between A and B, it selects a **Target Value** and applies **Noise** to it.

### 2.1 Algorithm Logic

```typescript
/**
 * Calculates a value based on a center point and organic noise.
 * 
 * @param base - The target value (e.g., 45 degrees)
 * @param noiseFactor - 0 to 100 (Intensity of deviation)
 * @param range - The maximum possible deviation (e.g., 360 deg)
 * @param seed - Random seed for deterministic results
 */
const getNormalValue = (base: number, noiseFactor: number, range: number, seed: number): number => {
  if (noiseFactor === 0) return base; // Pure geometric structure

  // Psuedo-random float between -1 and 1
  const noise = seededRandom(seed) * 2 - 1; 
  
  // Apply deviation
  const deviation = noise * range * (noiseFactor / 100);
  
  return base + deviation;
};
```

### 2.2 UI Layout & Design

**Container Style**:
*   Background: `var(--color-background)`
*   Border: `1px solid var(--color-border)`
*   Radius: `var(--radius)`
*   Padding: `p-4`

**Layout Structure**:
```text
[ Flex Column: Gap 4 ]
   |
   ├─ [ Label Row ]
   |     ├─ Label: "Rotation" (Font: var(--font-sans))
   |     └─ Mode Toggle: [ Normal | Sequence ]
   |
   ├─ [ Base Value Control ]
   |     ├─ Label: "Base Angle"
   |     └─ Slider: 0° to 360° (Color: var(--color-primary))
   |
   └─ [ Noise Control ]
         ├─ Label: "Organic Noise"
         └─ Slider: 0% to 100% (Track: var(--color-muted))
```

**Design System Integration**:
*   **Sliders**: The active track must use `var(--color-primary)`. The thumb should be white with a border matching the primary color.
*   **Typography**: All labels use `var(--font-sans)`.

---

## 3. Mode 2: Sequence (Rhythmic Loops)

This mode allows for precise, repeating patterns. It is essential for creating glitched, technological, or textile-inspired patterns.

### 3.1 Algorithm Logic

```typescript
/**
 * Selects a value from a defined array based on the grid index.
 * 
 * @param sequence - Array of numbers [0, 90, 180, 270]
 * @param index - The current grid item index (0 to totalItems)
 */
const getSequenceValue = (sequence: number[], index: number): number => {
  if (!sequence || sequence.length === 0) return 0;
  
  // Modulo operator creates the loop
  // Item 0 -> seq[0], Item 1 -> seq[1], ... Item 5 -> seq[0]
  return sequence[index % sequence.length];
};
```

### 3.2 UI Layout & Design

**Layout Structure**:
```text
[ Flex Column: Gap 4 ]
   |
   ├─ [ Label Row ]
   |     └─ Mode Toggle: [ Normal | Sequence ]
   |
   ├─ [ Input Area ]
   |     ├─ Label: "Sequence Values"
   |     └─ Textarea / Input: "0, 45, 90, 45"
   |           (Font: var(--font-mono) for numbers)
   |
   └─ [ AI / Preset Chips ] (ScrollArea Horizontal)
         ├─ Chip: "Alternating" [0, 180]
         ├─ Chip: "Stairs" [10, 20, 30, 40]
         └─ Chip: "Chaotic" [12, 87, 3, 140]
```

**Component Specs**:
*   **Preset Chips**:
    *   Background: `var(--color-muted)`
    *   Text: `var(--color-foreground)`
    *   Hover: `var(--color-primary)` with `text-white` transition.
    *   Radius: `full` (Pill shape).
*   **Input Field**:
    *   Border: `1px solid var(--color-border)`
    *   Focus Ring: `var(--color-primary)`

---

## 4. Reusable React Component (Blueprint)

Here is the recommended structure for a reusable `ModifierControl` component that handles both modes.

```tsx
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModifierControlProps {
  label: string;
  mode: 'normal' | 'sequence';
  // Normal Props
  value: number;
  noise: number;
  // Sequence Props
  sequence: string; // stored as string "1, 2, 3"
  // Callbacks
  onChange: (updates: Partial<Config>) => void;
}

export const ModifierControl = ({ ...props }: ModifierControlProps) => {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] p-4 bg-[var(--color-background)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-sans font-medium text-sm">{props.label}</h3>
        
        <Tabs value={props.mode} onValueChange={(v) => props.onChange({ mode: v })}>
          <TabsList className="h-7">
            <TabsTrigger value="normal" className="text-xs">Normal</TabsTrigger>
            <TabsTrigger value="sequence" className="text-xs">Sequence</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {props.mode === 'normal' ? (
        <div className="space-y-4">
          {/* Base Slider */}
          <div className="space-y-2">
             <div className="flex justify-between text-xs text-[var(--color-foreground)]">
               <span>Base</span>
               <span className="font-mono">{props.value}</span>
             </div>
             <Slider 
               value={[props.value]} 
               onValueChange={([v]) => props.onChange({ value: v })}
               className="[&>.relative>.bg-primary]:bg-[var(--color-primary)]"
             />
          </div>
          
          {/* Noise Slider */}
          <div className="space-y-2">
             <div className="flex justify-between text-xs text-[var(--color-foreground)]">
               <span>Noise</span>
               <span className="font-mono">{props.noise}%</span>
             </div>
             <Slider 
               value={[props.noise]} 
               max={100}
               onValueChange={([v]) => props.onChange({ noise: v })}
             />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
           {/* Sequence Input */}
           <input 
             className="w-full p-2 text-sm border rounded bg-[var(--color-input)] text-[var(--color-foreground)] font-mono"
             value={props.sequence}
             onChange={(e) => props.onChange({ sequence: e.target.value })}
             placeholder="0, 45, 90..."
           />
           
           {/* Presets */}
           <div className="flex gap-2 flex-wrap">
             {['0, 90', '0, 45, 90, 135', 'random'].map(p => (
               <button 
                 key={p}
                 onClick={() => props.onChange({ sequence: p })}
                 className="text-xs px-2 py-1 rounded-full bg-[var(--color-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
               >
                 {p}
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};
```

---

## 5. Summary of Design System Usage

To ensure visual consistency across projects:

1.  **CSS Variables**:
    *   Use `var(--color-primary)` for active states (Slider fill, Active Tab, Hovered Chip).
    *   Use `var(--color-muted)` for inactive backgrounds (Slider track, Inactive Chip).
    *   Use `var(--radius)` for the main container corners.
2.  **Typography**:
    *   Headings/Labels: `font-sans` (DM Sans).
    *   Numerical Inputs: `font-mono` (Monospace) for alignment precision.
3.  **Spacing**:
    *   Standard Gap: `gap-4` (1rem).
    *   Compact Gap: `gap-2` (0.5rem) for presets.
