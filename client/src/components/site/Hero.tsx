import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Star, Users, Sparkles, ArrowRight } from "lucide-react";
import heroSection from "@/assets/images/hero-section.png";
import { salonName, salonRating, salonReviewCount } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-black">
      {/* Fullscreen background image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={heroSection}
          alt="Luxury salon interior"
          className="w-full h-full object-cover object-center"
        />
        {/* Cinematic dark overlay gradient on the left, lighter/clear on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
      </div>

      <div className="container-luxe relative z-10 w-full pt-32 pb-20 md:pb-28">
        <div className="max-w-2xl text-left text-white">
          {/* Rating Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
          >
            <div className="flex gap-0.5 text-[color:var(--gold)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} className="fill-[color:var(--gold)]" />
              ))}
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/90">
              {salonRating} ({salonReviewCount} reviews)
            </span>
          </motion.div>

          {/* Small Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold flex items-center gap-3"
          >
            <span className="w-8 h-[1px] bg-[color:var(--gold)] inline-block" />
            {salonName.toUpperCase()} · INDORE'S PREMIER SALON
          </motion.p>

          {/* Large Serif Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-6 font-display text-[44px] leading-[1.05] md:text-7xl font-light tracking-wide"
          >
            Expert care for<br />
            every strand &<br />
            <em className="text-[color:var(--gold)] not-italic font-normal">every moment.</em>
          </motion.h1>

          {/* Elegant descriptive paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-8 max-w-lg text-sm md:text-base text-white/70 leading-relaxed font-light"
          >
            A welcoming space where expert stylists and friendly staff create personalized beauty experiences. From precision cuts to complete transformations—all with genuine care.
          </motion.p>

          {/* Premium CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link to="/book" className="bg-white text-black hover:bg-[color:var(--gold)] hover:text-black rounded-full px-8 py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.1)] flex items-center gap-2 group">
              Book Appointment
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#services" className="border border-white/30 hover:border-white text-white rounded-full px-8 py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-300 hover:bg-white/5">
              Explore Services
            </a>
          </motion.div>

          {/* Bottom Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="mt-16 md:mt-24 border-t border-white/10 pt-8 grid grid-cols-3 gap-6 max-w-xl"
          >
            <StatItem icon={<Star size={14} className="text-[color:var(--gold)]" />} value="4.9" label="AVG. RATING" />
            <StatItem icon={<Users size={14} className="text-[color:var(--gold)]" />} value="5,000+" label="HAPPY GUESTS" />
            <StatItem icon={<Sparkles size={14} className="text-[color:var(--gold)]" />} value="Expert" label="STYLISTS" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-display text-lg md:text-xl font-medium text-white">{value}</span>
      </div>
      <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 font-semibold">{label}</span>
    </div>
  );
}
