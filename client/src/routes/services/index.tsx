import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { servicesData } from "@/data/servicesData";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Our Services · Look's Hub" },
      { name: "description", content: "Explore the complete collection of luxury salon and wellness services at Look's Hub." },
    ],
  }),
  component: ServicesIndexPage,
});

function ServicesIndexPage() {
  return (
    <div className="min-h-screen bg-[color:var(--cream)] text-[color:var(--charcoal)] pb-24 md:pb-0">
      <Navbar />
      <main className="pt-32 pb-24">
        {/* Subtle luxury texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(197, 160, 89, 0.2) 0%, transparent 50%)",
          }} />
        </div>

        <div className="container-luxe relative z-10">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 max-w-3xl"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-[color:var(--gold)] inline-block" />
              THE COMPLETE COLLECTION
            </p>
            <h1 className="font-display text-4xl md:text-6xl leading-tight font-light tracking-tight mb-8 text-[color:var(--charcoal)]">
              Our Premium Services
            </h1>
            <p className="text-base md:text-lg text-[color:var(--charcoal)]/70 leading-relaxed max-w-2xl font-light">
              Step into a sanctuary of beauty and refinement. Browse our handpicked selections of hair, skin, and grooming rituals. Each service is customizable and delivered by our elite artisans.
            </p>
          </motion.header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {servicesData.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group flex flex-col bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-2xl overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all duration-500"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-[color:var(--charcoal)]/5">
                  <div className="absolute inset-0 bg-[color:var(--gold)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 z-20 text-[10px] uppercase tracking-widest bg-[color:var(--charcoal)] text-[color:var(--cream)] px-3 py-1.5 rounded-full font-semibold">
                    {service.category}
                  </span>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h3 className="font-display text-2xl font-light tracking-tight mb-3 text-[color:var(--charcoal)] group-hover:text-[color:var(--gold)] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[color:var(--charcoal)]/75 leading-relaxed font-light mb-6 flex-1 line-clamp-3">
                    {service.shortDescription}
                  </p>

                  <div className="flex items-center justify-between border-t border-[color:var(--charcoal)]/10 pt-4 mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold">
                        Starting Price
                      </span>
                      <span className="text-xl font-light text-[color:var(--gold)]">
                        ₹{service.startingPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold">
                        Duration
                      </span>
                      <span className="text-sm font-light text-[color:var(--charcoal)]/80">
                        {service.duration}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/services/$serviceId"
                    params={{ serviceId: service.id }}
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[color:var(--charcoal)] text-[color:var(--cream)] hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 font-semibold text-xs tracking-wider uppercase"
                  >
                    Explore Details
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
