"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StickyCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
}

export default function StickyCategoryTabs({
  categories,
  selectedCategory,
  onCategoryClick,
}: StickyCategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateArrows = () => {
      if (!container) return;
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft + container.clientWidth < container.scrollWidth
      );
    };

    updateArrows();
    container.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    return () => {
      container.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollTabs = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = 150;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const activeTab = tabsRef.current[selectedCategory];
    const container = containerRef.current;
    if (activeTab && container) {
      const tabLeft = activeTab.offsetLeft;
      const tabRight = tabLeft + activeTab.offsetWidth;
      const containerLeft = container.scrollLeft;
      const containerRight = containerLeft + container.clientWidth;

      if (tabLeft < containerLeft || tabRight > containerRight) {
        container.scrollTo({
          left: tabLeft - container.clientWidth / 2 + activeTab.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [selectedCategory]);

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="relative flex items-center">
        {showLeftArrow && (
          <button
            onClick={() => scrollTabs("left")}
            className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-white to-transparent"
          >
            ⬅️
          </button>
        )}
        <div
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-hide space-x-4 px-4 py-3"
        >
          {categories.map((category) => (
            <button
              key={category}
              ref={(el) => {
                tabsRef.current[category.replace(/\s+/g, "-").toLowerCase()] = el;
              }}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              )}
              onClick={() => onCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {showRightArrow && (
          <button
            onClick={() => scrollTabs("right")}
            className="absolute right-0 z-10 h-full px-2 bg-gradient-to-l from-white to-transparent"
          >
            ➡️
          </button>
        )}
      </div>
    </div>
  );
}
