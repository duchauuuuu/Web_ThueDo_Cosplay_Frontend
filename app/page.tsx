import Image from "next/image";
import Header from "./_components/Header";
import Slideshow from "./_components/Slideshow";
import { MarqueeDemoHorizontal } from "./_components/Marquee";
import ClothesWeekHighlight from "./_components/ClothesWeekHighlight";
import CateGories from "./_components/CateGories";

export default function Home() {
  return (
    <div className="font-sans">
     <Header/>
     <Slideshow/>
     <MarqueeDemoHorizontal/>
     <ClothesWeekHighlight/>
     <CateGories/>
    </div>
  );
}
