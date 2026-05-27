import { motion } from "framer-motion";
import { Instagram, Star } from "lucide-react";
import { artists } from "@/lib/data";

export function Artists() {
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
          {artists.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-secondary">
                <img src={a.image} alt={a.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
                <a href="#" className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center bg-background/85 backdrop-blur hover:bg-[color:var(--gold)] transition-colors">
                  <Instagram size={15} />
                </a>
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-background/90 backdrop-blur px-2.5 py-1.5 rounded-full text-xs">
                  <Star size={12} className="fill-[color:var(--gold)] stroke-[color:var(--gold)]" />
                  {a.rating}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="font-display text-2xl">{a.name}</h3>
                <p className="text-sm text-muted-foreground">{a.specialty}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[color:var(--gold)]">{a.years} years experience</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
