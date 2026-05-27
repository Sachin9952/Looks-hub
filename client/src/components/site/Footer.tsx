import { Instagram, Phone, MapPin } from "lucide-react";
import { salonName, salonInstagram, salonPhone, salonAddress } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-[color:var(--charcoal)] text-[color:var(--cream)] mt-32">
      <div className="container-luxe py-20 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-3xl">{salonName}<span className="text-[color:var(--gold)]">·</span>Salon</h3>
          <p className="mt-4 max-w-sm text-sm text-white/60 leading-relaxed">
            Your trusted salon for premium hair, skin, and grooming services in Indore. Expert stylists and warm hospitality await you.
          </p>
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40 mb-3">Connect with us</p>
            <div className="flex gap-3">
              <a 
                href={salonInstagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 grid place-items-center rounded-full border border-white/15 hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] hover:bg-[color:var(--gold)]/10 transition-all"
              >
                <Instagram size={16} />
              </a>
              <a 
                href={`tel:${salonPhone}`}
                className="w-10 h-10 grid place-items-center rounded-full border border-white/15 hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] hover:bg-[color:var(--gold)]/10 transition-all"
              >
                <Phone size={16} />
              </a>
              <a 
                href="#contact"
                className="w-10 h-10 grid place-items-center rounded-full border border-white/15 hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] hover:bg-[color:var(--gold)]/10 transition-all"
              >
                <MapPin size={16} />
              </a>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Explore</p>
          <ul className="mt-5 space-y-3 text-sm text-white/80">
            <li><a href="#services" className="hover:text-[color:var(--gold)] transition-colors">Services</a></li>
            <li><a href="#artists" className="hover:text-[color:var(--gold)] transition-colors">Our Team</a></li>
            <li><a href="#pricing" className="hover:text-[color:var(--gold)] transition-colors">Packages</a></li>
            <li><a href="#testimonials" className="hover:text-[color:var(--gold)] transition-colors">Reviews</a></li>
            <li><a href="#contact" className="hover:text-[color:var(--gold)] transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Visit</p>
          <p className="mt-5 text-sm text-white/80 leading-relaxed">
            Indore, Madhya Pradesh<br />Open · 10:00 AM — 9:00 PM<br />Daily
          </p>
          <a href={`tel:${salonPhone}`} className="mt-6 inline-flex items-center gap-2 text-sm text-[color:var(--gold)] hover:text-[color:var(--gold)]/80 transition-colors">
            <Phone size={14} /> {salonPhone}
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {salonName}. Crafted with care.</p>
          <p>Privacy · Terms · Booking Policy</p>
        </div>
      </div>
    </footer>
  );
}
