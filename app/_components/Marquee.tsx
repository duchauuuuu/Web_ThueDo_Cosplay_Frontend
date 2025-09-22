/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const reviews = [
 {
    icon:'./public/iconmaque.gif',
    num:'97%',
    content:'Khách hàng hài lòng',

 },
 {
    icon:'./public/iconmaque.gif',
    num:'200+',
    content:'Trang phục',

 },
 {
    icon:'./public/iconmaque.gif',
    num:'400+',
    content:'Trang phục được thuê',

 },
 {
    icon:'./public/iconmaque.gif',
    num:'20+',
    content:'Nhãn hàng đồ cosplay',

 }

];


const StatsItem = ({
  icon,
  num,
  content,
}: {
  icon: string;
  num: string;
  content: string;
}) => {
  return (
    <div className="flex items-center gap-2 mx-6">
      <img 
        src="/iconmaque.gif" 
        alt="Icon" 
        width="20" 
        height="20" 
        className="flex-shrink-0"
      />
      <div className="text-base font-bold transition-colors duration-300" style={{ color: '#027a36' }}>
        {num}
      </div>
      <div className="text-base font-medium transition-colors duration-300 text-gray-700 dark:text-gray-300 hover:text-[#027a36] cursor-pointer">
        {content}
      </div>
    </div>
  );
};

export function MarqueeDemoHorizontal() {
  return (
    <section className="overflow-hidden flex items-center" style={{ backgroundColor: '#f5f0e8', height: '70px' }}>
      <div className="relative w-full">
        <Marquee pauseOnHover className="[--duration:30s]">
          {reviews.map((stat, index) => (
            <StatsItem key={index} {...stat} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
