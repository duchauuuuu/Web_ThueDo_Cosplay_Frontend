"use client";
import React, { useState, useRef, useEffect } from "react";

const classNames = (
  ...classes: (string | boolean | undefined | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

interface Person {
  name: string;
  title: string;
  img: string;
}

const persons: Person[] = [
  {
    name: "Aria Rossi",
    title: "Lead Architect",
    img: "/img_clothes/anime/1.png",
  },
  {
    name: "Leo Carter",
    title: "Creative Director",
    img: "/img_clothes/anime/2.png",
  },
  {
    name: "Mia Chen",
    title: "Senior Developer",
    img: "/img_clothes/anime/Akatsuki truyện naruto (4).jpg",
  },
  {
    name: "Kai Tanaka",
    title: "UX/UI Designer",
    img: "/img_clothes/anime/Akatsuki truyện naruto (5).jpg",
  },
  {
    name: "Zoe Williams",
    title: "Project Manager",
    img: "/img_clothes/anime/Boa Hancok One Piece (4)-min.jpg",
  },
  {
    name: "Ethan Hunt",
    title: "Marketing Head",
    img: "/img_clothes/anime/Boa Hancok One Piece (6)-min (1).jpg",
  },
  {
    name: "Chloe Garcia",
    title: "Data Scientist",
    img: "/img_clothes/anime/cosplay D.VA game Overwatch (2)-min.jpg",
  },
  {
    name: "Noah King",
    title: "Brand Strategist",
    img: "/img_clothes/anime/cosplay D.VA game Overwatch (5)-min.jpg",
  },
  {
    name: "Ava Martinez",
    title: "Content Creator",
    img: "/img_clothes/anime/Shenhe-Cosplay-1.jpg",
  },
  {
    name: "New Person 1",
    title: "Designer",
    img: "/img_clothes/anime/Shenhe-Cosplay-5.jpg",
  },
  {
    name: "New Person 2",
    title: "Developer",
    img: "/img_clothes/anime/Zoro One piece (1).jpg",
  },
];

function ImageCarousel() {
  const [activeItem, setActiveItem] = useState(Math.floor(persons.length / 2));
  const wrapperRef = useRef<HTMLUListElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    wrapperRef.current.style.setProperty(
      "--transition",
      "600ms cubic-bezier(0.22, 0.61, 0.36, 1)"
    );

    timeoutRef.current = setTimeout(() => {
      wrapperRef.current?.style.removeProperty("--transition");
    }, 900);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeItem]);

  return (
    <>
     <div className="w-full font-sans flex justify-center">
       <div className="w-[99%] p-4 sm:p-6 md:p-8">
        <ul
          ref={wrapperRef}
          className="flex w-full flex-col gap-2 md:h-[540px] md:flex-row md:gap-[1.5%]"
        >
          {persons.map((person, index) => (
            <li
              onClick={() => setActiveItem(index)}
              aria-current={activeItem === index}
              className={classNames(
                "relative group cursor-pointer transition-all duration-500 ease-in-out",
                "md:w-[8%]",
                "md:[&[aria-current='true']]:w-[32%]",
                "md:[transition:width_var(--transition,300ms_ease_in)]"
              )}
              key={person.name}
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-2xl transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:z-10 transform-gpu">
                <img
                  className={classNames(
                    "absolute left-1/2 top-1/2 h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-cover transition-all duration-500 ease-in-out",
                    activeItem === index
                      ? "scale-105 grayscale-0"
                      : "scale-100 grayscale"
                  )}
                  src={person.img}
                  alt={person.name}
                  width="590"
                  height="640"
                />
                <div
                  className={classNames(
                    "absolute inset-0 transition-opacity duration-500",
                    activeItem === index ? "opacity-100" : "opacity-0",
                    "bg-gradient-to-t from-black/70 via-black/30 to-transparent",
                    "md:absolute"
                  )}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      
     
    </div>
     {/* Nút thuê ngay ở dưới carousel */}
     <div className="flex items-center justify-center mt-8">
     <ShimmerButton />
   </div>
   </>
  );
}

// Component ShimmerButton với màu xanh lá cây
function ShimmerButton() {
  const customCss = `
    /* CSS cho hiệu ứng shimmer */
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    /* Keyframe animation cho shimmer effect */
    @keyframes shimmer-spin {
      to {
        --angle: 360deg;
      }
    }
  `;

  return (
    <div className="flex items-center justify-center font-sans">
      <style>{customCss}</style>
      <button className="relative inline-flex items-center justify-center p-[1.5px] bg-gray-300 dark:bg-black rounded-full overflow-hidden group">
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: 'conic-gradient(from var(--angle), transparent 25%, #22c55e, transparent 50%)',
            animation: 'shimmer-spin 2.5s linear infinite',
          }}
        />
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'conic-gradient(from var(--angle), transparent 25%, #000000, transparent 50%)',
            animation: 'shimmer-spin 2.5s linear infinite',
          }}
        />
        <span className="relative z-10 inline-flex items-center justify-center w-full h-full px-8 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-full group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
          Thuê Ngay
        </span>
      </button>
    </div>
  );
}

export default ImageCarousel;