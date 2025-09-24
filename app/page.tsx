import Image from "next/image";
import Header from "./_components/Header";
import Slideshow from "./_components/Slideshow";
import { MarqueeDemoHorizontal } from "./_components/Marquee";
import ClothesWeekHighlight from "./_components/ClothesWeekHighlight";
import CateGories from "./_components/CateGories";
import CurrentSellClothes from "./_components/CurrentSellClothes";
import BestCollections from "./_components/BestCollections";

export default function Home() {
  return (
    <div className="font-sans">
     <Header/>
     <Slideshow/>
     <MarqueeDemoHorizontal/>
     <ClothesWeekHighlight/>
     <CateGories/>
     <CurrentSellClothes/>
     <BestCollections/>
    </div>
  );
}
