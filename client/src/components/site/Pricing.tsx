import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { packages } from "@/lib/data";

export function Pricing() {
  return (
    <section id="pricing" className="py-28 md:py-36 bg-secondary/40">
      <div className="container-luxe">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow justify-center">Packages</p>
          <h2 className="mt-5 font-display text-4xl md:text-6xl">Considered packages. No hidden small print.</h2>
        </div>

        <div className="mt-16 grid gap-7 md:grid-cols-3">
          {packages.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={`relative rounded-[1.75rem] p-8 md:p-10 border transition-all ${
                p.popular
                  ? "bg-[color:var(--charcoal)] text-[color:var(--cream)] border-transparent shadow-[var(--shadow-luxe)] md:-translate-y-3"
                  : "bg-card border-border"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.24em] bg-[color:var(--gold)] text-[color:var(--charcoal)] px-3 py-1 rounded-full">
                  Most Loved
                </span>
              )}
              <h3 className="font-display text-3xl">{p.name}</h3>
              <p className={`mt-2 text-sm ${p.popular ? "text-white/60" : "text-muted-foreground"}`}>{p.tagline}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl">₹{p.price.toLocaleString("en-IN")}</span>
              </div>
              <ul className="mt-8 space-y-3.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center ${p.popular ? "bg-[color:var(--gold)] text-[color:var(--charcoal)]" : "bg-secondary text-[color:var(--gold)]"}`}>
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/book"
                className={`mt-10 w-full justify-center ${p.popular ? "btn-gold !bg-[color:var(--gold)] !text-[color:var(--charcoal)] hover:!bg-[color:var(--cream)]" : "btn-ghost-luxe"} flex`}
              >
                Choose {p.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
