import { motion, useReducedMotion } from "framer-motion";
import { Instagram, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { artists as defaultArtists } from "@/lib/data";
import { getOptimizedCloudinaryUrl } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

import { useQuery } from "@tanstack/react-query";
import { ArtistsSkeleton } from "./skeletons";

export function Artists() {
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: artistsList, isLoading, error } = useQuery<any[]>({
    queryKey: ["artists"],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/artists`);
      if (!res.ok) {
        throw new Error("Failed to fetch artists");
      }
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        return data.data;
      }
      throw new Error("No artists found");
    }
  });

  if (isLoading) {
    return <ArtistsSkeleton />;
  }

  if (error || !artistsList) {
    return (
      <section id="artists" className="pt-8 pb-20 md:pt-12 md:pb-28 flex items-center justify-center min-h-[300px]">
        <div className="text-center font-display text-lg text-muted-foreground">
          Unable to load content. Please try again.
        </div>
      </section>
    );
  }

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="artists" className="pt-8 pb-20 md:pt-12 md:pb-28">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">The Atelier</p>
            <h2 className="mt-5 font-display text-4xl md:text-6xl">Artists with a quiet kind of obsession.</h2>
            <p className="mt-5 text-muted-foreground text-sm leading-relaxed">
              Hand-picked stylists, trained across London, Mumbai and Milan. Each one brings a singular point of view.
            </p>
          </div>
          
          {/* Elegant Navigation Arrows */}
          <div className="hidden md:flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="w-12 h-12 rounded-full border border-[color:var(--charcoal)]/10 flex items-center justify-center text-[color:var(--charcoal)]/70 hover:text-[color:var(--gold)] hover:border-[color:var(--gold)]/40 transition-colors bg-[color:var(--charcoal)]/5 active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="w-12 h-12 rounded-full border border-[color:var(--charcoal)]/10 flex items-center justify-center text-[color:var(--charcoal)]/70 hover:text-[color:var(--gold)] hover:border-[color:var(--gold)]/40 transition-colors bg-[color:var(--charcoal)]/5 active:scale-95"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="mt-6 md:mt-14 flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {artistsList.map((a, i) => {
            const initialX = shouldReduceMotion ? 0 : (i % 2 === 0 ? -40 : 40);
            
            return (
              <motion.div
                key={a._id || a.id}
                initial={{ opacity: 0, x: initialX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.15 }}
                whileHover="hover"
                className="w-[280px] sm:w-[310px] md:w-[340px] flex-shrink-0 snap-start group cursor-pointer"
              >
                <motion.div 
                  variants={{
                    hover: { scale: shouldReduceMotion ? 1 : 1.02 }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-secondary"
                >
                  <ImageWithFallback 
                    src={getOptimizedCloudinaryUrl(a.imageUrl || a.image, 400, 500)} 
                    alt={a.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <a href="#" className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center bg-background/85 backdrop-blur hover:bg-[color:var(--gold)] transition-colors">
                    <Instagram size={15} />
                  </a>
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-background/90 backdrop-blur px-2.5 py-1.5 rounded-full text-xs">
                    <Star size={12} className="fill-[color:var(--gold)] stroke-[color:var(--gold)]" />
                    {a.rating}
                  </div>
                </motion.div>
                <div className="mt-5">
                  <h3 className="font-display text-2xl">{a.name}</h3>
                  <p className="text-sm text-muted-foreground">{a.specialty}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[color:var(--gold)]">{a.years} years experience</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
