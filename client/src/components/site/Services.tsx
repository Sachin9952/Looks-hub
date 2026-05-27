import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";

export function Services() {
  return (
    <section id="services" className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow">Our Services</p>
            <h2 className="mt-5 font-display text-4xl md:text-6xl max-w-2xl">
              Rituals shaped by craft, not trend.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            Every service begins with a quiet consultation. We design the experience around your hair,
            your skin and your moment.
          </p>
        </div>

        <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08 }}
              className="group relative bg-card rounded-[1.75rem] overflow-hidden border border-border hover:shadow-[var(--shadow-luxe)] transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <div className="p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl">{s.name}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  <Link
                    to="/book"
                    aria-label={`Book ${s.name}`}
                    className="shrink-0 w-10 h-10 grid place-items-center rounded-full border border-border group-hover:bg-[color:var(--gold)] group-hover:border-[color:var(--gold)] group-hover:text-[color:var(--charcoal)] transition-all"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span>From ₹{s.price.toLocaleString("en-IN")}</span>
                  <span>{s.duration}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
