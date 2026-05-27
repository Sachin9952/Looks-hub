import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import offer from "@/assets/offer-bridal.jpg";

export function Offer() {
  return (
    <section className="py-12">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative overflow-hidden rounded-[2rem] grid md:grid-cols-2 bg-[color:var(--charcoal)] text-[color:var(--cream)]"
        >
          <div className="relative min-h-[320px] md:min-h-[480px]">
            <img src={offer} alt="Premium salon services" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--charcoal)]/60 to-transparent md:bg-gradient-to-l" />
          </div>
          <div className="p-10 md:p-16 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)]">Special Offer · Look's Hub</p>
            <h3 className="mt-5 font-display text-4xl md:text-5xl leading-tight">
              Premium Grooming Package
            </h3>
            <p className="mt-5 text-white/70 max-w-md">
              Experience complete transformation with our expert stylists. Hair care, skin treatment, and professional grooming—all designed for your confidence.
            </p>
            <Link to="/book" className="mt-10 inline-flex items-center gap-2 self-start rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal)] px-7 py-3.5 text-sm tracking-wide hover:bg-[color:var(--cream)] transition-colors">
              Book Now <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
