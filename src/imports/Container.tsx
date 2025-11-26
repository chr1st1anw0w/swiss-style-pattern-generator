import svgPaths from "./svg-f8433rv0ls";

function Interests() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="interests">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="interests">
          <path d={svgPaths.p1c69cc00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[18px] text-neutral-950 text-nowrap top-0 tracking-[-0.1504px] whitespace-pre">Unit Shape</p>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-[96.391px]" data-name="Sidebar">
      <Interests />
      <Text />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="box-border content-stretch flex items-center justify-between p-[8px] relative shrink-0 w-[247px]" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-black border-solid inset-0 pointer-events-none" />
      <Sidebar />
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-[180deg]">
          <Icon />
        </div>
      </div>
    </div>
  );
}

function SettingsBackupRestore() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="settings_backup_restore">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="settings_backup_restore" opacity="0.5">
          <path d={svgPaths.p1dae2f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-[76px]">
      <p className="font-['IBM_Plex_Sans:SemiBold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#1e1e1e] text-[14px] text-nowrap whitespace-pre">Stroke Width</p>
      <SettingsBackupRestore />
    </div>
  );
}

function SliderOutput() {
  return (
    <div className="box-border content-stretch flex font-['IBM_Plex_Sans:Regular',sans-serif] items-center leading-[0] not-italic opacity-60 px-[2px] py-0 relative rounded-[2px] shrink-0 text-[12px] text-black text-nowrap text-right" data-name="Slider Output">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4] text-nowrap whitespace-pre">5</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4] text-nowrap whitespace-pre">px</p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Label">
      <Frame />
      <SliderOutput />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-px right-px top-1/2 translate-y-[-50%]">
      <div className="absolute h-px left-px mix-blend-multiply right-px top-1/2 translate-y-[-50%]" data-name="track">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 229 1">
          <g id="track" style={{ mixBlendMode: "multiply" }}>
            <path clipRule="evenodd" d="M229 1H0V0H229V1Z" fill="var(--fill-0, #E5E5E5)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
      <div className="absolute h-px left-px top-[6px] w-[52px]" data-name="track delta">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 1">
          <path clipRule="evenodd" d="M52 1H0V0H52V1Z" fill="var(--fill-0, black)" fillOpacity="0.8" fillRule="evenodd" id="track delta" />
        </svg>
      </div>
    </div>
  );
}

function Endpoint() {
  return (
    <div className="absolute left-[51px] size-[8px] top-[2px]" data-name="Endpoint">
      <div className="absolute bg-white inset-0 rounded-[100px]" data-name="Circle">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none rounded-[100.5px]" />
      </div>
      <div className="absolute bg-white inset-0 rounded-[100px]" data-name="Circle">
        <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[100px]" />
      </div>
    </div>
  );
}

function SliderBar() {
  return (
    <div className="h-[13px] relative shrink-0 w-full" data-name="Slider Bar">
      <Group />
      <Endpoint />
    </div>
  );
}

function Slider() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-full" data-name="Slider">
      <Label />
      <SliderBar />
    </div>
  );
}

function PrimitiveLabel() {
  return (
    <div className="content-stretch flex gap-[8px] h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['IBM_Plex_Sans:SemiBold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#1e1e1e] text-[14px] text-nowrap whitespace-pre">Shape Type</p>
    </div>
  );
}

function PrimitiveSpan() {
  return (
    <div className="h-[20px] relative shrink-0 w-[64.609px]" data-name="Primitive.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center overflow-clip relative rounded-[inherit] w-[64.609px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-neutral-950 text-nowrap tracking-[-0.1504px] whitespace-pre">Rectangle</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon" opacity="0.5">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[4px] shrink-0 w-full" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[36px] items-center justify-between px-[13px] py-px relative w-full">
          <PrimitiveSpan />
          <Icon1 />
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveLabel />
      <PrimitiveButton1 />
    </div>
  );
}

function PrimitiveLabel1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['IBM_Plex_Sans:SemiBold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#1e1e1e] text-[14px] text-nowrap whitespace-pre">Stroke Color</p>
    </div>
  );
}

function ColorPicker() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 size-[32px]" data-name="Color Picker">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[32px]" />
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[38.164px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[38.164px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">#ffffff</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="Container">
      <ColorPicker />
      <Text1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[54px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveLabel1 />
      <Container1 />
    </div>
  );
}

function SettingsBackupRestore1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="settings_backup_restore">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="settings_backup_restore" opacity="0.5">
          <path d={svgPaths.p1dae2f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-[76px]">
      <p className="font-['IBM_Plex_Sans:SemiBold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#1e1e1e] text-[14px] text-nowrap whitespace-pre">Border Radius</p>
      <SettingsBackupRestore1 />
    </div>
  );
}

function SliderOutput1() {
  return (
    <div className="box-border content-stretch flex font-['IBM_Plex_Sans:Regular',sans-serif] items-center leading-[0] not-italic opacity-60 px-[2px] py-0 relative rounded-[2px] shrink-0 text-[12px] text-black text-nowrap text-right" data-name="Slider Output">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4] text-nowrap whitespace-pre">5</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4] text-nowrap whitespace-pre">px</p>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Label">
      <Frame1 />
      <SliderOutput1 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-px right-px top-1/2 translate-y-[-50%]">
      <div className="absolute h-px left-px mix-blend-multiply right-px top-1/2 translate-y-[-50%]" data-name="track">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 229 1">
          <g id="track" style={{ mixBlendMode: "multiply" }}>
            <path clipRule="evenodd" d="M229 1H0V0H229V1Z" fill="var(--fill-0, #E5E5E5)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
      <div className="absolute h-px left-px top-[6px] w-[52px]" data-name="track delta">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 1">
          <path clipRule="evenodd" d="M52 1H0V0H52V1Z" fill="var(--fill-0, black)" fillOpacity="0.8" fillRule="evenodd" id="track delta" />
        </svg>
      </div>
    </div>
  );
}

function Endpoint1() {
  return (
    <div className="absolute left-[51px] size-[8px] top-[2px]" data-name="Endpoint">
      <div className="absolute bg-white inset-0 rounded-[100px]" data-name="Circle">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none rounded-[100.5px]" />
      </div>
      <div className="absolute bg-white inset-0 rounded-[100px]" data-name="Circle">
        <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[100px]" />
      </div>
    </div>
  );
}

function SliderBar1() {
  return (
    <div className="h-[13px] relative shrink-0 w-full" data-name="Slider Bar">
      <Group1 />
      <Endpoint1 />
    </div>
  );
}

function Slider1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-full" data-name="Slider">
      <Label1 />
      <SliderBar1 />
    </div>
  );
}

function Sidebar1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[242px] items-start relative shrink-0 w-full" data-name="Sidebar">
      <Slider />
      <Container />
      <Container2 />
      <Slider1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[8px] relative w-full">
          <Sidebar1 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveDiv() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[8px] shrink-0 w-full" data-name="Primitive.div">
      <PrimitiveButton />
      <Container3 />
    </div>
  );
}

export default function Container4() {
  return (
    <div className="bg-[#e5e4e4] relative rounded-[16px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[8px] relative size-full">
          <PrimitiveDiv />
        </div>
      </div>
    </div>
  );
}