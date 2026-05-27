import { motion } from "framer-motion";
import { services, artists } from "@/lib/data";

// Build a varied masonry from existing assets
const tiles = [
  { src: services[0].image, span: "row-span-2" },
  { src: artists[2].image, span: "" },
  { src: services[3].image, span: "" },
  { src: services[2].image, span: "row-span-2" },
  { src: services[5].image, span: "" },
  { src: services[6].image, span: "" },
  { src: artists[0].image, span: "" },
  { src: services[1].image, span: "row-span-2" },
  { src: artists[3].image, span: "" },
];

export function InstaGrid() {
  return (
    <section className="py-28 md:py-36 bg-secondary/40">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow">@lookshubsalon</p>
            <h2 className="mt-5 font-display text-4xl md:text-6xl max-w-xl">Captured at the atelier.</h2>
          </div>
          <a href="#" className="text-sm uppercase tracking-[0.2em] hover:text-[color:var(--gold)]">Follow on Instagram →</a>
        </div>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 grid-rows-[180px] md:grid-rows-[220px] auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4">
          {tiles.map((t, i) => (
            <motion.a
              href="#"
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl ${t.span}`}
            >
              <img src={t.src} loading="lazy" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-[color:var(--charcoal)]/0 group-hover:bg-[color:var(--charcoal)]/30 transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
