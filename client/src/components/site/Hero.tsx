import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Star, Users, Sparkles, ArrowRight, Clock, MapPin } from "lucide-react";
import heroSection from "@/assets/images/hero-section.png";
import { salonName, salonRating, salonReviewCount } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-black">
      {/* Fullscreen background image with subtle zoom animation */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={heroSection}
          alt="Luxury salon interior"
          className="w-full h-full object-cover object-center animate-subtle-zoom"
        />
        {/* Refined overlay gradient - slightly lighter to reveal more detail */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
      </div>

      <div className="container-luxe relative z-10 w-full pt-20 pb-20 md:pb-28">
        {/* Subtle Glass Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-fit px-4 md:px-6 py-3 rounded-full bg-white/8 backdrop-blur-md border border-white/15 flex items-center gap-6 md:gap-8"
        >
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Services", hash: "#services" },
              { label: "Gallery", hash: "#gallery" },
              { label: "Team", hash: "#artists" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.hash}
                className="text-xs uppercase tracking-[0.16em] text-white/70 hover:text-[color:var(--gold)] transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>
        </motion.nav>

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

          {/* Eyebrow with consistent muted gold accent */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-7 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold flex items-center gap-3"
          >
            <span className="w-8 h-[1px] bg-[color:var(--gold)] inline-block" />
            {salonName.toUpperCase()} · INDORE'S PREMIER SALON
          </motion.p>

          {/* Enhanced Heading with improved typography rhythm */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-8 font-display text-[2.75rem] leading-[1.1] md:text-7xl font-light tracking-wide md:mt-10"
          >
            Where beauty meets<br />
            <em className="text-[color:var(--gold)] not-italic font-normal">expertise.</em>
          </motion.h1>

          {/* Paragraph with limited width (≈500px) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-8 max-w-md text-sm md:text-base text-white/75 leading-[1.7] font-light"
          >
            Experience personalized beauty and grooming services delivered by expert stylists in a welcoming, luxury environment designed to help you look and feel your best.
          </motion.p>

          {/* Strengthened CTA Hierarchy with dominant primary button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:mt-12"
          >
            <Link 
              to="/book" 
              className="bg-white text-black hover:bg-[color:var(--gold)] hover:text-black rounded-full px-9 py-4 text-xs md:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-[0_8px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_32px_rgba(255,255,255,0.2)] flex items-center justify-center md:justify-start gap-2.5 group flex-1 sm:flex-none"
            >
              Book Appointment
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a 
              href="#services" 
              className="border border-white/40 hover:border-white/70 text-white rounded-full px-8 py-4 text-xs md:text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:bg-white/8 hover:backdrop-blur-sm flex items-center justify-center flex-1 sm:flex-none"
            >
              Explore Services
            </a>
          </motion.div>

          {/* Bottom Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="mt-16 md:mt-20 border-t border-white/10 pt-8 grid grid-cols-3 gap-6 max-w-xl"
          >
            <StatItem icon={<Star size={14} className="text-[color:var(--gold)]" />} value="4.9" label="AVG. RATING" />
            <StatItem icon={<Users size={14} className="text-[color:var(--gold)]" />} value="5,000+" label="HAPPY GUESTS" />
            <StatItem icon={<Sparkles size={14} className="text-[color:var(--gold)]" />} value="Expert" label="STYLISTS" />
          </motion.div>
        </div>

        {/* Floating Trust Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="hidden md:block absolute bottom-16 md:bottom-20 right-6 md:right-10 w-72 md:w-80 px-6 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_12px_48px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[color:var(--gold)]/20 flex items-center justify-center">
              <Clock size={18} className="text-[color:var(--gold)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white tracking-tight">Open Today</h3>
              <p className="text-xs text-white/60 mt-1">10 AM – 9 PM</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[color:var(--gold)]/20 flex items-center justify-center">
              <MapPin size={18} className="text-[color:var(--gold)]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/60">Silicon City</p>
              <p className="text-sm font-medium text-white tracking-tight">Indore</p>
            </div>
          </div>
        </motion.div>
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
