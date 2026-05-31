import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { salonName } from "@/lib/data";

const links = [
  { label: "Home", to: "/", hash: "", isRoute: true },
  { label: "Services", to: "/", hash: "#services" },
  { label: "Reviews", to: "/", hash: "#testimonials" },
  { label: "Gallery", to: "/", hash: "#gallery" },
  { label: "My Bookings", to: "/account/bookings", hash: "", isRoute: true },
  { label: "Contact", to: "/", hash: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-background/80 border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="container-luxe flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className={`font-display text-2xl tracking-wide transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>{salonName}<span className="text-[color:var(--gold)]">·</span>Salon</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.filter(l => l.label !== "My Bookings").map((l) => 
            l.isRoute ? (
              <Link
                key={l.label}
                to={l.to}
                className={`text-[12px] tracking-[0.18em] uppercase transition-colors ${
                  scrolled ? "text-foreground/80 hover:text-[color:var(--gold)]" : "text-white/80 hover:text-[color:var(--gold)]"
                }`}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={`${l.to}${l.hash}`}
                className={`text-[12px] tracking-[0.18em] uppercase transition-colors ${
                  scrolled ? "text-foreground/80 hover:text-[color:var(--gold)]" : "text-white/80 hover:text-[color:var(--gold)]"
                }`}
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-6">
          <Link
            to="/account/bookings"
            className={`hidden md:inline-flex text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 font-medium ${
              scrolled
                ? "text-foreground/80 hover:text-[color:var(--gold)]"
                : "text-white/80 hover:text-[color:var(--gold)]"
            }`}
          >
            My Bookings
          </Link>
          <Link
            to="/book"
            className={`hidden md:inline-flex rounded-full py-2.5 px-5.5 text-[11px] tracking-[0.18em] uppercase transition-all duration-300 ${
              scrolled
                ? "btn-gold"
                : "bg-white text-black hover:bg-white/90 shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
            }`}
          >
            Book Now
          </Link>
          <button
            aria-label="Menu"
            className={`lg:hidden p-2 rounded-full border transition-colors ${
              scrolled ? "border-border text-foreground" : "border-white/20 text-white"
            }`}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="container-luxe py-6 flex flex-col gap-4">
              {links.map((l) => 
                l.isRoute ? (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="text-sm tracking-[0.18em] uppercase py-2 border-b border-border/60"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={`${l.to}${l.hash}`}
                    onClick={() => setOpen(false)}
                    className="text-sm tracking-[0.18em] uppercase py-2 border-b border-border/60"
                  >
                    {l.label}
                  </a>
                )
              )}
              <Link to="/book" onClick={() => setOpen(false)} className="btn-gold mt-2 justify-center">
                Book Appointment
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
