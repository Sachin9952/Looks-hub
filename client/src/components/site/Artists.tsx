import { motion, useReducedMotion } from "framer-motion";
import { Instagram, Star } from "lucide-react";
import { artists } from "@/lib/data";

export function Artists() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="artists" className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="max-w-2xl">
          <p className="eyebrow">The Atelier</p>
          <h2 className="mt-5 font-display text-4xl md:text-6xl">Artists with a quiet kind of obsession.</h2>
          <p className="mt-5 text-muted-foreground text-sm leading-relaxed">
            Hand-picked stylists, trained across London, Mumbai and Milan. Each one brings a singular point of view.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((a, i) => {
            const initialX = shouldReduceMotion ? 0 : (i % 2 === 0 ? -40 : 40);
            
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: initialX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.15 }}
                whileHover="hover"
                className="group cursor-pointer"
              >
                <motion.div 
                  variants={{
                    hover: { scale: shouldReduceMotion ? 1 : 1.02 }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-secondary"
                >
                  <motion.img 
                    src={a.image} 
                    alt={a.name} 
                    loading="lazy" 
                    variants={{
                      hover: { scale: shouldReduceMotion ? 1 : 1.05 }
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full h-full object-cover" 
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
