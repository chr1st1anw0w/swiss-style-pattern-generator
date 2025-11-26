import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider@1.2.3';
import { cn } from '../lib/utils';
import svgPaths from '../imports/svg-561kryb8i5';

interface FigmaSliderProps {
  label: React.ReactNode;
  value: number | number[];
  onValueChange: (value: any) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  formatValue?: (val: number) => string | number;
  onReset?: () => void;
}

const ResetIcon = () => (
   <div className="relative shrink-0 size-[16px]" data-name="settings_backup_restore">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="settings_backup_restore" opacity="0.5">
          <path d={svgPaths.p1dae2f00} fill="var(--text)" id="Vector" />
        </g>
      </svg>
    </div>
);

export function FigmaSlider({ 
  label, 
  value, 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  suffix = '', 
  className, 
  formatValue,
  onReset 
}: FigmaSliderProps) {
  const format = (v: number) => formatValue ? formatValue(v) : v;
  const displayValue = Array.isArray(value) 
      ? value.map(format).join(' - ') 
      : format(value);

  const valArray = Array.isArray(value) ? value : [value];

  return (
    <div className={cn("flex flex-col gap-[6px] w-full select-none", className)}>
      {/* Label Row */}
      <div className="flex items-center justify-between w-full h-[20px]">
        <div className="flex items-center gap-[4px]">
           <span className="text-[13px] font-semibold font-sans text-[var(--text)] leading-[1.4]">{label}</span>
           {onReset && (
             <button onClick={onReset} className="text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-colors bg-transparent border-none p-0 flex items-center justify-center">
               <ResetIcon />
             </button>
           )}
        </div>
        <div className="flex items-center text-[12px] text-[var(--text)] opacity-70 font-sans leading-none bg-transparent px-[2px] py-0 rounded-[2px]">
           <span className="text-right whitespace-pre font-mono">{displayValue}</span>
           {suffix && <span className="whitespace-pre ml-0.5">{suffix}</span>}
        </div>
      </div>

      {/* Slider Row */}
      <div className="h-[20px] relative w-full flex items-center mx-[0px] my-[2px]">
         <SliderPrimitive.Root
            className="relative flex w-full touch-none items-center select-none h-[20px] cursor-pointer group"
            value={valArray}
            max={max}
            min={min}
            step={step}
            onValueChange={(vals) => onValueChange(Array.isArray(value) ? vals : vals[0])}
          >
            <SliderPrimitive.Track className="bg-[var(--border)] relative grow h-[4px] w-full overflow-hidden rounded-full">
              <SliderPrimitive.Range className="absolute h-full bg-[var(--text)] opacity-90" />
            </SliderPrimitive.Track>
            {valArray.map((_, i) => (
                <SliderPrimitive.Thumb
                  key={i}
                  className="block size-[14px] rounded-full bg-[var(--background)] border-[2px] border-[var(--text)] shadow-sm transition-transform focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-110 focus:scale-110"
                />
            ))}
          </SliderPrimitive.Root>
      </div>
    </div>
  );
}
