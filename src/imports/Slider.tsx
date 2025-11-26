import svgPaths from "./svg-561kryb8i5";

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
      <p className="basis-0 font-['IBM_Plex_Sans:SemiBold',sans-serif] grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[14px]">{`Opacity `}</p>
      <SettingsBackupRestore />
    </div>
  );
}

function SliderOutput() {
  return (
    <div className="box-border content-stretch flex font-['IBM_Plex_Sans:Regular',sans-serif] items-center leading-[0] not-italic opacity-60 px-[2px] py-0 relative rounded-[2px] shrink-0 text-[12px] text-black text-nowrap text-right" data-name="Slider Output">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4] text-nowrap whitespace-pre">50</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4] text-nowrap whitespace-pre">%</p>
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
      <div className="absolute h-px left-px right-px top-1/2 translate-y-[-50%]" data-name="track">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 178 1">
          <path clipRule="evenodd" d="M178 1H0V0H178V1Z" fill="var(--fill-0, #E5E5E5)" fillRule="evenodd" id="track" />
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

export default function Slider() {
  return (
    <div className="bg-white relative size-full" data-name="Slider">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[4px] items-center px-[10px] py-[5px] relative size-full">
          <Label />
          <SliderBar />
        </div>
      </div>
    </div>
  );
}