import Image from "next/image";
import Header from "./_components/Header";
import Slideshow from "./_components/Slideshow";

export default function Home() {
  return (
    <div className="font-sans">
     <Header/>
     <Slideshow/>
    </div>
  );
}
