"use client";

import { useRef, useState, useEffect } from "react";
import { Product } from "@/types/store/product";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function SuggestedProductsCarousel({ products, onAddToCart }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Scroll manual con mouse
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - el.offsetLeft);
      setScrollLeft(el.scrollLeft);
    };
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  // Calcular visibilidad de flechas (con retraso por modal)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateArrows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    };

    const timeout = setTimeout(updateArrows, 100); // 🔧 clave para modales

    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = 240;
    scrollRef.current.scrollBy({ left: dir === "left" ? -offset : offset, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className="mt-2 relative">
      {/* Flechas dinámicas */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 bg-white border shadow-md rounded-full p-2 ml-2 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 bg-white border shadow-md rounded-full p-2 mr-2 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Carrusel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x scroll-smooth cursor-grab active:cursor-grabbing select-none px-0 pr-[60px] py-2"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[200px] md:min-w-[240px] flex-shrink-0 snap-start bg-white border border-gray-200 rounded-[15px] p-3 relative"
          >
            <img
              src={product.image?.trim() || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-28 object-cover rounded-md pointer-events-none"
            />
            <p className="font-medium mt-2 line-clamp-2">{product.name}</p>
            <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>

            <button
              onClick={() => onAddToCart(product)}
              className="absolute top-2 right-2 bg-black hover:bg-gray-800 text-white p-2 rounded-full"

            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
