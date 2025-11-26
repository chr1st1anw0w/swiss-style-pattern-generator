import imgImage1 from "figma:asset/974bc3a748ea71969b321145885b94c2447a8b1e.png";
import imgImage2 from "figma:asset/d4ff85e1fb39ede98079d953234e900c22de2580.png";

function Frame() {
  return (
    <div className="bg-white h-[323px] overflow-clip relative shrink-0 w-[250px]">
      <div className="absolute h-[960px] left-[-768px] top-[-181px] w-[1536px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-white h-[323px] overflow-clip relative shrink-0 w-[250px]">
      <div className="absolute h-[960px] left-[-768px] top-[-181px] w-[1536px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[1260px] left-[-968px] top-[-366px] w-[2016px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}

export default function Frame2() {
  return (
    <div className="bg-white relative size-full">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[10px] items-center px-[14px] py-[46px] relative size-full">
          <Frame />
          <Frame1 />
        </div>
      </div>
    </div>
  );
}