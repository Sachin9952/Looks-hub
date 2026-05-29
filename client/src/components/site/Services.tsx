import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { servicesData } from "@/data/servicesData";

export function Services() {
  // Show only 3 featured services: Haircut, Spa, Color
  const featuredServices = [
    servicesData.find((s) => s.id === "haircut"),
    servicesData.find((s) => s.id === "spa"),
    servicesData.find((s) => s.id === "color"),
  ].filter(Boolean) as typeof servicesData;

  const serviceLabels = [
    "Signature Hair Artistry",
    "Rejuvenating Treatments",
    "Restoration Rituals",
  ];

  return (
    <section id="services" className="relative py-20 md:py-32 bg-[color:var(--cream)] text-[color:var(--charcoal)]">
      {/* Subtle luxury texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(197, 160, 89, 0.2) 0%, transparent 50%)",
        }} />
      </div>

      <div className="container-luxe relative z-10">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 md:mb-32 max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-[color:var(--gold)] inline-block" />
            LOOK'S HUB COLLECTIONS
          </p>
          <h2 className="font-display text-4xl md:text-6xl leading-tight font-light tracking-tight mb-8 text-[color:var(--charcoal)]">
            Signature Experiences
          </h2>
          <p className="text-base md:text-lg text-[color:var(--charcoal)]/70 leading-relaxed max-w-2xl font-light">
            A curated selection of our most loved beauty and grooming experiences.
          </p>
        </motion.header>

        {/* Editorial Services Grid */}
        <div className="space-y-28 md:space-y-40">
          {featuredServices.map((service, idx) => {
            const isEven = idx % 2 === 0;
            const serviceNumber = String(idx + 1).padStart(2, "0");

            return (
              <motion.section
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
              >
                {/* Image Container */}
                <div
                  className={`md:col-span-7 group relative overflow-hidden rounded-lg ${
                    isEven ? "md:col-start-1" : "md:col-start-6"
                  } ${!isEven && "md:order-2"}`}
                >
                  <div className="absolute inset-0 bg-[color:var(--gold)]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      idx === 1
                        ? "aspect-[3/4] md:aspect-[4/5]"
                        : "aspect-[4/3] md:aspect-[4/3]"
                    }`}
                  />
                </div>

                {/* Content Container */}
                <div
                  className={`md:col-span-5 flex flex-col justify-center ${
                    isEven ? "md:col-start-9" : "md:col-start-1"
                  } ${isEven && "md:order-2"}`}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold mb-4"
                  >
                    {serviceNumber} / {serviceLabels[idx]}
                  </motion.span>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                    className="font-display text-3xl md:text-4xl font-light tracking-tight mb-5 leading-tight text-[color:var(--charcoal)]"
                  >
                    {service.title}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-sm md:text-base text-[color:var(--charcoal)]/70 leading-relaxed mb-6 max-w-md font-light"
                  >
                    {service.shortDescription}
                  </motion.p>

                  {/* Price & Duration */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25, duration: 0.6 }}
                    className="flex items-end justify-between border-b border-[color:var(--charcoal)]/20 pb-4 mb-7"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-widest text-[color:var(--charcoal)]/50 font-semibold">
                        Starting From
                      </span>
                      <span className="text-2xl md:text-3xl font-light text-[color:var(--gold)]">
                        ₹{service.startingPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase tracking-widest text-[color:var(--charcoal)]/50 font-semibold block mb-1">
                        Duration
                      </span>
                      <span className="text-base md:text-lg text-[color:var(--charcoal)]/80 font-light">
                        {service.duration}
                      </span>
                    </div>
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <Link
                      to="/book"
                      search={{ service: service.id }}
                      className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal)] hover:bg-[color:var(--gold-soft)] transition-all duration-300 font-semibold text-sm tracking-wide uppercase flex-1 sm:flex-none"
                    >
                      Book Service
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                    <Link
                      to="/services/$serviceId"
                      params={{ serviceId: service.id }}
                      className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)]/60 text-[color:var(--charcoal)]/80 hover:text-[color:var(--charcoal)] transition-all duration-300 font-semibold text-sm tracking-wide uppercase flex-1 sm:flex-none"
                    >
                      Explore Details
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </motion.div>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 pt-20 border-t border-[color:var(--charcoal)]/10 text-center"
        >
          <p className="text-sm text-[color:var(--charcoal)]/60 mb-6">Experience our complete collection</p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[color:var(--charcoal)] text-[color:var(--cream)] hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 font-semibold text-sm tracking-widest uppercase group"
          >
            View All Services
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
