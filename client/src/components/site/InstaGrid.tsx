import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { services, artists } from "@/lib/data";

// Build a varied masonry from existing assets with luxury editorial styling labels
const tiles = [
  { src: services[0].image, span: "row-span-2", label: "Hair Styling" },
  { src: artists[2].image, span: "", label: "Hair Color" },
  { src: services[3].image, span: "", label: "Bridal Makeup" },
  { src: services[2].image, span: "row-span-2", label: "Creative Coloring" },
  { src: services[5].image, span: "", label: "Classic Shaving" },
  { src: services[6].image, span: "", label: "Gentlemen's Grooming" },
  { src: artists[0].image, span: "", label: "Atelier Styling" },
  { src: services[1].image, span: "row-span-2", label: "Nourishing Hair Spa" },
  { src: artists[3].image, span: "", label: "Esthetics & Skincare" },
];

export function InstaGrid() {
  const headerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="py-20 md:py-24 bg-secondary/40">
      <div className="container-luxe">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <p className="eyebrow">@lookshubsalon</p>
            <h2 className="mt-5 font-display text-4xl md:text-6xl max-w-xl">The Lookbook.</h2>
          </div>
          <motion.a 
            href="#" 
            className="text-sm uppercase tracking-[0.2em] hover:text-[color:var(--gold)] flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity duration-300 group"
            whileHover="hover"
          >
            <span>Follow on Instagram</span>
            <motion.span 
              className="inline-block" 
              variants={{
                hover: { x: 6 }
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              →
            </motion.span>
          </motion.a>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 grid-rows-[180px] md:grid-rows-[220px] auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4"
        >
          {tiles.map((t, i) => (
            <GalleryTile key={i} tile={t} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function GalleryTile({ tile, index }: { tile: typeof tiles[0]; index: number }) {
  const containerRef = useRef<HTMLAnchorElement>(null);

  const isTaller = tile.span.includes("row-span-2");
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Performance-optimized parallax transform
  const yTransform = useTransform(scrollYProgress, [0, 1], isTaller ? [-20, 20] : [0, 0]);
  const ySpring = useSpring(yTransform, { stiffness: 80, damping: 25, restDelta: 0.001 });

  // Grid entry animations
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7, 
        ease: [0.25, 1, 0.5, 1]
      } 
    }
  };

  const imageHoverVariants = {
    initial: { scale: 1, filter: "brightness(1) contrast(1)" },
    hover: { 
      scale: 1.04,
      filter: "brightness(1.02) contrast(1.02)",
      transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } 
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 0.15,
      transition: { duration: 0.4, ease: "easeInOut" } 
    }
  };

  const labelVariants = {
    initial: { opacity: 0, y: 10 },
    hover: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } 
    }
  };

  return (
    <motion.a
      ref={containerRef}
      href="#"
      variants={itemVariants}
      whileHover="hover"
      className={`group relative overflow-hidden rounded-2xl ${tile.span} block bg-secondary/20`}
    >
      {/* Parallax layer wrapper with bleed */}
      <motion.div 
        style={{ 
          y: isTaller ? ySpring : 0,
        }}
        className={`absolute inset-0 w-full ${isTaller ? 'h-[116%] -top-[8%]' : 'h-full'} overflow-hidden`}
      >
        <motion.img 
          src={tile.src} 
          loading="lazy"
          variants={imageHoverVariants}
          alt="" 
          className="w-full h-full object-cover" 
        />
      </motion.div>
      
      {/* Translucent overlay */}
      <motion.div 
        className="absolute inset-0 bg-black pointer-events-none"
        variants={overlayVariants}
        initial="initial"
      />
      
      {/* Category Label */}
      <motion.div 
        className="absolute bottom-4 left-4 pointer-events-none z-10"
        variants={labelVariants}
        initial="initial"
      >
        <span className="text-[10px] md:text-xs font-sans uppercase tracking-[0.25em] text-[color:var(--cream)] bg-black/35 backdrop-blur-[3px] px-3 py-1.5 rounded-full border border-white/5">
          {tile.label}
        </span>
      </motion.div>
    </motion.a>
  );
}
